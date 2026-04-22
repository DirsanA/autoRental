import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { vehicleController } from "../controllers/vehicle.controller.js";
import {
  createVehicleSchema,
  updateVehicleStatusSchema,
  vehicleIdParamsSchema,
} from "../validators/vehicle.validator.js";
import { AccountType } from "../models/User.js";

export function createVehicleRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get("/", vehicleController.list);
  router.get(
    "/mine",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    vehicleController.listMine,
  );
  router.get(
    "/:id",
    validate({ params: vehicleIdParamsSchema }),
    vehicleController.getById,
  );
  router.patch(
    "/:id/status",
    validate({
      params: vehicleIdParamsSchema,
      body: updateVehicleStatusSchema,
    }),
    vehicleController.updateStatus,
  );

  router.post(
    "/",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    validate({ body: createVehicleSchema }),
    vehicleController.create,
  );

  return router;
}
