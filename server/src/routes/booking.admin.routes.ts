import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import { bookingAdminController } from "../controllers/booking.admin.controller.js";
import { bookingCancelSchema, bookingCompleteSchema } from "../validators/wallet.validator.js";

export function createBookingAdminRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.post(
    "/complete",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    validate({ body: bookingCompleteSchema }),
    bookingAdminController.completeBooking,
  );

  router.post(
    "/cancel",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    validate({ body: bookingCancelSchema }),
    bookingAdminController.cancelBookingWithRefund,
  );

  return router;
}

