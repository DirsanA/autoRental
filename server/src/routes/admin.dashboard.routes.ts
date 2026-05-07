import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { authorize } from "../middlewares/authorize.js";
import { AccountType } from "../models/User.js";
import { adminDashboardController } from "../controllers/admin.dashboard.controller.js";

export function createAdminDashboardRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get(
    "/",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("manage", "all"),
    adminDashboardController.getDashboard,
  );

  return router;
}
