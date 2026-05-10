import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import { bookingController } from "../controllers/booking.controller.js";
import {
  bookingIdParamsSchema,
  bookingPickupVerificationSchema,
  bookingReturnConfirmationSchema,
  bookingReviewCreateSchema,
  bookingReviewParamsSchema,
  bookingReviewUpdateSchema,
  bookingSettlementActionSchema,
  chapaCheckoutSchema,
  chapaVerifyQuerySchema,
  renterBookingListQuerySchema,
} from "../validators/booking.validator.js";

export function createBookingRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get(
    "/",
    authenticate,
    requireAccountType(AccountType.USER),
    authorize("read", "Booking"),
    validate({ query: renterBookingListQuerySchema }),
    bookingController.listRenterBookings,
  );

  router.get(
    "/peerhost",
    authenticate,
    requireAccountType(AccountType.USER),
    authorize("read", "Booking"),
    validate({ query: renterBookingListQuerySchema }),
    bookingController.listPeerHostBookings,
  );

  router.get(
    "/company",
    authenticate,
    requireAccountType(AccountType.COMPANY),
    authorize("read", "Booking"),
    validate({ query: renterBookingListQuerySchema }),
    bookingController.listCompanyBookings,
  );

  router.post(
    "/checkout/chapa",
    authenticate,
    requireAccountType(AccountType.USER),
    validate({ body: chapaCheckoutSchema }),
    bookingController.initializeChapaCheckout,
  );

  router.get(
    "/payments/chapa/verify",
    validate({ query: chapaVerifyQuerySchema }),
    bookingController.verifyChapaPayment,
  );

  router.get(
    "/payments/chapa/callback",
    validate({ query: chapaVerifyQuerySchema }),
    bookingController.chapaCallback,
  );

  router.get(
    "/:bookingId",
    authenticate,
    requireAccountType(AccountType.USER),
    authorize("read", "Booking"),
    bookingController.getBookingDetail,
  );

  router.post(
    "/:bookingId/reviews",
    authenticate,
    requireAccountType(AccountType.USER),
    authorize("create", "Review"),
    validate({
      params: bookingIdParamsSchema,
      body: bookingReviewCreateSchema,
    }),
    bookingController.createReview,
  );

  router.get(
    "/:bookingId/reviews",
    authenticate,
    requireAccountType(AccountType.USER),
    authorize("read", "Review"),
    validate({ params: bookingIdParamsSchema }),
    bookingController.getBookingReviews,
  );

  router.patch(
    "/:bookingId/reviews/:reviewId",
    authenticate,
    requireAccountType(AccountType.USER),
    authorize("create", "Review"),
    validate({
      params: bookingReviewParamsSchema,
      body: bookingReviewUpdateSchema,
    }),
    bookingController.updateReview,
  );

  router.delete(
    "/:bookingId/reviews/:reviewId",
    authenticate,
    requireAccountType(AccountType.USER),
    authorize("create", "Review"),
    validate({ params: bookingReviewParamsSchema }),
    bookingController.deleteReview,
  );

  router.patch(
    "/:bookingId/activate",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    authorize("update", "Booking"),
    validate({
      params: bookingIdParamsSchema,
      body: bookingPickupVerificationSchema,
    }),
    bookingController.activateOwnedBooking,
  );

  router.patch(
    "/:bookingId/return-confirmation",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    authorize("update", "Booking"),
    validate({
      params: bookingIdParamsSchema,
      body: bookingReturnConfirmationSchema,
    }),
    bookingController.confirmOwnedBookingReturn,
  );

  router.patch(
    "/:bookingId/complete",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("update", "Booking"),
    validate({
      params: bookingIdParamsSchema,
      body: bookingSettlementActionSchema,
    }),
    bookingController.markBookingCompleted,
  );

  router.patch(
    "/:bookingId/release-escrow",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("update", "Booking"),
    validate({
      params: bookingIdParamsSchema,
      body: bookingSettlementActionSchema,
    }),
    bookingController.releaseEscrowByAdmin,
  );

  router.patch(
    "/:bookingId/cancel-refund",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("update", "Booking"),
    validate({
      params: bookingIdParamsSchema,
      body: bookingSettlementActionSchema,
    }),
    bookingController.cancelBookingWithRefund,
  );

  return router;
}
