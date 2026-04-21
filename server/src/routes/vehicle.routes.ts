import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { validate } from "../middlewares/validate.js";
import { vehicleController } from "../controllers/vehicle.controller.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
  updateVehicleStatusSchema,
  vehicleIdParamsSchema,
} from "../validators/vehicle.validator.js";

export function createVehicleRoutes(_auth: Auth): Router {
  const router = Router();

  router.get("/", vehicleController.list);
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
  router.patch(
    "/:id",
    validate({
      params: vehicleIdParamsSchema,
      body: updateVehicleSchema,
    }),
    vehicleController.update,
  );
  router.delete(
    "/:id",
    validate({
      params: vehicleIdParamsSchema,
    }),
    vehicleController.remove,
  );

  // Temporary open endpoint for local dashboard testing.
  router.post("/", validate({ body: createVehicleSchema }), vehicleController.create);

  return router;
}
