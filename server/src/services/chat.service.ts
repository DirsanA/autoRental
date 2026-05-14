import { Message, type MessageDocument, type MessageSenderType, type MessageType } from "../models/Message.js";
import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { notificationSocketService } from "./notification-socket.service.js";
import { notificationDispatcher } from "./notification.dispatcher.js";

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

    // Dispatch personal notification to the recipient
    void (async () => {
      try {
        // Skip system-generated messages (no real sender)
        if (input.senderType === "System" || !input.senderId) return;

        const fullBooking = await Booking.findById(input.bookingId)
          .populate("vehicleId", "ownerId ownerType")
          .lean();
        
        if (!fullBooking) return;

        const sender = await User.findById(input.senderId).select("name firstName lastName").lean();
        const senderName = sender?.name || `${sender?.firstName || "User"} ${sender?.lastName || ""}`.trim() || "Someone";

        const renterIdStr = fullBooking.renterId.toString();
        const senderIdStr = input.senderId.toString();

        let recipientId: string | null = null;

        if (senderIdStr === renterIdStr) {
          // Renter is sending → notify the vehicle owner (peer-host OR company)
          // ownerId can be a User ID (P2P) or a Company ID; either way the
          // Notification.recipientId stores it, and for companies we want to
          // find the company's primary user. For now store the company/owner entity ID
          // and let the frontend handle display (company will see it via their user link).
          const ownerIdStr = (fullBooking.vehicleId as any)?.ownerId?.toString();
          recipientId = ownerIdStr || null;
        } else {
          // Host / company employee is sending → notify the renter
          recipientId = renterIdStr;
        }

        if (recipientId) {
          // Build action URL pointing to the recipient's booking view
          const recipientIsRenter = recipientId === renterIdStr;
          const actionUrl = recipientIsRenter
            ? `/renter/booking-history`   // Renter goes to their booking list
            : `/company/bookings`;         // Host / company goes to their bookings

          await notificationDispatcher.sendChatNotification({
            recipientId,
            senderName,
            content: input.content,
            bookingId: input.bookingId,
            actionUrl,
          });
        }
      } catch (err) {
        console.error("[ChatService] Failed to dispatch chat notification:", err);
      }
    })();


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
