import mongoose from "mongoose";
import { Company } from "../models/Company.js";
import { Payout } from "../models/Payout.js";
import { Transaction } from "../models/Transaction.js";
import { walletService } from "./wallet.service.js";
import { chapaService } from "./chapa.service.js";
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

  private async resolveAccountName(
    owner: OwnerContext,
    authUserId: string,
    providedName?: string,
  ): Promise<string> {
    if (providedName) return providedName;

    if (owner.ownerType === "Company") {
      const company = await Company.findById(owner.ownerId).select("name").lean();
      return (company as any)?.name || "Account Holder";
    }

    const user = await userPersistenceService.findByAuthId(authUserId);
    const name = user?.name
      || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
      || "Account Holder";
    return name;
  }

  async createPayoutRequest(authUserId: string, input: CreatePayoutInput) {
    const owner = await this.resolveOwnerByAuthUser(
      authUserId,
      input.ownerType ? { ownerType: input.ownerType } : undefined,
    );
    const wallet = await walletService.getWalletByOwner(owner.ownerId, owner.ownerType);
    const available = wallet?.availableBalance || 0;

    if (input.amount < 500) {
      throw ApiError.unprocessable("Minimum withdrawal amount is 500 ETB");
    }

    if (input.amount > available) {
      throw ApiError.unprocessable("Requested amount exceeds available balance");
    }

    // Resolve user details for checkout
    const user = await userPersistenceService.findByAuthId(authUserId);
    const email = user?.email || "user@example.com";
    const name = user?.name || "Account Holder";

    // Generate a unique transfer reference
    const transferRef = `payout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create payout record as PAID instantly
    const payout = await Payout.create({
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
      amount: input.amount,
      currency: owner.currency,
      status: "PAID", // Instantly approve
      payoutMethod: "CHAPA",
      paidAt: new Date(),
      processedAt: new Date(),
      metadata: {
        transferRef,
      },
      transactionIds: [],
    });

    try {
      // Debit wallet immediately without waiting for admin
      await walletService.debitAvailableForPayout({
        ownerId: owner.ownerId,
        ownerType: owner.ownerType,
        amount: input.amount,
        payoutId: payout._id as unknown as mongoose.Types.ObjectId,
        idempotencyKey: `payout:${payout.id}:debit`,
        currency: owner.currency,
      });

      const routePrefix = owner.ownerType === "User" ? "peerhost" : "company";
      const returnUrl = `http://localhost:3000/${routePrefix}/wallet`;

      const chapaResult = await chapaService.initializeTransaction({
        amount: input.amount.toFixed(2),
        currency: "ETB",
        email: email,
        first_name: name,
        tx_ref: transferRef,
        callback_url: returnUrl,
        customization: {
          title: "Withdrawal",
          description: "Withdrawal from AutoRental Wallet",
        },
      });

      payout.gatewayReference = transferRef;
      await payout.save();

      return {
        ...payout.toJSON(),
        checkoutUrl: chapaResult.checkoutUrl,
      };
    } catch (error) {
      payout.status = "FAILED";
      payout.failureReason = error instanceof Error ? error.message : "Chapa init failed";
      await payout.save();
      throw ApiError.unprocessable(payout.failureReason || "Withdrawal failed");
    }
  }

  async getBanks() {
    return chapaService.getBanks();
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
