import { Router } from "express";
import { createUserController } from "../controllers/user.controller.js";
import { createUserService } from "../services/user.service.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/user.validator.js";
import type { Auth } from "../config/auth.js";
import { AccountType } from "../models/User.js";
import {
  adminUserListQuerySchema,
  adminUserParamsSchema,
  adminUserStatusSchema,
  adminUserVerificationLevelSchema,
} from "../validators/user.admin.validator.js";

export function createUserRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);
  const userService = createUserService(auth);
  const userController = createUserController(userService);

  router.use(authenticate);
  router.use(requireAccountType(AccountType.USER, AccountType.ADMIN));

  router.get("/me", userController.getMe);
  router.get("/me/peerhost-dashboard", userController.getPeerHostDashboard);
  router.get("/me/peerhost-reviews", userController.getPeerHostReviews);

  router.patch(
    "/me",
    validate({ body: updateProfileSchema }),
    userController.updateMe,
  );

  // --- Admin user management ---
  router.get(
    "/",
    requireAccountType(AccountType.ADMIN),
    authorize("read", "User"),
    validate({ query: adminUserListQuerySchema }),
    userController.listUsers,
  );

  router.get(
    "/:id",
    requireAccountType(AccountType.ADMIN),
    authorize("read", "User"),
    validate({ params: adminUserParamsSchema }),
    userController.getById,
  );

  router.patch(
    "/:id/status",
    requireAccountType(AccountType.ADMIN),
    authorize("update", "User"),
    validate({ params: adminUserParamsSchema, body: adminUserStatusSchema }),
    userController.updateStatus,
  );

  router.patch(
    "/:id/verification-level",
    requireAccountType(AccountType.ADMIN),
    authorize("update", "User"),
    validate({
      params: adminUserParamsSchema,
      body: adminUserVerificationLevelSchema,
    }),
    userController.updateVerificationLevel,
  );

  router.delete(
    "/:id",
    requireAccountType(AccountType.ADMIN),
    authorize("delete", "User"),
    validate({ params: adminUserParamsSchema }),
    userController.deleteUser,
  );

  return router;
}
