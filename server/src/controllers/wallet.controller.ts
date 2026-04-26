import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireRequestUser } from "../utils/requestContext.js";
import { userPersistenceService } from "../services/user.persistence.service.js";
import { CompanyService } from "../services/company.service.js";
import { walletService } from "../services/wallet.service.js";
import { WalletTransaction, Wallet } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";

async function resolveOwnerFromAuthUser(authUserId: string) {
  const user = await userPersistenceService.findByAuthId(authUserId);
  if (!user) throw ApiError.unauthorized();

  // Wallet applies to peerhost (USER) & COMPANY portals only.
  if (user.accountType !== "COMPANY" && user.accountType !== "USER") {
    throw ApiError.forbidden("This account does not have a wallet");
  }

  if (user.accountType === "COMPANY") {
    const company = await new CompanyService().getByAuthUserId(authUserId);
    if (!company) {
      throw ApiError.conflict("Company profile not found for this account");
    }
    return { ownerId: company._id, ownerType: "Company" as const };
  }

  return { ownerId: user._id, ownerType: "User" as const };
}

export const walletController = {
  getMyWallet: asyncHandler(async (req: Request, res: Response) => {
    const authUser = requireRequestUser(req);
    const owner = await resolveOwnerFromAuthUser(authUser.id);
    const wallet = await walletService.getOrCreateWallet(owner);

    res.json({ success: true, data: { wallet } });
  }),

  listMyWalletTransactions: asyncHandler(async (req: Request, res: Response) => {
    const authUser = requireRequestUser(req);
    const owner = await resolveOwnerFromAuthUser(authUser.id);

    const items = await WalletTransaction.find({
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: { transactions: items } });
  }),

  requestPayout: asyncHandler(async (req: Request, res: Response) => {
    const authUser = requireRequestUser(req);
    const owner = await resolveOwnerFromAuthUser(authUser.id);
    const amount = Number((req.body as { amount?: unknown } | undefined)?.amount);
    if (!Number.isFinite(amount)) throw ApiError.unprocessable("amount must be a number");

    const payoutRequest = await walletService.requestPayout(owner, amount);
    res.status(201).json({ success: true, data: { payoutRequest } });
  }),
};

