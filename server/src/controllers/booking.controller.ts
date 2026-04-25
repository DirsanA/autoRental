import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { bookingService } from "../services/booking.service.js";
import { requireRequestUser } from "../utils/requestContext.js";
import type { RenterBookingListQueryInput } from "../validators/booking.validator.js";

function pickTxRef(query: Request["query"]) {
  const txRef = query.tx_ref;
  const trxRef = query.trx_ref;

  if (typeof txRef === "string" && txRef.trim()) return txRef.trim();
  if (typeof trxRef === "string" && trxRef.trim()) return trxRef.trim();
  return undefined;
}

export const bookingController = {
  listRenterBookings: asyncHandler(async (req: Request, res: Response) => {
    const data = await bookingService.listRenterBookings(
      requireRequestUser(req, "Please sign in to view your booking history"),
      req.query as RenterBookingListQueryInput,
    );

    res.json({
      success: true,
      data,
    });
  }),

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

  getBookingDetail: asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    const data = await bookingService.getBookingDetail(
      requireRequestUser(req, "Please sign in to view booking details"),
      bookingId as string,
    );

    res.json({
      success: true,
      data,
    });
  }),

  createReview: asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    const data = await bookingService.createReview(
      requireRequestUser(req, "Please sign in to submit a review"),
      bookingId as string,
      req.body,
    );

    res.status(201).json({
      success: true,
      data,
    });
  }),

  updateReview: asyncHandler(async (req: Request, res: Response) => {
    const { bookingId, reviewId } = req.params;

    const data = await bookingService.updateReview(
      requireRequestUser(req, "Please sign in to update your review"),
      bookingId as string,
      reviewId as string,
      req.body,
    );

    res.json({
      success: true,
      data,
    });
  }),

  deleteReview: asyncHandler(async (req: Request, res: Response) => {
    const { bookingId, reviewId } = req.params;

    const data = await bookingService.deleteReview(
      requireRequestUser(req, "Please sign in to delete your review"),
      bookingId as string,
      reviewId as string,
    );

    res.json({
      success: true,
      data,
    });
  }),

  getBookingReviews: asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    const data = await bookingService.getBookingReviews(
      requireRequestUser(req, "Please sign in to view reviews"),
      bookingId as string,
    );

    res.json({
      success: true,
      data,
    });
  }),
};
