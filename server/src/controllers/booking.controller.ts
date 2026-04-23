import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { bookingService } from "../services/booking.service.js";
import { requireRequestUser } from "../utils/requestContext.js";

function pickTxRef(query: Request["query"]) {
  const txRef = query.tx_ref;
  const trxRef = query.trx_ref;

  if (typeof txRef === "string" && txRef.trim()) return txRef.trim();
  if (typeof trxRef === "string" && trxRef.trim()) return trxRef.trim();
  return undefined;
}

export const bookingController = {
  initializeChapaCheckout: asyncHandler(async (req: Request, res: Response) => {
    const data = await bookingService.initializeChapaCheckout(
      requireRequestUser(req, "Please sign in before booking a vehicle"),
      req.body,
    );

    res.status(201).json({
      success: true,
      data,
    });
  }),

  verifyChapaPayment: asyncHandler(async (req: Request, res: Response) => {
    const input: { bookingId?: string; txRef?: string } = {};
    if (typeof req.query.bookingId === "string") {
      input.bookingId = req.query.bookingId;
    }

    const txRef = pickTxRef(req.query);
    if (txRef) {
      input.txRef = txRef;
    }

    const data = await bookingService.verifyChapaPayment(input);

    res.json({
      success: true,
      data,
    });
  }),

  chapaCallback: asyncHandler(async (req: Request, res: Response) => {
    const input: { bookingId?: string; txRef?: string } = {};
    if (typeof req.query.bookingId === "string") {
      input.bookingId = req.query.bookingId;
    }

    const txRef = pickTxRef(req.query);
    if (txRef) {
      input.txRef = txRef;
    }

    const data = await bookingService.getChapaCallbackResult(input);

    res.json({
      success: true,
      data,
    });
  }),
};
