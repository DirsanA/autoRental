import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import type { EntityType } from "../models/AdminViewTracking.js";
import { ENV } from "../config/env.js";

/**
 * Socket.io service for real-time notifications
 */
export class NotificationSocketService {
  private io: SocketIOServer | null = null;
  private initialized = false;

  /**
   * Initialize Socket.io server
   */
  initialize(httpServer: HttpServer): void {
    if (this.initialized) return;

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ENV.FRONTEND_URL,
        credentials: true,
      },
      // Use WebSocket first, fallback to HTTP long-polling
      transports: ["websocket", "polling"],
    });

    this.setupConnectionHandlers();
    this.initialized = true;

    console.log("[NotificationSocket] Initialized");
  }

  /**
   * Set up connection handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      console.log(`[NotificationSocket] Client connected: ${socket.id}`);

      // Authenticate socket connection
      socket.on("authenticate", (data: { adminId: string }) => {
        if (data.adminId) {
          socket.join(`admin:${data.adminId}`);
          socket.emit("authenticated", { success: true });
          console.log(`[NotificationSocket] Admin ${data.adminId} authenticated`);
        }
      });

      // Join booking room for chat
      socket.on("join_booking_room", (data: { bookingId: string; userId: string }) => {
        if (data.bookingId) {
          socket.join(`booking:${data.bookingId}`);
          console.log(`[NotificationSocket] User ${data.userId} joined booking room ${data.bookingId}`);
          socket.emit("joined_room", { room: `booking:${data.bookingId}` });
        }
      });

      // Handle client disconnect
      socket.on("disconnect", () => {
        console.log(`[NotificationSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Emit badge count update to a specific admin
   */
  emitBadgeCountUpdate(
    adminId: string,
    counts: {
      users: number;
      p2pHosts: number;
      companies: number;
      vehicles: number;
      verifications: number;
    }
  ): void {
    if (!this.io) return;

    this.io.to(`admin:${adminId}`).emit("v1:badge-counts:update", counts);
  }

  /**
   * Emit entity viewed event (clears badge for specific entity)
   */
  emitEntityViewed(
    adminId: string,
    entityType: EntityType,
    entityId: string
  ): void {
    if (!this.io) return;

    this.io.to(`admin:${adminId}`).emit("v1:entity:viewed", {
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit new action-required entity (triggers badge appearance)
   */
  emitNewActionRequired(
    entityType: EntityType,
    entityId: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.io) return;

    // Broadcast to all connected admins (or specific role-based rooms)
    this.io.emit("v1:entity:new-action-required", {
      entityType,
      entityId,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event to refresh admin inbox/notifications list
   */
  emitAdminInboxUpdate(): void {
    if (!this.io) return;

    console.log("[NotificationSocket] Emitting v1:admin-inbox:refresh");
    this.io.emit("v1:admin-inbox:refresh", {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to all admins (for system-wide notifications)
   */
  broadcastToAdmins(event: string, data: unknown): void {
    if (!this.io) return;

    this.io.emit(event, data);
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Emit event to a specific room
   */
  emitToRoom(room: string, event: string, data: unknown): void {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  /**
   * Get underlying Socket.io instance (for advanced use)
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Singleton instance
export const notificationSocketService = new NotificationSocketService();
