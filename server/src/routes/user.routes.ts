import { Router } from "express";
import { createUserController } from "../controllers/user.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/user.validator.js";
import type { Auth } from "../config/auth.js";

export function createUserRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);
  const userController = createUserController(auth);

  // All user routes require authentication
  router.use(authenticate);

  // GET /api/users/me — Get own profile
  router.get("/me", userController.getMe);

  // PATCH /api/users/me — Update own profile
  router.patch(
    "/me",
    validate({ body: updateProfileSchema }),
    userController.updateMe,
  );

  return router;
}
