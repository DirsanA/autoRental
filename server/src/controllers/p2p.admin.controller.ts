import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { p2PAdminService } from "../services/p2p.admin.service.js";
import { requireRequestUser } from "../utils/requestContext.js";
import type { AdminP2PDecisionInput } from "../validators/p2p.admin.validator.js";

/**
 * Creates P2P admin route handlers.
 */
export function createP2PAdminController() {
  return {
    /**
     * GET /api/admin/p2p
     * Lists P2P host applicants for admin review.
     */
    listHosts: asyncHandler(async (req: Request, res: Response) => {
      const data = await p2PAdminService.listHosts({
        status: req.query.status as any,
        search: req.query.search as string,
        page: req.query.page as any,
        limit: req.query.limit as any,
      });

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/admin/p2p/:hostId
     * Gets detailed information about a P2P host applicant.
     */
    getHostDetail: asyncHandler(async (req: Request, res: Response) => {
      const hostId = Array.isArray(req.params.hostId)
        ? req.params.hostId[0]
        : req.params.hostId;
      if (!hostId) {
        throw new Error("Host ID is required");
      }
      const data = await p2PAdminService.getHostDetail(hostId);

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * POST /api/admin/p2p/:hostId/decision
     * Approves or rejects a peer-host application.
     */
    reviewHost: asyncHandler(async (req: Request, res: Response) => {
      const hostId = Array.isArray(req.params.hostId)
        ? req.params.hostId[0]
        : req.params.hostId;
      if (!hostId) {
        throw new Error("Host ID is required");
      }
      const data = await p2PAdminService.reviewHostApplication(
        requireRequestUser(req),
        hostId,
        req.body as AdminP2PDecisionInput,
      );

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/admin/p2p/vehicles/:vehicleId
     * Gets detailed information about a specific vehicle for admin review.
     */
    getVehicleDetail: asyncHandler(async (req: Request, res: Response) => {
      const vehicleId = Array.isArray(req.params.vehicleId)
        ? req.params.vehicleId[0]
        : req.params.vehicleId;
      if (!vehicleId) {
        throw new Error("Vehicle ID is required");
      }
      const data = await p2PAdminService.getVehicleDetail(vehicleId);

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * POST /api/admin/p2p/vehicles/:vehicleId/decision
     * Approves or rejects a specific vehicle.
     */
    reviewVehicle: asyncHandler(async (req: Request, res: Response) => {
      const vehicleId = Array.isArray(req.params.vehicleId)
        ? req.params.vehicleId[0]
        : req.params.vehicleId;
      if (!vehicleId) {
        throw new Error("Vehicle ID is required");
      }
      const data = await p2PAdminService.reviewVehicle(
        requireRequestUser(req),
        vehicleId,
        req.body,
      );

      res.json({
        success: true,
        data,
      });
    }),
  };
}
