import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireRequestUser } from "../utils/requestContext.js";
import { PlatformLedger } from "../models/PlatformLedger.js";

export const adminLedgerController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    requireRequestUser(req);
    const currency =
      typeof req.query.currency === "string" ? req.query.currency.trim().toUpperCase() : "ETB";

    const ledger = await PlatformLedger.findOne({ currency }).lean();

    res.json({
      success: true,
      data: {
        ledger: ledger || {
          currency,
          totalCollected: 0,
          totalCommission: 0,
          totalPaidOut: 0,
        },
      },
    });
  }),
};

