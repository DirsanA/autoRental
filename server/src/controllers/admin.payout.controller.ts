import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireRequestUser } from "../utils/requestContext.js";
import { walletService } from "../services/wallet.service.js";
import { ApiError } from "../utils/ApiError.js";
import { PayoutRequest } from "../models/PayoutRequest.js";

export const adminPayoutController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    requireRequestUser(req);
    const status = typeof req.query.status === "string" ? req.query.status.trim().toUpperCase() : undefined;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const items = await PayoutRequest.find(filter)
      .sort({ requestedAt: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: { payoutRequests: items } });
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const authUser = requireRequestUser(req);
    const payoutRequestId = String((req.body as { payoutRequestId?: unknown } | undefined)?.payoutRequestId || "").trim();
    if (!payoutRequestId) throw ApiError.unprocessable("payoutRequestId is required");

    const request = await walletService.approvePayout(authUser.id, payoutRequestId);
    res.json({ success: true, data: { payoutRequest: request } });
  }),
};

