import { Router } from "express";
import { createAuthRoutes } from "./auth.routes.js";
import { createUserRoutes } from "./user.routes.js";
import { createCompanyRoutes } from "./company.routes.js";
import { createVerificationRoutes } from "./verification.routes.js";
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

  return router;
}
