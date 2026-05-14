import mongoose, { type ClientSession } from "mongoose";
import { Booking, type BookingDocument } from "../models/Booking.js";
import { AccountType, User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { Vehicle } from "../models/Vehicle.js";
import { Wallet, type WalletDocument, type WalletOwnerType } from "../models/Wallet.js";
import { WalletEntry } from "../models/WalletEntry.js";
import { Payout } from "../models/Payout.js";
import { ApiError } from "../utils/ApiError.js";
import { notificationDispatcher } from "./notification.dispatcher.js";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

type WalletOwner = {
  ownerId: mongoose.Types.ObjectId;
  ownerType: WalletOwnerType;
  currency: string;
};

const REFUND_WINDOW_HOURS = 48;

export type WalletSnapshot = {
  ownerType: WalletOwnerType;
  currency: string;
  pendingBalance: number;
  availableBalance: number;
  lifetimeEarned: number;
  lifetimePaidOut: number;
  lifetimeRefunded: number;
};

export class WalletService {
  private buildRenterWalletOwner(booking: Pick<BookingDocument, "renterId" | "priceSnapshot">): WalletOwner {
    return {
      ownerId: booking.renterId as unknown as mongoose.Types.ObjectId,
      ownerType: "User",
      currency: booking.priceSnapshot.currency || "ETB",
    };
  }

  private async releaseHeldDepositFromRenterPendingWallet(input: {
    booking: Pick<BookingDocument, "_id" | "bookingId" | "renterId" | "priceSnapshot" | "securityDepositAmount">;
    transactionId: mongoose.Types.ObjectId;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
    session: ClientSession;
  }) {
    const depositAmount = roundMoney(input.booking.securityDepositAmount || 0);
    if (depositAmount <= 0) {
      return;
    }

    const renterOwner = this.buildRenterWalletOwner(input.booking);
    const wallet = await this.getOrCreateWallet(renterOwner, input.session);
    if (!wallet) {
      throw ApiError.internal("Renter wallet resolution failed");
    }

    const beforePending = wallet.pendingBalance;
    const pendingDebit = Math.min(roundMoney(wallet.pendingBalance), depositAmount);

    if (pendingDebit <= 0) {
      return;
    }

    wallet.pendingBalance = roundMoney(wallet.pendingBalance - pendingDebit);
    await wallet.save({ session: input.session });

    await new WalletEntry({
      walletId: wallet._id,
      ownerId: renterOwner.ownerId,
      ownerType: renterOwner.ownerType,
      bookingId: input.booking._id,
      transactionId: input.transactionId,
      entryType: "DEPOSIT_RELEASE",
      currency: renterOwner.currency,
      amount: pendingDebit,
      balanceField: "pendingBalance",
      before: beforePending,
      after: wallet.pendingBalance,
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
    }).save({ session: input.session });
  }

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

  async reconcileHeldSecurityDepositsForRenter(input: {
    renterId: mongoose.Types.ObjectId;
    limit?: number;
  }) {
    const bookings = await Booking.find({
      renterId: input.renterId,
      "payment.status": "PAID",
      securityDepositAmount: { $gt: 0 },
      depositStatus: { $in: ["HELD_IN_ESCROW", "UNDER_REVIEW"] },
      status: { $in: ["CONFIRMED", "ACTIVE", "COMPLETED", "DISPUTED"] },
    })
      .sort({ createdAt: -1 })
      .limit(input.limit ?? 50);

    let updated = 0;
    for (const booking of bookings) {
      const before = await WalletEntry.findOne({
        idempotencyKey: `booking:${booking.id}:deposit-hold`,
      })
        .select("_id")
        .lean();

      await this.holdSecurityDepositForPaidBooking(booking);

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
        const hostEarning = roundMoney(booking.priceSnapshot.rentalSubtotal || 0);
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
        const hostEarning = roundMoney(booking.priceSnapshot.rentalSubtotal || 0);

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
        const hostEarning = roundMoney(booking.priceSnapshot.rentalSubtotal || 0);
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

  async holdSecurityDepositForPaidBooking(booking: BookingDocument) {
    if ((booking.securityDepositAmount || 0) <= 0) {
      return;
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const idempotencyKey = `booking:${booking.id}:deposit-hold`;
        if (await this.hasWalletEntry(idempotencyKey, session)) {
          return;
        }

        const renterOwner = this.buildRenterWalletOwner(booking);
        const wallet = await this.getOrCreateWallet(renterOwner, session);
        if (!wallet) {
          throw ApiError.internal("Renter wallet resolution failed");
        }

        const depositAmount = roundMoney(booking.securityDepositAmount || 0);
        const beforePending = wallet.pendingBalance;
        wallet.pendingBalance = roundMoney(wallet.pendingBalance + depositAmount);
        await wallet.save({ session });

        let depositTx = await Transaction.findOne({
          bookingId: booking._id,
          type: "COLLATERAL_DEPOSIT",
          paymentGatewayId: booking.payment.tx_ref,
        }).session(session);

        if (!depositTx?._id) {
          depositTx = await new Transaction({
            bookingId: booking._id,
            payerId: booking.renterId,
            receiverModel: "System",
            amount: depositAmount,
            currency: booking.priceSnapshot.currency || "ETB",
            type: "COLLATERAL_DEPOSIT",
            status: "HELD_IN_ESCROW",
            paymentGatewayId: booking.payment.tx_ref,
            metadata: {
              bookingId: booking.bookingId,
              reason: "Self-drive security deposit held in escrow",
            },
          }).save({ session });
        }

        if (!depositTx?._id) {
          throw ApiError.internal("Failed to create deposit hold transaction");
        }

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: renterOwner.ownerId,
          ownerType: renterOwner.ownerType,
          bookingId: booking._id,
          transactionId: depositTx._id,
          entryType: "DEPOSIT_HOLD",
          currency: renterOwner.currency,
          amount: depositAmount,
          balanceField: "pendingBalance",
          before: beforePending,
          after: wallet.pendingBalance,
          idempotencyKey,
          metadata: {
            bookingId: booking.bookingId,
            reason: "Security deposit held by the platform",
          },
        }).save({ session });
      });
    } finally {
      await session.endSession();
    }
  }

  async refundSecurityDepositToRenterWallet(
    bookingId: string,
    source:
      | "CLEAN_RETURN"
      | "ADMIN_COMPLETION"
      | "BOOKING_CANCELLED"
      | "ADMIN_DISPUTE_REFUND"
      | "ADMIN_MANUAL_REFUND",
  ) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) {
          throw ApiError.notFound("Booking not found");
        }

        const depositAmount = roundMoney(booking.securityDepositAmount || 0);
        if (depositAmount <= 0) {
          return;
        }

        const idempotencyKey = `booking:${booking.id}:deposit-refund`;
        const existing = await WalletEntry.findOne({ idempotencyKey })
          .select("_id")
          .session(session)
          .lean();

        if (existing?._id) {
          return;
        }

        const renterOwner = {
          ownerId: booking.renterId as unknown as mongoose.Types.ObjectId,
          ownerType: "User" as const,
          currency: booking.priceSnapshot.currency || "ETB",
        };
        const wallet = await this.getOrCreateWallet(renterOwner, session);
        if (!wallet) {
          throw ApiError.internal("Renter wallet resolution failed");
        }

        const refundTx = await new Transaction({
          bookingId: booking._id,
          payerId: booking.renterId,
          receiverId: booking.renterId,
          receiverModel: "User",
          amount: depositAmount,
          currency: renterOwner.currency,
          type: "REFUND",
          status: "COMPLETED",
          paymentGatewayId: booking.payment.tx_ref,
          metadata: {
            bookingId: booking.bookingId,
            reason: "Security deposit refunded to renter wallet",
            source,
          },
        }).save({ session });

        if (!refundTx?._id) {
          throw ApiError.internal("Failed to create deposit refund transaction");
        }

        await this.releaseHeldDepositFromRenterPendingWallet({
          booking,
          transactionId: refundTx._id,
          idempotencyKey: `${idempotencyKey}:pending-debit`,
          metadata: {
            source,
            movement: "DEPOSIT_PENDING_RELEASE",
          },
          session,
        });

        const beforeAvailable = wallet.availableBalance;
        wallet.availableBalance = roundMoney(wallet.availableBalance + depositAmount);
        await wallet.save({ session });

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: renterOwner.ownerId,
          ownerType: renterOwner.ownerType,
          bookingId: booking._id,
          transactionId: refundTx._id,
          entryType: "DEPOSIT_REFUND",
          currency: renterOwner.currency,
          amount: depositAmount,
          balanceField: "availableBalance",
          before: beforeAvailable,
          after: wallet.availableBalance,
          idempotencyKey,
          metadata: { source },
        }).save({ session });

        await Transaction.updateMany(
          {
            bookingId: booking._id,
            type: "COLLATERAL_DEPOSIT",
            status: "HELD_IN_ESCROW",
          },
          {
            $set: {
              status: "REFUNDED",
            },
          },
          { session },
        );
      });

      // Dispatch notification to renter outside of transaction for performance
      // but only if it's a manual admin refund as requested by user
      if (["ADMIN_DISPUTE_REFUND", "ADMIN_MANUAL_REFUND"].includes(source)) {
        void (async () => {
          try {
            const booking = await Booking.findById(bookingId)
              .select("renterId securityDepositAmount")
              .lean();
            if (booking && booking.renterId) {
              await notificationDispatcher.sendRefundNotification({
                recipientId: booking.renterId.toString(),
                amount: booking.securityDepositAmount || 0,
                bookingId: bookingId,
                reason:
                  source === "ADMIN_DISPUTE_REFUND"
                    ? "Dispute resolution"
                    : "Manual refund by administrator",
              });
            }
          } catch (err) {
            console.error(
              "[WalletService] Failed to dispatch refund notification:",
              err,
            );
          }
        })();
      }
    } finally {
      await session.endSession();
    }
  }

  async releaseSecurityDepositToOwner(input: {
    bookingId: string;
    reason?: string;
    initiatedBy?: string;
  }) {
    const session = await mongoose.startSession();
    try {
      let response:
        | {
            bookingId: string;
            amount: number;
            currency: string;
            ownerType: WalletOwnerType;
          }
        | null = null;

      await session.withTransaction(async () => {
        const booking = await Booking.findById(input.bookingId).session(session);
        if (!booking) {
          throw ApiError.notFound("Booking not found");
        }

        const depositAmount = roundMoney(booking.securityDepositAmount || 0);
        if (depositAmount <= 0) {
          throw ApiError.unprocessable("This booking does not have a held security deposit");
        }

        const idempotencyKey = `booking:${booking.id}:deposit-release-owner`;
        const existing = await WalletEntry.findOne({ idempotencyKey })
          .select("_id")
          .session(session)
          .lean();
        if (existing?._id) {
          throw ApiError.unprocessable("Security deposit was already released to the owner");
        }

        const owner = await this.resolveOwnerForBooking(booking, session);
        const wallet = await this.getOrCreateWallet(owner, session);
        if (!wallet) {
          throw ApiError.internal("Wallet resolution failed");
        }

        const releaseTx = await new Transaction({
          bookingId: booking._id,
          payerId: booking.renterId,
          receiverId: owner.ownerId,
          receiverModel: owner.ownerType,
          amount: depositAmount,
          currency: owner.currency,
          type: "DEPOSIT_RELEASE_TO_OWNER",
          status: "COMPLETED",
          paymentGatewayId: booking.payment.tx_ref,
          metadata: {
            bookingId: booking.bookingId,
            reason: input.reason || "Security deposit released to owner by admin",
            initiatedBy: input.initiatedBy || null,
          },
        }).save({ session });

        if (!releaseTx?._id) {
          throw ApiError.internal("Failed to create owner deposit release transaction");
        }

        await this.releaseHeldDepositFromRenterPendingWallet({
          booking,
          transactionId: releaseTx._id,
          idempotencyKey: `${idempotencyKey}:pending-debit`,
          metadata: {
            movement: "DEPOSIT_OWNER_RELEASE",
            reason: input.reason || null,
          },
          session,
        });

        const beforeAvailable = wallet.availableBalance;
        wallet.availableBalance = roundMoney(wallet.availableBalance + depositAmount);
        await wallet.save({ session });

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: owner.ownerId,
          ownerType: owner.ownerType,
          bookingId: booking._id,
          transactionId: releaseTx._id,
          entryType: "DEPOSIT_RELEASE",
          currency: owner.currency,
          amount: depositAmount,
          balanceField: "availableBalance",
          before: beforeAvailable,
          after: wallet.availableBalance,
          idempotencyKey,
          metadata: { reason: input.reason || null },
        }).save({ session });

        await Transaction.updateMany(
          {
            bookingId: booking._id,
            type: "COLLATERAL_DEPOSIT",
            status: "HELD_IN_ESCROW",
          },
          {
            $set: {
              status: "COMPLETED",
            },
          },
          { session },
        );

        response = {
          bookingId: booking.bookingId,
          amount: depositAmount,
          currency: owner.currency,
          ownerType: owner.ownerType,
        };
      });

      if (!response) {
        throw ApiError.internal("Deposit release completed without a response payload");
      }

      return response;
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

  async getSystemWalletSnapshot(): Promise<WalletSnapshot> {
    const [commissionAgg, heldDepositAgg, adminUsers] = await Promise.all([
      Transaction.aggregate<{ _id: null; total: number }>([
        {
          $match: {
            type: { $in: ["COMMISSION", "SYSTEM_WALLET_REFUND"] },
            status: "COMPLETED",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate<{ _id: null; total: number }>([
        {
          $match: {
            type: "COLLATERAL_DEPOSIT",
            status: "HELD_IN_ESCROW",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      User.find({ accountType: AccountType.ADMIN }).select("_id").lean(),
    ]);

    const adminIds = adminUsers
      .map((user) => user?._id)
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

    const payoutAgg =
      adminIds.length > 0
        ? await Payout.aggregate<{ _id: null; total: number }>([
            {
              $match: {
                ownerType: "User",
                ownerId: { $in: adminIds },
                status: { $in: ["PROCESSING", "PAID"] },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ])
        : [];

    const totalCommission = roundMoney(commissionAgg?.[0]?.total ?? 0);
    const totalHeldDeposits = roundMoney(heldDepositAgg?.[0]?.total ?? 0);
    const totalPaidOut = roundMoney(payoutAgg?.[0]?.total ?? 0);
    const availableBalance = roundMoney(Math.max(totalCommission - totalPaidOut, 0));

    return {
      ownerType: "User",
      currency: "ETB",
      pendingBalance: totalHeldDeposits,
      availableBalance,
      lifetimeEarned: totalCommission,
      lifetimePaidOut: totalPaidOut,
      lifetimeRefunded: 0,
    };
  }

  async refundEscrowToSystemWallet(input: {
    sourceTransactionId: string;
    reason?: string;
    initiatedBy?: string;
  }) {
    const session = await mongoose.startSession();
    try {
      let response:
        | {
            sourceTransactionId: string;
            recoveryTransactionId: string;
            bookingId: string;
            amount: number;
            currency: string;
            ownerType: WalletOwnerType;
          }
        | null = null;

      await session.withTransaction(async () => {
        const sourceTransaction = await Transaction.findById(input.sourceTransactionId).session(session);
        if (!sourceTransaction) {
          throw ApiError.notFound("Escrow transaction not found");
        }

        if (sourceTransaction.type !== "ESCROW_HOLD") {
          throw ApiError.unprocessable("Only escrow-hold transactions can be refunded to the system wallet");
        }

        if (sourceTransaction.status !== "HELD_IN_ESCROW") {
          throw ApiError.unprocessable("This escrow transaction is no longer eligible for system refund");
        }

        if (!sourceTransaction.bookingId) {
          throw ApiError.unprocessable("Escrow transaction is missing its booking reference");
        }

        const booking = await Booking.findById(sourceTransaction.bookingId).session(session);
        if (!booking) {
          throw ApiError.notFound("Booking not found for escrow transaction");
        }

        const idempotencyKey = `transaction:${sourceTransaction.id}:system-wallet-refund`;
        if (await this.hasWalletEntry(idempotencyKey, session)) {
          throw ApiError.unprocessable("This escrow transaction has already been refunded to the system wallet");
        }

        const owner = await this.resolveOwnerForBooking(booking, session);
        const wallet = await this.getOrCreateWallet(owner, session);
        if (!wallet) {
          throw ApiError.internal("Wallet resolution failed");
        }

        const hostEarning = roundMoney(booking.priceSnapshot.rentalSubtotal || 0);

        if (wallet.pendingBalance < hostEarning) {
          throw ApiError.unprocessable("Owner escrow balance is no longer sufficient for this refund");
        }

        const beforePending = wallet.pendingBalance;
        wallet.pendingBalance = roundMoney(wallet.pendingBalance - hostEarning);
        await wallet.save({ session });

        const recoveryTransaction = await new Transaction({
          bookingId: booking._id,
          payerId: owner.ownerId,
          receiverModel: "System",
          amount: hostEarning,
          currency: owner.currency,
          type: "SYSTEM_WALLET_REFUND",
          status: "COMPLETED",
          paymentGatewayId: sourceTransaction.paymentGatewayId || booking.payment.tx_ref,
          metadata: {
            bookingId: booking.bookingId,
            reason: input.reason || "Refunded to system wallet by admin",
            initiatedBy: input.initiatedBy || null,
            recoveredFromOwnerType: owner.ownerType,
            sourceTransactionId: sourceTransaction.id,
            sourceBalance: "pendingBalance",
          },
        }).save({ session });

        if (!recoveryTransaction?._id) {
          throw ApiError.internal("Failed to create system wallet refund transaction");
        }

        await new WalletEntry({
          walletId: wallet._id,
          ownerId: owner.ownerId,
          ownerType: owner.ownerType,
          bookingId: booking._id,
          transactionId: recoveryTransaction._id,
          entryType: "ADJUSTMENT",
          currency: owner.currency,
          amount: hostEarning,
          balanceField: "pendingBalance",
          before: beforePending,
          after: wallet.pendingBalance,
          idempotencyKey,
          metadata: {
            movement: "SYSTEM_WALLET_REFUND",
            sourceTransactionId: sourceTransaction.id,
            reason: input.reason || null,
          },
        }).save({ session });

        const existingMetadata =
          typeof sourceTransaction.metadata === "object" && sourceTransaction.metadata
            ? (sourceTransaction.metadata as unknown as Record<string, unknown>)
            : {};

        sourceTransaction.status = "REFUNDED";
        sourceTransaction.set("metadata", {
          ...existingMetadata,
          systemWalletRefundAt: new Date().toISOString(),
          systemWalletRefundTransactionId: recoveryTransaction.id,
          systemWalletRefundReason: input.reason || null,
        });
        await sourceTransaction.save({ session });

        response = {
          sourceTransactionId: sourceTransaction.id,
          recoveryTransactionId: recoveryTransaction.id,
          bookingId: booking.bookingId,
          amount: hostEarning,
          currency: owner.currency,
          ownerType: owner.ownerType,
        };
      });

      if (!response) {
        throw ApiError.internal("System wallet refund completed without a response payload");
      }

      return response;
    } finally {
      await session.endSession();
    }
  }

  async getLedgerByOwner(ownerId: mongoose.Types.ObjectId, ownerType: WalletOwnerType) {
    const wallet = await Wallet.findOne({ ownerId, ownerType }).lean();
    if (!wallet) return [];
    return WalletEntry.find({ walletId: wallet._id }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Automatically refunds security deposits for bookings that were completed
   * more than 48 hours ago and have no reported issues.
   */
  async processAutomaticDepositRefunds() {
    try {
      const threshold = new Date();
      threshold.setHours(threshold.getHours() - REFUND_WINDOW_HOURS);

      const eligibleBookings = await Booking.find({
        status: "COMPLETED",
        depositStatus: "HELD_IN_ESCROW",
        returnCondition: "CLEAN", // Only auto-refund if everything is clean
        $or: [
          { actualReturnTime: { $lte: threshold } },
          { 
            actualReturnTime: { $exists: false },
            returnConfirmedAt: { $lte: threshold }
          },
          {
            actualReturnTime: { $exists: false },
            returnConfirmedAt: { $exists: false },
            updatedAt: { $lte: threshold }
          }
        ]
      }).limit(100);

      if (eligibleBookings.length > 0) {
        console.log(`[\uD83D\uDCAA Wallet Service] Found ${eligibleBookings.length} bookings eligible for automatic deposit refund.`);
      }

      for (const booking of eligibleBookings) {
        try {
          await this.refundSecurityDepositToRenterWallet(booking.id, "CLEAN_RETURN");
          booking.depositStatus = "REFUNDED_TO_RENTER";
          await booking.save();
          console.log(`[\u2705 Wallet Service] Auto-refunded deposit for booking ${booking.bookingId}`);
        } catch (err) {
          console.error(`[\u274C Wallet Service] Failed to auto-refund deposit for booking ${booking.bookingId}:`, err);
        }
      }
    } catch (err) {
      console.error("[\u274C Wallet Service] Error in processAutomaticDepositRefunds:", err);
    }
  }

  /**
   * Starts a MongoDB Change Stream to watch for direct database updates to Booking documents.
   * If a booking is marked as COMPLETED directly in the database, this will trigger the escrow release automatically.
   */
  startWatcher() {
    try {
      console.log("[\uD83D\uDC40 Wallet Watcher] Starting database watcher for booking updates...");
      
      // Run automatic refunds every hour
      setInterval(() => {
        void this.processAutomaticDepositRefunds();
      }, 60 * 60 * 1000);

      // Also run immediately on start
      void this.processAutomaticDepositRefunds();

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
