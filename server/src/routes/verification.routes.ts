import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { createVerificationController } from "../controllers/verification.controller.js";
import { verificationService } from "../services/verification.service.js";
import { AccountType } from "../models/User.js";
import {
  reviewVerificationSchema,
  submitPeerhostVerificationSchema,
  submitRenterIdVerificationSchema,
  submitRenterLicenseVerificationSchema,
  verificationIdParamsSchema,
} from "../validators/verification.validator.js";

export function createVerificationRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);
  const verificationController =
    createVerificationController(verificationService);

  router.use(authenticate);
  router.post(
    "/renter/id",
    requireAccountType(AccountType.USER),
    validate({ body: submitRenterIdVerificationSchema }),
    verificationController.submitRenterId,
  );

  router.post(
    "/renter/license",
    requireAccountType(AccountType.USER),
    validate({ body: submitRenterLicenseVerificationSchema }),
    verificationController.submitRenterLicense,
  );

  router.post(
    "/peerhost",
    requireAccountType(AccountType.USER),
    validate({ body: submitPeerhostVerificationSchema }),
    verificationController.submitPeerhost,
  );

  router.get(
    "/me",
    requireAccountType(AccountType.USER),
    verificationController.getMyVerifications,
  );

  router.patch(
    "/:id",
    requireAccountType(AccountType.ADMIN),
    authorize("manage", "all"),
    validate({
      params: verificationIdParamsSchema,
      body: reviewVerificationSchema,
    }),
    verificationController.reviewVerification,
  );

  return router;
}
