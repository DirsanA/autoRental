import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Wallet, WalletTransaction, PayoutRequest, PlatformLedger } from "../models/index.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";

type Owner = { ownerId: mongoose.Types.ObjectId; ownerType: "User" | "Company" };

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error != null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function asMoney(value: number) {
  return Math.round(value * 100) / 100;
}

async function getOrCreatePlatformLedger(currency = "ETB", session?: mongoose.ClientSession) {
  const doc = await PlatformLedger.findOneAndUpdate(
    { currency: currency.toUpperCase() },
    { $setOnInsert: { currency: currency.toUpperCase(), totalCollected: 0, totalCommission: 0, totalPaidOut: 0 } },
    { upsert: true, returnDocument: "after", session: session ?? null },
  );
  return doc;
}

export class WalletService {
  async getOrCreateWallet(owner: Owner, session?: mongoose.ClientSession) {
    return Wallet.findOneAndUpdate(
      { ownerId: owner.ownerId, ownerType: owner.ownerType },
      { $setOnInsert: { ownerId: owner.ownerId, ownerType: owner.ownerType, availableBalance: 0, pendingBalance: 0, currency: "ETB" } },
      { upsert: true, returnDocument: "after", session: session ?? null },
    );
  }

  private async resolveBookingOwner(bookingId: mongoose.Types.ObjectId, session?: mongoose.ClientSession): Promise<Owner> {
    const booking = await Booking.findById(bookingId).session(session || null);
    if (!booking) throw ApiError.notFound("Booking not found");

    const vehicle = await Vehicle.findById(booking.vehicleId).session(session || null);
    if (!vehicle) throw ApiError.notFound("Vehicle not found for booking");

    const ownerType = vehicle.ownerType === "Company" ? "Company" : "User";
    return { ownerId: vehicle.ownerId as mongoose.Types.ObjectId, ownerType };
  }

  async creditPendingOnPaymentSuccess(params: {
    bookingId: string;
    txRef: string;
    totalAmount: number;
    systemCommission: number;
    currency?: string;
  }) {
    const session = await mongoose.startSession();
    try {
      const result = await session.withTransaction(async () => {
        const booking = await Booking.findById(params.bookingId).session(session);
        if (!booking) throw ApiError.notFound("Booking not found");

        const owner = await this.resolveBookingOwner(booking._id, session);
        const hostEarning = asMoney(params.totalAmount - params.systemCommission);
        if (hostEarning < 0) throw ApiError.internal("Host earning calculation failed");

        await this.getOrCreateWallet(owner, session);
        await getOrCreatePlatformLedger(params.currency || "ETB", session);

        // Idempotency: only one CREDIT_PENDING per payment tx_ref.
        try {
          await WalletTransaction.create(
            [
              {
                ownerId: owner.ownerId,
                ownerType: owner.ownerType,
                bookingId: booking._id,
                amount: hostEarning,
                currency: params.currency || "ETB",
                type: "CREDIT_PENDING",
                status: "COMPLETED",
                sourceTxRef: params.txRef,
                description: `Escrow credit for booking ${booking.bookingId}`,
              },
            ],
            { session },
          );
        } catch (error) {
          if (isDuplicateKeyError(error)) {
            return { credited: false };
          }
          throw error;
        }

        await Wallet.updateOne(
          { ownerId: owner.ownerId, ownerType: owner.ownerType },
          { $inc: { pendingBalance: hostEarning } },
          { session },
        );

        await PlatformLedger.updateOne(
          { currency: (params.currency || "ETB").toUpperCase() },
          { $inc: { totalCollected: asMoney(params.totalAmount), totalCommission: asMoney(params.systemCommission) } },
          { session },
        );

        return { credited: true, hostEarning };
      });

      return result;
    } finally {
      session.endSession();
    }
  }

