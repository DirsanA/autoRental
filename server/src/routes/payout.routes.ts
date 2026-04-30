import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { payoutController } from "../controllers/payout.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import {
  createPayoutSchema,
  payoutDecisionSchema,
  payoutIdParamsSchema,
  payoutListQuerySchema,
} from "../validators/payout.validator.js";

export function createPayoutRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.post(
    "/",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    validate({ body: createPayoutSchema }),
    payoutController.createPayout,
  );

  router.get(
    "/me",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    validate({ query: payoutListQuerySchema }),
    payoutController.listMyPayouts,
  );

  router.get(
    "/admin",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("read", "Payout"),
    validate({ query: payoutListQuerySchema }),
    payoutController.listAdminPayouts,
  );

  router.patch(
    "/admin/:payoutId/decision",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("update", "Payout"),
    validate({ params: payoutIdParamsSchema, body: payoutDecisionSchema }),
    payoutController.decidePayout,
  );

  router.get(
    "/banks",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    payoutController.getBanks,
  );

  return router;
}
