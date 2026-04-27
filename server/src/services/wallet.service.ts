import mongoose, { type ClientSession } from "mongoose";
import { Booking, type BookingDocument } from "../models/Booking.js";
import { Transaction } from "../models/Transaction.js";
import { Vehicle } from "../models/Vehicle.js";
import { Wallet, type WalletDocument, type WalletOwnerType } from "../models/Wallet.js";
import { WalletEntry } from "../models/WalletEntry.js";
import { Payout } from "../models/Payout.js";
import { ApiError } from "../utils/ApiError.js";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

type WalletOwner = {
  ownerId: mongoose.Types.ObjectId;
  ownerType: WalletOwnerType;
  currency: string;
};

export class WalletService {
  /**
   * Backfills missing escrow holds for any PAID bookings
   * belonging to the given owner (User/Company).
   *
   * This protects against cases where payment verification succeeded
   * but wallet/entry creation failed transiently, or older bookings
   * exist before wallets were introduced.
   */
  async reconcilePaidBookingsForOwner(input: {
    ownerId: mongoose.Types.ObjectId;
    ownerType: WalletOwnerType;
    limit?: number;
  }) {
    const vehicles = await Vehicle.find({
      ownerId: input.ownerId,
      ownerType: input.ownerType,
    })
      .select("_id")
      .lean();

    if (!vehicles.length) return { scanned: 0, updated: 0 };

    const vehicleIds = vehicles.map((v) => v._id);
    const bookings = await Booking.find({
      vehicleId: { $in: vehicleIds },
      "payment.status": "PAID",
      status: { $in: ["CONFIRMED", "ACTIVE", "COMPLETED"] },
    })
      .sort({ createdAt: -1 })
      .limit(input.limit ?? 50);

    let updated = 0;
    for (const booking of bookings) {
      // holdEscrowForPaidBooking() is idempotent via WalletEntry idempotencyKey
      const before = await WalletEntry.findOne({
        idempotencyKey: `booking:${booking.id}:escrow-hold`,
      })
        .select("_id")
        .lean();

      await this.holdEscrowForPaidBooking(booking);

      if (!before) {
        updated += 1;
      }
    }

    return { scanned: bookings.length, updated };
  }

  private async resolveOwnerForBooking(
    booking: Pick<BookingDocument, "_id" | "vehicleId" | "priceSnapshot">,
    session?: ClientSession,
  ): Promise<WalletOwner> {
    const vehicle = await Vehicle.findById(booking.vehicleId)
      .select("ownerId ownerType")
      .session(session || null)
      .lean();

    if (!vehicle?.ownerId) {
      throw ApiError.notFound("Vehicle owner not found for booking settlement");
    }

    return {
      ownerId: vehicle.ownerId,
      ownerType: vehicle.ownerType === "Company" ? "Company" : "User",
      currency: booking.priceSnapshot.currency || "ETB",
    };
  }

  private async getOrCreateWallet(
    owner: WalletOwner,
    session: ClientSession,
  ): Promise<WalletDocument> {
    const existing = await Wallet.findOne({
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
    }).session(session);

    if (existing) return existing;

    const created = await new Wallet({
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
      currency: owner.currency,
      pendingBalance: 0,
      availableBalance: 0,
      lifetimeEarned: 0,
      lifetimePaidOut: 0,
      lifetimeRefunded: 0,
    }).save({ session });

    if (!created) {
      throw ApiError.internal("Failed to create wallet");
    }

    return created;
  }

  private async hasWalletEntry(idempotencyKey: string, session: ClientSession) {
    const existing = await WalletEntry.findOne({ idempotencyKey })
      .select("_id")
      .session(session)
      .lean();
    return Boolean(existing);
  }

  async holdEscrowForPaidBooking(booking: BookingDocument) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const idempotencyKey = `booking:${booking.id}:escrow-hold`;
        if (await this.hasWalletEntry(idempotencyKey, session)) {
          return;
        }

