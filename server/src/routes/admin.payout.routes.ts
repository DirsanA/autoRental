import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import { adminPayoutController } from "../controllers/admin.payout.controller.js";
import { payoutApproveSchema } from "../validators/wallet.validator.js";

export function createAdminPayoutRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get(
    "/requests",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    adminPayoutController.list,
  );

  router.post(
    "/approve",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    validate({ body: payoutApproveSchema }),
    adminPayoutController.approve,
  );

  return router;
}

