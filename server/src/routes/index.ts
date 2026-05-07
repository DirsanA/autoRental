import { Router } from "express";
import { createAuthRoutes } from "./auth.routes.js";
import { createUserRoutes } from "./user.routes.js";
import { createCompanyRoutes } from "./company.routes.js";
import { createVerificationRoutes } from "./verification.routes.js";
import { createVehicleRoutes } from "./vehicle.routes.js";
import { createP2PAdminRoutes } from "./p2p.admin.routes.js";
import { createAdminDashboardRoutes } from "./admin.dashboard.routes.js";
import { createBookingRoutes } from "./booking.routes.js";
import { createWalletRoutes } from "./wallet.routes.js";
import { createPayoutRoutes } from "./payout.routes.js";
import { createTransactionRoutes } from "./transaction.routes.js";
import { createReportRoutes } from "./report.routes.js";
import { createAdminReportsRoutes } from "./admin.reports.routes.js";
import type { Auth } from "../config/auth.js";

/**
 * Aggregates all API route modules under /api.
 */
export function createApiRoutes(auth: Auth): Router {
  const router = Router();

  // Auth routes MUST be mounted before the better-auth catch-all in app.ts
  // because they share the /api/auth prefix but provide our custom flows.
  router.use("/auth", createAuthRoutes(auth));
  router.use("/users", createUserRoutes(auth));
  router.use("/companies", createCompanyRoutes(auth));
  router.use("/verifications", createVerificationRoutes(auth));
  router.use("/vehicles", createVehicleRoutes(auth));
  router.use("/admin/p2p", createP2PAdminRoutes(auth));
  router.use("/admin/dashboard", createAdminDashboardRoutes(auth));
  router.use("/admin/reports", createAdminReportsRoutes(auth));
  router.use("/bookings", createBookingRoutes(auth));
  router.use("/wallet", createWalletRoutes(auth));
  router.use("/payouts", createPayoutRoutes(auth));
  router.use("/transactions", createTransactionRoutes(auth));
  router.use("/reports", createReportRoutes(auth));

  return router;
}
