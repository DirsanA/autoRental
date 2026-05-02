import { Router } from "express";
import { createAuthController } from "../controllers/auth.controller.js";
import { createAuthService } from "../services/auth.service.js";
import { validate } from "../middlewares/validate.js";
import {
  registerUserSchema,
  registerCompanySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import type { Auth } from "../config/auth.js";
import { createVerificationController } from "../controllers/verification.controller.js";
import { verificationService } from "../services/verification.service.js";
import { AccountType } from "../models/User.js";
import {
  legacySubmitPeerhostVerificationSchema,
  submitRenterIdVerificationSchema,
  submitRenterLicenseVerificationSchema,
} from "../validators/verification.validator.js";

/**
 * Auth routes — custom registration & login endpoints.
 *
 * NOTE: better-auth's native endpoints (email verification callback, etc.)
 * are still handled by the `app.all("/api/auth/*splat", ...)` catch-all in app.ts.
 * These routes provide our domain-specific registration flows on top.
 */
export function createAuthRoutes(auth: Auth): Router {
  const router = Router();
  const authService = createAuthService(auth);
  const authController = createAuthController(authService);
  const verificationController =
    createVerificationController(verificationService);
  const authenticate = createAuthMiddleware(auth);

  // Apply stricter rate limiting to all auth routes
  router.use(authLimiter);

  // --- Registration ---

  // POST /api/auth/register
  // User registration without roles yet.
  router.post(
    "/register",
    validate({ body: registerUserSchema }),
    authController.registerUser,
  );

  // POST /api/auth/upgrade/renter/id
  router.post(
    "/upgrade/renter/id",
    authenticate,
    requireAccountType(AccountType.USER),
    validate({ body: submitRenterIdVerificationSchema }),
    verificationController.submitRenterId,
  );

  // POST /api/auth/upgrade/renter/license
  router.post(
    "/upgrade/renter/license",
    authenticate,
    requireAccountType(AccountType.USER),
    validate({ body: submitRenterLicenseVerificationSchema }),
    verificationController.submitRenterLicense,
  );

  // POST /api/auth/upgrade/peerhost
  router.post(
    "/upgrade/peerhost",
    authenticate,
    requireAccountType(AccountType.USER),
    validate({ body: legacySubmitPeerhostVerificationSchema }),
    verificationController.submitPeerhost,
  );

  // POST /api/auth/register/company
  router.post(
    "/register/company",
    validate({ body: registerCompanySchema }),
    authController.registerCompany,
  );

  // --- Login / Session ---

  // POST /api/auth/login
  // Backward-compatible user portal login.
  router.post(
    "/login",
    validate({ body: loginSchema }),
    authController.login,
  );

  // POST /api/auth/login/user
  router.post(
    "/login/user",
    validate({ body: loginSchema }),
    authController.loginUser,
  );

  // POST /api/auth/login/company
  router.post(
    "/login/company",
    validate({ body: loginSchema }),
    authController.loginCompany,
  );

  // POST /api/auth/login/admin
  router.post(
    "/login/admin",
    validate({ body: loginSchema }),
    authController.loginAdmin,
  );

  // POST /api/auth/logout
  router.post("/logout", authController.logout);

  // GET /api/auth/session
  router.get("/session", authController.getSession);

  // --- Password Reset ---

  // POST /api/auth/forgot-password
  router.post(
    "/forgot-password",
    validate({ body: forgotPasswordSchema }),
    authController.forgotPassword,
  );

  // POST /api/auth/reset-password
  router.post(
    "/reset-password",
    validate({ body: resetPasswordSchema }),
    authController.resetPassword,
  );
 
  // POST /api/auth/change-password
  router.post(
    "/change-password",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY, AccountType.ADMIN),
    validate({ body: changePasswordSchema }),
    authController.changePassword,
  );

  return router;
}
