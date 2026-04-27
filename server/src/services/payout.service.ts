import mongoose from "mongoose";
import { Company } from "../models/Company.js";
import { Payout } from "../models/Payout.js";
import { Transaction } from "../models/Transaction.js";
import { walletService } from "./wallet.service.js";
import { userPersistenceService } from "./user.persistence.service.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreatePayoutInput,
  PayoutDecisionInput,
  PayoutListQueryInput,
} from "../validators/payout.validator.js";

type OwnerContext = {
  ownerId: mongoose.Types.ObjectId;
  ownerType: "User" | "Company";
  currency: string;
};

export class PayoutService {
  private async resolveOwnerByAuthUser(
    authUserId: string,
    input?: { ownerType?: "User" | "Company" },
  ): Promise<OwnerContext> {
    const preferred = input?.ownerType;

    if (preferred === "Company") {
      const company = await Company.findOne({ authUserId }).select("_id").lean();
      if (!company?._id) {
        throw ApiError.notFound("Company account not found for this user");
      }
      return { ownerId: company._id, ownerType: "Company", currency: "ETB" };
    }

    if (preferred === "User") {
      const user = await userPersistenceService.findByAuthId(authUserId);
      if (!user?._id) {
        throw ApiError.notFound("Authenticated owner account was not found");
      }
      return { ownerId: user._id, ownerType: "User", currency: "ETB" };
    }

    const [user, company] = await Promise.all([
      userPersistenceService.findByAuthId(authUserId),
      Company.findOne({ authUserId }).select("_id").lean(),
    ]);

    if (company?._id) return { ownerId: company._id, ownerType: "Company", currency: "ETB" };

    if (!user?._id) {
      throw ApiError.notFound("Authenticated owner account was not found");
    }

    return { ownerId: user._id, ownerType: "User", currency: "ETB" };
  }

  async createPayoutRequest(authUserId: string, input: CreatePayoutInput) {
    const owner = await this.resolveOwnerByAuthUser(
      authUserId,
      input.ownerType ? { ownerType: input.ownerType } : undefined,
    );
    const wallet = await walletService.getWalletByOwner(owner.ownerId, owner.ownerType);
    const available = wallet?.availableBalance || 0;

    if (input.amount > available) {
      throw ApiError.unprocessable("Requested amount exceeds available balance");
    }

    const releaseTransaction = await Transaction.findOne({
      bookingId: input.bookingId,
      receiverId: owner.ownerId,
      receiverModel: owner.ownerType,
      type: "ESCROW_RELEASE",
      status: "COMPLETED",
    })
      .select("_id amount")
      .lean();
    if (!releaseTransaction) {
      throw ApiError.unprocessable(
        "No released escrow transaction found for the selected booking",
      );
    }

    const payout = await Payout.create({
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
      amount: input.amount,
      currency: owner.currency,
      status: "PENDING",
      payoutMethod: input.payoutMethod || undefined,
      metadata: input.metadata || undefined,
      transactionIds: [releaseTransaction._id],
    });

    return payout.toJSON();
  }

  async listMyPayouts(authUserId: string, query: PayoutListQueryInput) {
    const owner = await this.resolveOwnerByAuthUser(
      authUserId,
      query.ownerType ? { ownerType: query.ownerType } : undefined,
    );
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = {
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
    };
    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      Payout.find(filter as any)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payout.countDocuments(filter as any),
    ]);

    return {
      payouts: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async listAdminPayouts(query: PayoutListQueryInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = {};
    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      Payout.find(filter as any)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payout.countDocuments(filter as any),
    ]);

    return {
      payouts: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async decidePayout(payoutId: string, input: PayoutDecisionInput) {
    if (input.status === "fail") {
      const payout = await Payout.findById(payoutId);
      if (!payout) {
        throw ApiError.notFound("Payout request not found");
      }
      if (payout.status !== "PENDING") {
        throw ApiError.unprocessable("Only pending payouts can be reviewed");
      }
      payout.status = "FAILED";
      payout.failureReason = input.failureReason || "Marked as failed by admin";
      payout.processedAt = new Date();
      await payout.save();
      return payout.toJSON();
    }

    const session = await mongoose.startSession();
    try {
      let response: Record<string, unknown> | null = null;

      await session.withTransaction(async () => {
        const payout = await Payout.findById(payoutId).session(session);
        if (!payout) {
          throw ApiError.notFound("Payout request not found");
        }

        if (payout.status !== "PENDING") {
          throw ApiError.unprocessable("Only pending payouts can be reviewed");
        }

        payout.status = "PROCESSING";
        payout.processedAt = new Date();
        await payout.save({ session });

        await walletService.debitAvailableForPayout({
          ownerId: payout.ownerId as unknown as mongoose.Types.ObjectId,
          ownerType: payout.ownerType,
          amount: payout.amount,
          payoutId: payout._id as unknown as mongoose.Types.ObjectId,
          idempotencyKey: `payout:${payout.id}:debit`,
          currency: payout.currency,
          session,
        });

        payout.status = "PAID";
        payout.paidAt = new Date();
        payout.gatewayReference = input.gatewayReference || payout.gatewayReference;
        await payout.save({ session });

        response = payout.toJSON();
      });

      if (!response) {
        throw ApiError.internal("Payout approval completed without a response payload");
      }
      return response;
    } finally {
      await session.endSession();
    }
  }
}

export const payoutService = new PayoutService();
