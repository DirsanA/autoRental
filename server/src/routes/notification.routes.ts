import { Router } from "express";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { notificationService } from "../services/notification.service.js";
import type { Auth } from "../config/auth.js";
import type { Request, Response, NextFunction } from "express";

export function createNotificationRoutes(auth: Auth): Router {
  const router = Router();

  // All routes require authentication
  router.use(createAuthMiddleware(auth));

  /**
   * GET /api/notifications
   * Fetch paginated notifications for the current user
   */
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { page, limit, isRead, category } = req.query;

      const result = await notificationService.getNotifications({
        userId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
        category: category as string,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/notifications/unread-count
   */
  router.get("/unread-count", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const unreadCount = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PATCH /api/notifications/:id/read
   */
  router.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { id } = req.params;
      const notification = await notificationService.markAsRead(userId, id);

      if (!notification) {
        return res.status(404).json({ success: false, error: "Notification not found" });
      }

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/notifications/mark-all-read
   */
  router.post("/mark-all-read", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/notifications/:id
   */
  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { id } = req.params;
      const result = await notificationService.deleteNotification(userId, id);

      if (!result) {
        return res.status(404).json({ success: false, error: "Notification not found" });
      }

      res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
