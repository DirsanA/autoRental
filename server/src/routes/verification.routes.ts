import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createVerificationController } from "../controllers/verification.controller.js";
import { verificationService } from "../services/verification.service.js";
import {
  reviewVerificationSchema,
  submitPeerhostVerificationSchema,
  submitRenterVerificationSchema,
  verificationIdParamsSchema,
} from "../validators/verification.validator.js";

export function createVerificationRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);
  const verificationController =
    createVerificationController(verificationService);

  // Requires authentication for every verification endpoint defined in this router.
  router.use(authenticate);

  // Accepts renter verification submissions after validating the incoming payload.
  router.post(
    "/renter",
    validate({ body: submitRenterVerificationSchema }),
    verificationController.submitRenter,
  );

  // Accepts peerhost verification submissions with the peerhost-specific schema rules.
  router.post(
    "/peerhost",
    validate({ body: submitPeerhostVerificationSchema }),
    verificationController.submitPeerhost,
  );

  // Returns the signed-in user's own verification records.
  router.get("/me", verificationController.getMyVerifications);

  // Restricts review actions to authorized users and validates both params and body before handling.
  router.patch(
    "/:id",
    authorize("manage", "all"),
    validate({
      params: verificationIdParamsSchema,
      body: reviewVerificationSchema,
    }),
    verificationController.reviewVerification,
  );

  return router;
}
