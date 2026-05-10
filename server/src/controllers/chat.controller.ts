import type { Request, Response } from "express";
import { chatService } from "../services/chat.service.js";
import { bookingLifecycleService } from "../services/booking-lifecycle.service.js";
import { ApiError } from "../utils/ApiError.js";

export class ChatController {
  /**
   * Get chat history for a booking
   */
  async getHistory(req: Request, res: Response) {
    const { bookingId } = req.params;
    const history = await chatService.getChatHistory(bookingId);
    res.json({ success: true, data: history });
  }

  /**
   * Send a text message
   */
  async sendMessage(req: Request, res: Response) {
    const { bookingId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!user) throw ApiError.unauthorized();

    const message = await chatService.sendMessage({
      bookingId,
      senderId: user.id,
      senderType: user.accountType === "COMPANY" ? "Company" : "User",
      content,
      type: "text",
    });

    res.json({ success: true, data: message });
  }

  /**
   * Lifecycle: Initiate Handover
   */
  async initiateHandover(req: Request, res: Response) {
    const { bookingId } = req.params;
    const user = req.user;
    if (!user) throw ApiError.unauthorized();

    await bookingLifecycleService.initiateHandover(bookingId, user.id);
    res.json({ success: true, message: "Handover initiated" });
  }

  /**
   * Lifecycle: Complete Handover
   */
  async completeHandover(req: Request, res: Response) {
    const { bookingId } = req.params;
    const { photos, notes } = req.body;
    const user = req.user;
    if (!user) throw ApiError.unauthorized();

    const booking = await bookingLifecycleService.completeHandover(
      { bookingId, photos, notes },
      user.id
    );

    res.json({ success: true, data: booking });
  }

  /**
   * Lifecycle: Initiate Return
   */
  async initiateReturn(req: Request, res: Response) {
    const { bookingId } = req.params;
    const user = req.user;
    if (!user) throw ApiError.unauthorized();

    await bookingLifecycleService.initiateReturn(bookingId, user.id);
    res.json({ success: true, message: "Return initiated" });
  }

  /**
   * Lifecycle: Complete Return
   */
  async completeReturn(req: Request, res: Response) {
    const { bookingId } = req.params;
    const { photos, notes } = req.body;
    const user = req.user;
    if (!user) throw ApiError.unauthorized();

    const booking = await bookingLifecycleService.completeReturn(
      { bookingId, photos, notes },
      user.id
    );

    res.json({ success: true, data: booking });
  }
}

export const chatController = new ChatController();