        const owner = await this.resolveOwnerForBooking(booking, session);
        const wallet = await this.getOrCreateWallet(owner, session);
        if (!wallet) {
          throw ApiError.internal("Wallet resolution failed");
        }
        const hostEarning = roundMoney(
          booking.priceSnapshot.totalAmount - booking.priceSnapshot.systemCommission,
        );
        if (hostEarning < 0) {
          throw ApiError.unprocessable("Host earning cannot be negative");
        }

        const beforePending = wallet.pendingBalance;
        wallet.pendingBalance = roundMoney(wallet.pendingBalance + hostEarning);
        wallet.lifetimeEarned = roundMoney(wallet.lifetimeEarned + hostEarning);
        await wallet.save({ session });

        const escrowTx = await new Transaction({
          bookingId: booking._id,
          payerId: booking.renterId,
          receiverId: owner.ownerId,
          receiverModel: owner.ownerType,
          amount: hostEarning,
          currency: owner.currency,
          type: "ESCROW_HOLD",
          status: "HELD_IN_ESCROW",
          paymentGatewayId: booking.payment.tx_ref,
          metadata: {
            bookingId: booking.bookingId,
            reason: "Payment verified, host earning moved to escrow",
          },
        }).save({ session });
        if (!escrowTx?._id) {
          throw ApiError.internal("Failed to create escrow transaction");
        }

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: owner.ownerId,
          ownerType: owner.ownerType,
          bookingId: booking._id,
          transactionId: escrowTx._id,
          entryType: "ESCROW_HOLD",
          currency: owner.currency,
          amount: hostEarning,
          balanceField: "pendingBalance",
          before: beforePending,
          after: wallet.pendingBalance,
          idempotencyKey,
          metadata: { bookingId: booking.bookingId },
        }).save({ session });

        await new Transaction({
          bookingId: booking._id,
          payerId: booking.renterId,
          receiverModel: "System",
          amount: booking.priceSnapshot.systemCommission,
          currency: owner.currency,
          type: "COMMISSION",
          status: "COMPLETED",
          paymentGatewayId: booking.payment.tx_ref,
          metadata: {
            bookingId: booking.bookingId,
            reason: "Platform commission captured from booking",
          },
        }).save({ session });
      });
    } finally {
      await session.endSession();
    }
  }

  async releaseEscrowForBooking(bookingId: string, source: "COMPLETED" | "ADMIN_OVERRIDE") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) {
          throw ApiError.notFound("Booking not found");
        }

        const idempotencyKey = `booking:${booking.id}:escrow-release`;
        if (await this.hasWalletEntry(idempotencyKey, session)) {
          return;
        }

        const owner = await this.resolveOwnerForBooking(booking, session);
        const wallet = await this.getOrCreateWallet(owner, session);
        if (!wallet) {
          throw ApiError.internal("Wallet resolution failed");
        }
        const hostEarning = roundMoney(
          booking.priceSnapshot.totalAmount - booking.priceSnapshot.systemCommission,
        );

        const beforePending = wallet.pendingBalance;
        const beforeAvailable = wallet.availableBalance;
        wallet.pendingBalance = roundMoney(wallet.pendingBalance - hostEarning);
        wallet.availableBalance = roundMoney(wallet.availableBalance + hostEarning);
        await wallet.save({ session });

        const releaseTx = await new Transaction({
          bookingId: booking._id,
          payerId: booking.renterId,
          receiverId: owner.ownerId,
          receiverModel: owner.ownerType,
          amount: hostEarning,
          currency: owner.currency,
          type: "ESCROW_RELEASE",
          status: "COMPLETED",
          paymentGatewayId: booking.payment.tx_ref,
          metadata: {
            bookingId: booking.bookingId,
            source,
          },
        }).save({ session });
        if (!releaseTx?._id) {
          throw ApiError.internal("Failed to create escrow release transaction");
        }

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: owner.ownerId,
          ownerType: owner.ownerType,
          bookingId: booking._id,
          transactionId: releaseTx._id,
          entryType: "ESCROW_RELEASE",
          currency: owner.currency,
          amount: hostEarning,
          balanceField: "pendingBalance",
          before: beforePending,
          after: wallet.pendingBalance,
          idempotencyKey,
          metadata: {
            movement: "ESCROW_PENDING_DEBIT",
          },
        }).save({ session });

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: owner.ownerId,
          ownerType: owner.ownerType,
          bookingId: booking._id,
          transactionId: releaseTx._id,
          entryType: "ESCROW_RELEASE",
          currency: owner.currency,
          amount: hostEarning,
          balanceField: "availableBalance",
          before: beforeAvailable,
          after: wallet.availableBalance,
          idempotencyKey: `${idempotencyKey}:available-credit`,
          metadata: {
            movement: "ESCROW_AVAILABLE_CREDIT",
          },
        }).save({ session });

        await Transaction.updateMany(
          { bookingId: booking._id, type: "ESCROW_HOLD", status: "HELD_IN_ESCROW" },
          { $set: { status: "COMPLETED" } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async applyRefundReversal(bookingId: string, source: "PENDING" | "AVAILABLE") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) {
          throw ApiError.notFound("Booking not found");
        }

        const idempotencyKey = `booking:${booking.id}:refund-reversal`;
        if (await this.hasWalletEntry(idempotencyKey, session)) {
          return;
        }

        const owner = await this.resolveOwnerForBooking(booking, session);
        const wallet = await this.getOrCreateWallet(owner, session);
        if (!wallet) {
          throw ApiError.internal("Wallet resolution failed");
        }
        const hostEarning = roundMoney(
          booking.priceSnapshot.totalAmount - booking.priceSnapshot.systemCommission,
        );
        const isPending = source === "PENDING";
        const field = isPending ? "pendingBalance" : "availableBalance";
        const before = wallet[field];
        wallet[field] = roundMoney(wallet[field] - hostEarning);
        wallet.lifetimeRefunded = roundMoney(wallet.lifetimeRefunded + hostEarning);
        await wallet.save({ session });

        const refundTx = await new Transaction({
          bookingId: booking._id,
          payerId: booking.renterId,
          receiverId: owner.ownerId,
          receiverModel: owner.ownerType,
          amount: hostEarning,
          currency: owner.currency,
          type: "REFUND_REVERSAL",
          status: "REFUNDED",
          paymentGatewayId: booking.payment.tx_ref,
          metadata: {
            bookingId: booking.bookingId,
            sourceBalance: field,
          },
        }).save({ session });
        if (!refundTx?._id) {
          throw ApiError.internal("Failed to create refund reversal transaction");
        }

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: owner.ownerId,
          ownerType: owner.ownerType,
          bookingId: booking._id,
          transactionId: refundTx._id,
          entryType: "REFUND_DEBIT",
          currency: owner.currency,
          amount: hostEarning,
          balanceField: field,
          before,
          after: wallet[field],
          idempotencyKey,
        }).save({ session });
      });
    } finally {
      await session.endSession();
    }
  }

  async debitAvailableForPayout(input: {
    ownerId: mongoose.Types.ObjectId;
    ownerType: WalletOwnerType;
    amount: number;
    payoutId: mongoose.Types.ObjectId;
    idempotencyKey: string;
    currency?: string;
    session?: ClientSession;
  }) {
    const runDebit = async (session: ClientSession) => {
      if (await this.hasWalletEntry(input.idempotencyKey, session)) {
        return;
      }

      const wallet = await this.getOrCreateWallet(
        {
          ownerId: input.ownerId,
          ownerType: input.ownerType,
          currency: input.currency || "ETB",
        },
        session,
      );
      if (!wallet) {
        throw ApiError.internal("Wallet resolution failed");
      }

      if (wallet.availableBalance < input.amount) {
        throw ApiError.unprocessable("Requested payout exceeds available balance");
      }

      const before = wallet.availableBalance;
      wallet.availableBalance = roundMoney(wallet.availableBalance - input.amount);
      wallet.lifetimePaidOut = roundMoney(wallet.lifetimePaidOut + input.amount);
      await wallet.save({ session });

      const payout = await Payout.findById(input.payoutId).session(session);
      if (!payout) {
        throw ApiError.notFound("Payout request not found");
      }

      // Resolve bookingId from linked transaction if available, otherwise null
      let bookingId: mongoose.Types.ObjectId | undefined;
      if (payout.transactionIds?.length) {
        const sourceTransaction = await Transaction.findById(payout.transactionIds[0])
          .select("bookingId")
          .session(session);
        bookingId = (sourceTransaction?.bookingId as unknown as mongoose.Types.ObjectId) ?? undefined;
      }

      const payoutTx = await new Transaction({
        ...(bookingId ? { bookingId } : {}),
        payerId: input.ownerId,
        receiverModel: "System",
        amount: input.amount,
        currency: payout.currency,
        type: "PAYOUT",
        status: "COMPLETED",
        paymentGatewayId: payout.gatewayReference || undefined,
        metadata: {
          payoutId: payout.id,
          ownerType: input.ownerType,
        },
      }).save({ session });
      if (!payoutTx?._id) {
        throw ApiError.internal("Failed to create payout transaction");
      }

      payout.transactionIds = [...(payout.transactionIds || []), payoutTx._id as any];
      await payout.save({ session });

      await new WalletEntry({
        walletId: wallet._id,
        ownerId: input.ownerId,
        ownerType: input.ownerType,
        payoutId: input.payoutId,
        transactionId: payoutTx._id,
        entryType: "PAYOUT_DEBIT",
        currency: payout.currency,
        amount: input.amount,
        balanceField: "availableBalance",
        before,
        after: wallet.availableBalance,
        idempotencyKey: input.idempotencyKey,
      }).save({ session });
    };

    if (input.session) {
      await runDebit(input.session);
      return;
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await runDebit(session);
      });
    } finally {
      await session.endSession();
    }
  }

  async getWalletByOwner(ownerId: mongoose.Types.ObjectId, ownerType: WalletOwnerType) {
    return Wallet.findOne({ ownerId, ownerType }).lean();
  }

  async getLedgerByOwner(ownerId: mongoose.Types.ObjectId, ownerType: WalletOwnerType) {
    const wallet = await Wallet.findOne({ ownerId, ownerType }).lean();
    if (!wallet) return [];
    return WalletEntry.find({ walletId: wallet._id }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Starts a MongoDB Change Stream to watch for direct database updates to Booking documents.
   * If a booking is marked as COMPLETED directly in the database, this will trigger the escrow release automatically.
   */
  startWatcher() {
    try {
      console.log("[\uD83D\uDC40 Wallet Watcher] Starting database watcher for booking updates...");
      
      Booking.watch([
        {
          $match: {
            operationType: { $in: ["update", "replace"] },
            "updateDescription.updatedFields.status": "COMPLETED",
          },
        },
      ]).on("change", async (change) => {
        try {
          // @ts-ignore
          const bookingId = change.documentKey._id;
          const booking = await Booking.findById(bookingId);
          
          if (booking && booking.status === "COMPLETED" && booking.payment.status === "PAID") {
            console.log(`[\uD83D\uDC40 Wallet Watcher] Detected direct DB update for booking ${booking.id}. Attempting escrow release...`);
            await this.releaseEscrowForBooking(booking.id, "COMPLETED");
          }
        } catch (err) {
          console.error("[\uD83D\uDC40 Wallet Watcher] Error processing change stream event:", err);
        }
      }).on("error", (err) => {
        console.warn("[\uD83D\uDC40 Wallet Watcher] Change streams are not supported in your MongoDB setup (likely a standalone local DB without a replica set). Direct DB updates won't trigger wallet updates automatically.");
      });
    } catch (err) {
      console.warn("[\uD83D\uDC40 Wallet Watcher] Failed to initialize watcher.");
    }
  }
}

export const walletService = new WalletService();
