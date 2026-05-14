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
  router.get("/me/reviews", authenticate, companyController.getMyCompanyReviews);

  // Multer runs FIRST so req.body is populated before the validator inspects it
  router.patch(
    "/:id",
    authenticate,
    upload.fields([
      { name: "logo", maxCount: 1 },
      { name: "licenseDocument", maxCount: 1 },
    ]),
    validate({ body: updateCompanySchema }),
    companyController.update,
  );

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
 
  router.patch(
    "/:id/approve-pending",
    authenticate,
    authorize("manage", "all"),
    companyController.approvePending,
  );
 
  router.patch(
    "/:id/reject-pending",
    authenticate,
    authorize("manage", "all"),
    companyController.rejectPending,
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
