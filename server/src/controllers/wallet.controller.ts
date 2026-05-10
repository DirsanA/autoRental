import type { Request, Response } from "express";
import { Company } from "../models/Company.js";
import { AccountType } from "../models/User.js";
import { walletService } from "../services/wallet.service.js";
import { userPersistenceService } from "../services/user.persistence.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireRequestUser } from "../utils/requestContext.js";
import { ApiError } from "../utils/ApiError.js";

type OwnerTypeQuery = "User" | "Company" | undefined;

async function resolveOwner(input: {
  userId: string;
  authUserId?: string | null;
  ownerType?: OwnerTypeQuery;
}) {
  const ownerType = input.ownerType;

  if (ownerType === "Company") {
    const authUserId = input.authUserId || input.userId;
    const company = await Company.findOne({ authUserId }).select("_id").lean();
    if (!company?._id) {
      throw ApiError.notFound("Company account not found for this user");
    }
    return { ownerId: company._id, ownerType: "Company" as const };
  }

  if (ownerType === "User") {
    const user = await userPersistenceService.findByMongoId(input.userId);
    if (!user?._id) {
      throw ApiError.notFound("User account not found for this session");
    }
    return { ownerId: user._id, ownerType: "User" as const };
  }

  // Default behavior (backwards compatible): prefer company when it exists.
  const authUserId = input.authUserId || input.userId;
  const [user, company] = await Promise.all([
    userPersistenceService.findByMongoId(input.userId),
    Company.findOne({ authUserId }).select("_id").lean(),
  ]);

  if (company?._id) return { ownerId: company._id, ownerType: "Company" as const };
  if (user?._id) return { ownerId: user._id, ownerType: "User" as const };
  throw ApiError.notFound("Authenticated account not found");
}

export const walletController = {
  getMyWallet: asyncHandler(async (req: Request, res: Response) => {
    const caller = requireRequestUser(req, "Please sign in to view wallet");
    const ownerType =
      typeof req.query?.ownerType === "string"
        ? (req.query.ownerType as OwnerTypeQuery)
        : undefined;

    if (caller.accountType === AccountType.ADMIN && ownerType !== "Company") {
      const wallet = await walletService.getSystemWalletSnapshot();
      res.json({
        success: true,
        data: wallet,
      });
      return;
    }

    const owner = await resolveOwner({
      userId: String(caller.id),
      authUserId: typeof (caller as any).authUserId === "string" ? (caller as any).authUserId : null,
      ownerType,
    });

    // Backfill any missing wallet entries for already-paid bookings.
    await walletService.reconcilePaidBookingsForOwner({
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
      limit: 50,
    });

    const wallet = await walletService.getWalletByOwner(
      owner.ownerId,
      owner.ownerType,
    );

    res.json({
      success: true,
      data: wallet || {
        ownerType: owner.ownerType,
        pendingBalance: 0,
        availableBalance: 0,
        lifetimeEarned: 0,
        lifetimePaidOut: 0,
        lifetimeRefunded: 0,
        currency: "ETB",
      },
    });
  }),

  getMyWalletLedger: asyncHandler(async (req: Request, res: Response) => {
    const caller = requireRequestUser(req, "Please sign in to view wallet ledger");
    const ownerType =
      typeof req.query?.ownerType === "string"
        ? (req.query.ownerType as OwnerTypeQuery)
        : undefined;

    if (caller.accountType === AccountType.ADMIN && ownerType !== "Company") {
      res.json({
        success: true,
        data: [],
      });
      return;
    }

    const owner = await resolveOwner({
      userId: String(caller.id),
      authUserId: typeof (caller as any).authUserId === "string" ? (caller as any).authUserId : null,
      ownerType,
    });
    const items = await walletService.getLedgerByOwner(
      owner.ownerId,
      owner.ownerType,
    );

    res.json({
      success: true,
      data: items,
    });
  }),
};
