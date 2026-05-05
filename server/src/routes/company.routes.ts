import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { companyController } from "../controllers/company.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { updateCompanySchema } from "../validators/company.validator.js";
import type { Auth } from "../config/auth.js";
import { upload } from "../middlewares/upload.middleware.js";

function normalizeMultipartBody(req: Request, _res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  for (const key of Object.keys(body)) {
    const value = body[key];
    if (!key.includes("[")) {
      normalized[key] = value;
      continue;
    }

    const path = key.replace(/\]/g, "").split("[");
    let current: Record<string, unknown> = normalized;

    for (let i = 0; i < path.length; i += 1) {
      const segment = path[i] as string;
      if (i === path.length - 1) {
        current[segment] = value;
      } else {
        if (typeof current[segment] !== "object" || current[segment] === null) {
          current[segment] = {};
        }
        current = current[segment] as Record<string, unknown>;
      }
    }
  }

  req.body = normalized;
  next();
}

export function createCompanyRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  // Company self-service routes
  router.get("/me", authenticate, companyController.getMyCompany);
  router.get("/me/dashboard", authenticate, companyController.getMyCompanyDashboard);

  router.patch(
    "/:id",
    authenticate,
    upload.fields([
      { name: "licenseDocument", maxCount: 1 },
      { name: "logo", maxCount: 1 },
    ]),
    normalizeMultipartBody,
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
    "/:id/reject",
    authenticate,
    authorize("manage", "all"),
    companyController.reject,
  );

  router.patch(
    "/:id/suspend",
    authenticate,
    authorize("manage", "all"),
    companyController.suspend,
  );
router.get("/me/reviews", authenticate, companyController.getMyCompanyReviews);
  // Public routes
  router.get("/:id", companyController.getById);
  router.post(
    "/",
    authenticate,
    upload.fields([
      { name: "licenseDocument", maxCount: 1 },
      { name: "logo", maxCount: 1 },
    ]),
    companyController.create,
  );


  return router;
}
