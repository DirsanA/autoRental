import { Router } from "express";
import { companyController } from "../controllers/company.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { updateCompanySchema } from "../validators/company.validator.js";
import type { Auth } from "../config/auth.js";
import { AccountType } from "../models/User.js";

export function createCompanyRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  // Company self-service routes
  router.get(
    "/me",
    authenticate,
    requireAccountType(AccountType.COMPANY),
    companyController.getMyCompany,
  );

  router.patch(
    "/:id",
    authenticate,
    requireAccountType(AccountType.COMPANY),
    validate({ body: updateCompanySchema }),
    companyController.update,
  );

  // Admin moderation routes
  router.get("/", authenticate, authorize("manage", "all"), companyController.list);

  router.patch(
    "/:id/approve",
    authenticate,
    authorize("manage", "all"),
    companyController.approve,
  );

  router.patch(
    "/:id/suspend",
    authenticate,
    authorize("manage", "all"),
    companyController.suspend,
  );

  // Public routes
  router.get("/:id", companyController.getById);

  return router;
}
