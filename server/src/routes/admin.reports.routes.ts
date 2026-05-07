import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { authorize } from "../middlewares/authorize.js";
import { AccountType } from "../models/User.js";
import { adminReportsController } from "../controllers/admin.reports.controller.js";

export function createAdminReportsRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get(
    "/monthly",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("manage", "all"),
    adminReportsController.getMonthlyExecutive,
  );

  return router;
}
