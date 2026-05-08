import { Router } from "express";
import { z } from "zod";
import { createP2PAdminController } from "../controllers/p2p.admin.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
// import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
  adminP2PListQuerySchema,
  adminP2PHostIdSchema,
  adminP2PDecisionSchema,
  adminVehicleDecisionSchema,
} from "../validators/p2p.admin.validator.js";
import { createAuth } from "../config/auth.js";

/**
 * Creates P2P admin routes.
 */
export function createP2PAdminRoutes(
  auth: ReturnType<typeof createAuth>,
): Router {
  const router = Router();
  const controller = createP2PAdminController();
  const authenticate = createAuthMiddleware(auth);

  // All routes require admin authentication
  router.use(authenticate);
  // router.use(authorize("manage", "all"));

  // Proxy file for CORS-safe viewing/downloading
  router.get("/proxy-file", controller.proxyFile);

  // List P2P host applicants
  router.get(
    "/",
    validate({ query: adminP2PListQuerySchema }),
    controller.listHosts,
  );

  // Get host detail
  router.get(
    "/:hostId",
    validate({ params: adminP2PHostIdSchema }),
    controller.getHostDetail,
  );

  // Review host application (approve/reject)
  router.post(
    "/:hostId/decision",
    validate({
      params: adminP2PHostIdSchema,
      body: adminP2PDecisionSchema,
    }),
    controller.reviewHost,
  );

  // Get vehicle detail
  router.get(
    "/vehicles/:vehicleId",
    validate({
      params: z.object({
        vehicleId: z.string().trim().min(1, "Vehicle ID is required"),
      }),
    }),
    controller.getVehicleDetail,
  );

  // Review vehicle (approve/reject)
  router.post(
    "/vehicles/:vehicleId/decision",
    validate({
      params: z.object({
        vehicleId: z.string().trim().min(1, "Vehicle ID is required"),
      }),
      body: adminVehicleDecisionSchema,
    }),
    controller.reviewVehicle,
  );

  return router;
}
