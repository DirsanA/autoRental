import { Message, type MessageDocument, type MessageSenderType, type MessageType } from "../models/Message.js";
import { Booking } from "../models/Booking.js";
import { ApiError } from "../utils/ApiError.js";
import { notificationSocketService } from "./notification-socket.service.js";

export interface SendMessageInput {
  bookingId: string;
  senderId?: string;
  senderType: MessageSenderType;
  content: string;
  type?: MessageType;
  metadata?: Record<string, any>;
}

export class ChatService {
  /**
   * Send a message and notify participants via socket
   */
  async sendMessage(input: SendMessageInput): Promise<MessageDocument> {
    const booking = await Booking.findById(input.bookingId).lean();
    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    const message = await Message.create({
      bookingId: input.bookingId,
      senderId: input.senderId,
      senderType: input.senderType,
      content: input.content,
      type: input.type || "text",
      metadata: input.metadata,
    });

    // Emit to socket room
    notificationSocketService.emitToRoom(`booking:${input.bookingId}`, "new_message", message.toJSON());

    return message;
  }

  /**
   * Get message history for a booking
   */
  async getChatHistory(bookingId: string): Promise<MessageDocument[]> {
    return await Message.find({ bookingId })
      .sort({ createdAt: 1 })
      .lean();
  }

  /**
   * Send a system message (event) to the booking chat
   */
  async sendSystemEvent(bookingId: string, content: string, metadata?: Record<string, any>) {
    return await this.sendMessage({
      bookingId,
      senderType: "System",
      content,
      type: "event",
      metadata,
    });
  }
}

export const chatService = new ChatService();
