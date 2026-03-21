import { Router } from "express";
import { companyController } from "../controllers/company.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../validators/company.validator.js";
import type { Auth } from "../config/auth.js";

export function createCompanyRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  // --- Authenticated routes (specific paths MUST come before /:id) ---

  // GET /api/companies/me — Get own company
  router.get("/me", authenticate, companyController.getMyCompany);

  // POST /api/companies — Register a new company
  router.post(
    "/",
    authenticate,
    validate({ body: createCompanySchema }),
    companyController.create,
  );

  // --- Admin routes ---
  // TODO: Add admin role check middleware when CASL is fully wired

  // GET /api/companies — List all companies (admin)
  router.get("/", authenticate, companyController.list);

  // PATCH /api/companies/:id/approve — Approve company (admin)
  router.patch("/:id/approve", authenticate, companyController.approve);

  // PATCH /api/companies/:id/suspend — Suspend company (admin)
  router.patch("/:id/suspend", authenticate, companyController.suspend);

  // --- Public routes (parameterized, must be LAST) ---

  // GET /api/companies/:id — View company profile (public)
  router.get("/:id", companyController.getById);

  // PATCH /api/companies/:id — Update company profile (owner only)
  router.patch(
    "/:id",
    authenticate,
    validate({ body: updateCompanySchema }),
    companyController.update,
  );

  return router;
}

