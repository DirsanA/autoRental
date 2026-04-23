import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import { bookingController } from "../controllers/booking.controller.js";
import {
  chapaCheckoutSchema,
  chapaVerifyQuerySchema,
} from "../validators/booking.validator.js";

export function createBookingRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

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

  return router;
}
