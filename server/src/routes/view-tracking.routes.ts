import { Router } from "express";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { viewTrackingService } from "../services/view-tracking.service.js";
import {
  markAsViewedSchema,
  markPageAsViewedSchema,
  markActionTakenSchema,
} from "../validators/view-tracking.validator.js";
import { validate } from "../middlewares/validate.js";
import type { Auth } from "../config/auth.js";
import type { Request, Response, NextFunction } from "express";

/**
 * Creates view tracking routes for admin seen/unseen functionality
 *
 * Routes:
 * - POST /api/view-tracking/mark-viewed - Mark single entity as viewed
 * - POST /api/view-tracking/mark-page-viewed - Mark multiple entities as viewed
 * - GET /api/view-tracking/sidebar-counts - Get badge counts for sidebar
 * - POST /api/view-tracking/mark-action-taken - Mark that admin took action
 */
export function createViewTrackingRoutes(auth: Auth): Router {
  const router = Router();

  // All routes require admin authentication
  router.use(createAuthMiddleware(auth));
  router.use(requireAccountType("ADMIN"));

  /**
   * POST /api/view-tracking/mark-viewed
   * Mark a single entity as viewed by the current admin
   */
  router.post(
    "/mark-viewed",
    validate({ body: markAsViewedSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { entityType, entityId } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        await viewTrackingService.markAsViewed(adminId, entityType, entityId);

        res.status(200).json({
          success: true,
          message: "Marked as viewed",
        });
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * POST /api/view-tracking/mark-page-viewed
   * Mark multiple entities as viewed (when admin visits a list page)
   */
  router.post(
    "/mark-page-viewed",
    validate({ body: markPageAsViewedSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { entityType, entityIds } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        await viewTrackingService.markPageAsViewed(
          adminId,
          entityType,
          entityIds,
        );

        res.status(200).json({
          success: true,
          message: `Marked ${entityIds.length} items as viewed`,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * GET /api/view-tracking/sidebar-counts
   * Get badge counts for all entity types (for sidebar display)
   */
  router.get(
    "/sidebar-counts",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const adminId = req.user?.id;

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const counts = await viewTrackingService.getSidebarBadgeCounts(adminId);

        res.status(200).json(counts);
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * GET /api/view-tracking/viewed-ids/:entityType
   * Get list of IDs that the admin has already viewed
   */
  router.get(
    "/viewed-ids/:entityType",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const adminId = req.user?.id;
        const { entityType } = req.params;
        const { ids } = req.query;

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        // Parse the ids query parameter (comma-separated string)
        const entityIds =
          typeof ids === "string"
            ? ids.split(",")
            : Array.isArray(ids)
              ? ids
              : [];

        if (entityIds.length === 0) {
          return res.status(400).json({ error: "No entity IDs provided" });
        }

        const viewedIds = await viewTrackingService.getViewedIds(
          adminId,
          entityType as any,
          entityIds,
        );

        res.status(200).json({ viewedIds });
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * POST /api/view-tracking/mark-action-taken
   * Mark that admin took action on an entity (approve/reject/etc)
   */
  router.post(
    "/mark-action-taken",
    validate({ body: markActionTakenSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { entityType, entityId } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        await viewTrackingService.markActionTaken(
          adminId,
          entityType,
          entityId,
        );

        res.status(200).json({
          success: true,
          message: "Action marked as taken",
        });
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
