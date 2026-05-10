import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import type { Auth } from "../config/auth.js";

export function createChatRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  // All chat routes require authentication
  router.use(authenticate);

  /**
   * Chat History & Messaging
   */
  router.get("/:bookingId/history", chatController.getHistory);
  router.post("/:bookingId/messages", chatController.sendMessage);

  /**
   * Booking Lifecycle Actions
   */
  router.post("/:bookingId/handover/initiate", chatController.initiateHandover);
  router.post("/:bookingId/handover/complete", chatController.completeHandover);

  router.post("/:bookingId/return/initiate", chatController.initiateReturn);
  router.post("/:bookingId/return/complete", chatController.completeReturn);

  return router;
}
