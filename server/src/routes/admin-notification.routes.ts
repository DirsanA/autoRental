import { Router } from "express";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { adminNotificationService } from "../services/admin-notification.service.js";
import type { Auth } from "../config/auth.js";
import type { Request, Response, NextFunction } from "express";
import { AccountType } from "../models/User.js";

export function createAdminNotificationRoutes(auth: Auth): Router {
  const router = Router();

  router.use(createAuthMiddleware(auth));
  router.use(requireAccountType(AccountType.ADMIN));

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log(`[AdminNotificationRoutes] GET / for adminId=${adminId}`);

      const { page, limit, category, priority, isRead } = req.query;

      const result = await adminNotificationService.getNotifications({
        adminId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        category: category as any,
        priority: priority as string,
        isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
      });

      console.log(`[AdminNotificationRoutes] Returning ${result.notifications.length} notifications, unreadCount=${result.unreadCount}`);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/generate", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const count = await adminNotificationService.autoGenerateNotificationsForPendingItems(adminId);

      res.status(200).json({
        success: true,
        message: `Generated ${count} notifications from pending items`,
        count,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/unread-count", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const count = await adminNotificationService.getUnreadCount(adminId);

      res.status(200).json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      await adminNotificationService.markAsRead(adminId, id);

      res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
      next(error);
    }
  });

  router.post("/mark-all-read", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const count = await adminNotificationService.markAllAsRead(adminId);

      res.status(200).json({
        success: true,
        message: `Marked ${count} notifications as read`,
        count,
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      await adminNotificationService.deleteNotification(adminId, id);

      res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
