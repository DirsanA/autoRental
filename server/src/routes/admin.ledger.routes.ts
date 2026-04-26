import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { AccountType } from "../models/User.js";
import { adminLedgerController } from "../controllers/admin.ledger.controller.js";

export function createAdminLedgerRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get(
    "/",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    adminLedgerController.get,
  );

  return router;
}

