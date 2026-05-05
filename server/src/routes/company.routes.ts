import { Router } from "express";
import { companyController } from "../controllers/company.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { updateCompanySchema } from "../validators/company.validator.js";
import type { Auth } from "../config/auth.js";
import { upload } from "../middlewares/upload.middleware.js";

export function createCompanyRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  // Company self-service routes
  router.get("/me", authenticate, companyController.getMyCompany);
  router.get("/me/dashboard", authenticate, companyController.getMyCompanyDashboard);

  router.patch("/:id", authenticate, validate({ body: updateCompanySchema }), companyController.update);

  // Admin moderation routes
  router.get("/", authenticate, authorize("manage", "all"), companyController.list);

  router.get(
    "/:id/admin",
    authenticate,
    authorize("manage", "all"),
    companyController.getByIdAdmin,
  );

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
  router.post(
    "/",
    authenticate,
    upload.single("licenseDocument"),
    companyController.create,
  );

  return router;
}
