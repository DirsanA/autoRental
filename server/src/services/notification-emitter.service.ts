import { viewTrackingService } from "./view-tracking.service.js";
import { notificationSocketService } from "./notification-socket.service.js";
import { adminNotificationService } from "./admin-notification.service.js";
import type { EntityType } from "../models/AdminViewTracking.js";

/**
 * Notification Emitter Service
 * 
 * This is the bridge between business logic and notifications.
 * It handles both WebSocket (real-time) and future push notifications.
 * 
 * Key principle: Always emit events here, let the infrastructure decide
 * how to deliver them (WebSocket, Push, or queue for later).
 */
export class NotificationEmitterService {
  /**
   * Emit badge count update for a specific admin
   * Called after view tracking changes
   */
  async emitBadgeCountUpdate(adminId: string): Promise<void> {
    // Get fresh counts
    const counts = await viewTrackingService.getSidebarBadgeCounts(adminId);
    
    // WebSocket (real-time)
    if (notificationSocketService.isInitialized()) {
      notificationSocketService.emitBadgeCountUpdate(adminId, counts);
    }

    // Future: Push notifications, email digest, etc.
  }

  /**
   * Emit when an entity is viewed (badge should clear)
   */
  emitEntityViewed(
    adminId: string,
    entityType: EntityType,
    entityId: string
  ): void {
    // WebSocket (real-time)
    if (notificationSocketService.isInitialized()) {
      notificationSocketService.emitEntityViewed(adminId, entityType, entityId);
    }

    // Also refresh counts
    this.emitBadgeCountUpdate(adminId).catch(console.error);
  }

  /**
   * Emit when new action-required entity appears
   * Standardized for "Major Activities" only.
   */
  async emitNewActionRequired(params: {
    entityType: EntityType;
    entityId: string;
    activityType:
      | "RENTER_VERIFICATION"
      | "PEERHOST_APPLICATION"
      | "PEERHOST_VEHICLE_ADD"
      | "COMPANY_REGISTRATION"
      | "COMPANY_PROFILE_CHANGE";
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { entityType, entityId, activityType, metadata = {} } = params;

    // 1. Generate standard fields
    const title = this.getNotificationTitle(activityType, metadata);
    const message = this.getNotificationMessage(activityType, metadata);
    const targetUrl = this.getActionUrl(activityType, entityId, metadata);

    // 2. Create in-app notification documents for ALL admins
    try {
      const { User } = await import("../models/User.js");
      const admins = await User.find({ accountType: "ADMIN" })
        .select("_id")
        .lean();

      if (admins.length > 0) {
        const docs = admins.map((admin) => ({
          recipientId: admin._id,
          title,
          message,
          category: this.getCategory(entityType),
          priority: this.getPriority(activityType),
          isRead: false,
          relatedEntity: {
            id: entityId as any,
            entityType,
          },
          actionUrl: targetUrl,
          metadata: {
            ...metadata,
            entityType,
            entityId,
            activityType,
            targetUrl,
            sentToAdmin: true,
          },
        }));

        const { AdminNotification } = await import("../models/AdminNotification.js");
        await AdminNotification.insertMany(docs);
      }

      // 3. Emit real-time events AFTER database records are created
      // This prevents a race condition where the client refreshes before the data is ready
      if (notificationSocketService.isInitialized()) {
        console.log(`[NotificationEmitter] Emitting real-time updates for ${activityType}`);
        
        notificationSocketService.emitNewActionRequired(
          entityType,
          entityId,
          { ...metadata, activityType, targetUrl }
        );
        
        notificationSocketService.emitAdminInboxUpdate();
      }
    } catch (error) {
      console.error("[NotificationEmitter] Failed to process admin notification:", error);
      
      // Fallback: still try to emit socket event even if DB fails, 
      // so at least badge counts might update if they use other sources
      if (notificationSocketService.isInitialized()) {
        notificationSocketService.emitAdminInboxUpdate();
      }
    }
  }

  private getCategory(entityType: EntityType): string {
    switch (entityType) {
      case "USER": return "USER_ACTIVITY";
      case "COMPANY": return "COMPANY_ACTIVITY";
      case "VEHICLE": return "VEHICLE_ACTIVITY";
      case "VERIFICATION": return "VERIFICATION_ACTIVITY";
      case "P2P_HOST": return "P2P_ACTIVITY";
      default: return "SYSTEM_ALERT";
    }
  }

  private getPriority(activityType: string): string {
    switch (activityType) {
      case "COMPANY_REGISTRATION":
      case "PEERHOST_APPLICATION":
      case "RENTER_VERIFICATION":
        return "HIGH";
      default:
        return "MEDIUM";
    }
  }

  private getNotificationTitle(activityType: string, metadata: Record<string, any>): string {
    const docType = metadata.documentType === "NATIONAL_ID" ? "National ID" : "Driver's License";
    switch (activityType) {
      case "RENTER_VERIFICATION": return `Renter ${docType} Verification`;
      case "PEERHOST_APPLICATION": return "New Peerhost Application";
      case "PEERHOST_VEHICLE_ADD": return "New Peerhost Vehicle";
      case "COMPANY_REGISTRATION": return "Company Registration Awaiting Approval";
      case "COMPANY_PROFILE_CHANGE": return "Company Profile Change Request";
      default: return "New Action Required";
    }
  }

  private getNotificationMessage(activityType: string, metadata: Record<string, any>): string {
    const name = metadata.userName || metadata.companyName || metadata.vehicleName || "A new item";
    const docType = metadata.documentType === "NATIONAL_ID" ? "National ID" : "Driver's License";
    switch (activityType) {
      case "RENTER_VERIFICATION": return `${name} submitted ${docType} for verification.`;
      case "PEERHOST_APPLICATION": return `${name} applied to become a peerhost.`;
      case "PEERHOST_VEHICLE_ADD": return `${name} added a new vehicle for review.`;
      case "COMPANY_REGISTRATION": return `${name} registered as a company.`;
      case "COMPANY_PROFILE_CHANGE": return `${name} requested a profile update.`;
      default: return `${name} requires attention.`;
    }
  }

  private getActionUrl(activityType: string, entityId: string, metadata: Record<string, any>): string {
    const userId = metadata.userId || entityId;
    switch (activityType) {
      case "RENTER_VERIFICATION":
        return `/sysadmin/users/${userId}`;
      case "PEERHOST_APPLICATION":
        return `/sysadmin/p2p/${userId}`;
      case "PEERHOST_VEHICLE_ADD":
        return `/sysadmin/p2p/${userId}`;
      case "COMPANY_REGISTRATION":
      case "COMPANY_PROFILE_CHANGE":
        return `/sysadmin/companies/${entityId}`;
      default:
        return "/sysadmin/notifications";
    }
  }

  /**
   * Emit when entity status changes (e.g., approved/rejected)
   * This may affect badge counts
   */
  async emitEntityStatusChanged(
    adminId: string,
    entityType: EntityType,
    entityId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    // WebSocket
    if (notificationSocketService.isInitialized()) {
      notificationSocketService.broadcastToAdmins("v1:entity:status-changed", {
        entityType,
        entityId,
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString(),
      });
    }

    // Refresh badge counts for the acting admin
    await this.emitBadgeCountUpdate(adminId);
  }
}

// Singleton instance
export const notificationEmitter = new NotificationEmitterService();