  async releaseEscrowOnBookingCompleted(bookingId: string) {
    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(async () => {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) throw ApiError.notFound("Booking not found");

        const owner = await this.resolveBookingOwner(booking._id, session);

        const pendingTx = await WalletTransaction.findOne({
          bookingId: booking._id,
          type: "CREDIT_PENDING",
        }).session(session);

        if (!pendingTx) {
          throw ApiError.unprocessable("Escrow was not credited for this booking yet");
        }

        const amount = pendingTx.amount;

        // Idempotency: only one CREDIT_AVAILABLE per booking.
        const existing = await WalletTransaction.findOne({
          bookingId: booking._id,
          type: "CREDIT_AVAILABLE",
        }).session(session);
        if (existing) {
          return { released: false };
        }

        const wallet = await this.getOrCreateWallet(owner, session);
        if (wallet.pendingBalance < amount) {
          throw ApiError.conflict("Insufficient pending balance to release escrow");
        }

        await Wallet.updateOne(
          { ownerId: owner.ownerId, ownerType: owner.ownerType, pendingBalance: { $gte: amount } },
          { $inc: { pendingBalance: -amount, availableBalance: amount } },
          { session },
        );

        await WalletTransaction.create(
          [
            {
              ownerId: owner.ownerId,
              ownerType: owner.ownerType,
              bookingId: booking._id,
              amount,
              currency: pendingTx.currency,
              type: "CREDIT_AVAILABLE",
              status: "COMPLETED",
              description: `Escrow released for booking ${booking.bookingId}`,
            },
          ],
          { session },
        );

        return { released: true, amount };
      });
    } finally {
      session.endSession();
    }
  }

  async requestPayout(owner: Owner, amount: number) {
    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(async () => {
        const wallet = await this.getOrCreateWallet(owner, session);
        const normalized = asMoney(amount);
        if (normalized <= 0) throw ApiError.unprocessable("Amount must be positive");
        if (wallet.availableBalance < normalized) {
          throw ApiError.conflict("Insufficient available balance");
        }

        const request = await PayoutRequest.create(
          [
            {
              ownerId: owner.ownerId,
              ownerType: owner.ownerType,
              amount: normalized,
              currency: wallet.currency,
              status: "PENDING",
              requestedAt: new Date(),
            },
          ],
          { session },
        );

        return request[0];
      });
    } finally {
      session.endSession();
    }
  }

  async approvePayout(adminUserId: string, payoutRequestId: string) {
    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(async () => {
        const request = await PayoutRequest.findById(payoutRequestId).session(session);
        if (!request) throw ApiError.notFound("Payout request not found");
        if (request.status !== "PENDING") {
          throw ApiError.conflict("Payout request already processed");
        }

        const wallet = await this.getOrCreateWallet(
          {
            ownerId: request.ownerId as unknown as mongoose.Types.ObjectId,
            ownerType: request.ownerType,
          },
          session,
        );

        if (wallet.availableBalance < request.amount) {
          throw ApiError.conflict("Insufficient available balance for payout");
        }

        await Wallet.updateOne(
          { ownerId: request.ownerId, ownerType: request.ownerType, availableBalance: { $gte: request.amount } },
          { $inc: { availableBalance: -request.amount } },
          { session },
        );

        await WalletTransaction.create(
          [
            {
              ownerId: request.ownerId,
              ownerType: request.ownerType,
              amount: request.amount,
              currency: request.currency,
              type: "DEBIT_PAYOUT",
              status: "COMPLETED",
              description: `Payout approved (${request.id})`,
            },
          ],
          { session },
        );

        await getOrCreatePlatformLedger(request.currency, session);
        await PlatformLedger.updateOne(
          { currency: request.currency.toUpperCase() },
          { $inc: { totalPaidOut: request.amount } },
          { session },
        );

        request.status = "APPROVED";
        request.processedAt = new Date();
        request.processedByAuthUserId = adminUserId;
        await request.save({ session });

        return request;
      });
    } finally {
      session.endSession();
    }
  }

  async refundOnBookingCancelled(bookingId: string) {
    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(async () => {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) throw ApiError.notFound("Booking not found");

        const owner = await this.resolveBookingOwner(booking._id, session);

        const pendingTx = await WalletTransaction.findOne({
          bookingId: booking._id,
          type: "CREDIT_PENDING",
        }).session(session);

        if (!pendingTx) {
          // nothing to refund on wallet side
          return { refunded: false };
        }

        // Idempotency: only one REFUND tx per booking.
        const existingRefund = await WalletTransaction.findOne({
          bookingId: booking._id,
          type: "REFUND",
        }).session(session);
        if (existingRefund) return { refunded: false };

        const releaseTx = await WalletTransaction.findOne({
          bookingId: booking._id,
          type: "CREDIT_AVAILABLE",
        }).session(session);

        const amount = pendingTx.amount;
        const fromField = releaseTx ? "availableBalance" : "pendingBalance";

        const wallet = await this.getOrCreateWallet(owner, session);
        if ((fromField === "availableBalance" ? wallet.availableBalance : wallet.pendingBalance) < amount) {
          throw ApiError.conflict("Insufficient balance to refund");
        }

        await Wallet.updateOne(
          { ownerId: owner.ownerId, ownerType: owner.ownerType, [fromField]: { $gte: amount } },
          { $inc: { [fromField]: -amount } },
          { session },
        );

        await WalletTransaction.create(
          [
            {
              ownerId: owner.ownerId,
              ownerType: owner.ownerType,
              bookingId: booking._id,
              amount,
              currency: pendingTx.currency,
              type: "REFUND",
              status: "COMPLETED",
              description: `Refund reversal for cancelled booking ${booking.bookingId}`,
            },
          ],
          { session },
        );

        return { refunded: true, amount, from: fromField };
      });
    } finally {
      session.endSession();
    }
  }
}

export const walletService = new WalletService();

