import { Router } from "express";
import { createUserController } from "../controllers/user.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/user.validator.js";
import type { Auth } from "../config/auth.js";
import { AccountType } from "../models/User.js";

export function createUserRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);
  const userController = createUserController(auth);

  router.use(authenticate);
  router.use(requireAccountType(AccountType.USER, AccountType.ADMIN));

  router.get("/me", userController.getMe);

  router.patch(
    "/me",
    validate({ body: updateProfileSchema }),
    userController.updateMe,
  );

  return router;
}
