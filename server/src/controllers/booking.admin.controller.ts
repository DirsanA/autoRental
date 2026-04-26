import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Booking } from "../models/Booking.js";
import { walletService } from "../services/wallet.service.js";

export const bookingAdminController = {
  completeBooking: asyncHandler(async (req: Request, res: Response) => {
    const bookingId = String((req.body as { bookingId?: unknown } | undefined)?.bookingId || "").trim();
    if (!bookingId) throw ApiError.unprocessable("bookingId is required");

    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound("Booking not found");

    booking.status = "COMPLETED";
    await booking.save();

    const escrow = await walletService.releaseEscrowOnBookingCompleted(booking.id);

    res.json({ success: true, data: { bookingId: booking.id, escrow } });
  }),

  cancelBookingWithRefund: asyncHandler(async (req: Request, res: Response) => {
    const bookingId = String((req.body as { bookingId?: unknown } | undefined)?.bookingId || "").trim();
    if (!bookingId) throw ApiError.unprocessable("bookingId is required");

    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound("Booking not found");

    booking.status = "CANCELLED";
    booking.isBlocked = false;
    booking.cancelReason = "Cancelled by admin";
    booking.cancelledAt = new Date();
    await booking.save();

    const refund = await walletService.refundOnBookingCancelled(booking.id);
    res.json({ success: true, data: { bookingId: booking.id, refund } });
  }),
};

