import {
  AdminViewTracking,
  type EntityType,
} from "../models/AdminViewTracking.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { Vehicle } from "../models/Vehicle.js";
import { Verification } from "../models/Verification.js";
import { ApiError } from "../utils/ApiError.js";
import { notificationEmitter } from "./notification-emitter.service.js";
import { AdminNotification } from "../models/AdminNotification.js";

/**
 * Service for tracking admin views on action-required entities
 * Provides methods for marking views, checking viewed status, and getting counts
 */
export class ViewTrackingService {
  /**
   * Mark a specific entity as viewed by an admin
   */
  async markAsViewed(
    adminId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<void> {
    try {
      await AdminViewTracking.markAsViewed(adminId, entityType, entityId);

      // Emit real-time event for WebSocket clients
      notificationEmitter.emitEntityViewed(adminId, entityType, entityId);
    } catch (error) {
      console.error(
        `[ViewTracking] Error marking ${entityType} ${entityId} as viewed:`,
        error,
      );
      // Don't throw - view tracking is non-critical
    }
  }

  /**
   * Mark multiple entities as viewed (for list page visits)
   */
  async markPageAsViewed(
    adminId: string,
    entityType: EntityType,
    entityIds: string[],
  ): Promise<void> {
    if (entityIds.length === 0) return;

    try {
      await AdminViewTracking.markPageAsViewed(adminId, entityType, entityIds);

      // Emit real-time badge count update
      await notificationEmitter.emitBadgeCountUpdate(adminId);
    } catch (error) {
      console.error(
        `[ViewTracking] Error marking page as viewed for ${entityType}:`,
        error,
      );
      // Don't throw - view tracking is non-critical
    }
  }

  /**
   * Check if an entity was viewed by an admin
   */
  async isViewed(
    adminId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<boolean> {
    try {
      return await AdminViewTracking.isViewed(adminId, entityType, entityId);
    } catch (error) {
      console.error(`[ViewTracking] Error checking viewed status:`, error);
      return false; // Default to not viewed on error
    }
  }

  /**
   * Get count of unviewed entities from a provided list
   */
  async getUnviewedCount(
    adminId: string,
    entityType: EntityType,
    entityIds: string[],
  ): Promise<number> {
    if (entityIds.length === 0) return 0;

    try {
      return await AdminViewTracking.getUnviewedCount(
        adminId,
        entityType,
        entityIds,
      );
    } catch (error) {
      console.error(`[ViewTracking] Error getting unviewed count:`, error);
      return 0; // Default to 0 on error (don't show badges if we can't determine)
    }
  }

  /**
   * Get list of viewed entity IDs from a provided list
   */
  async getViewedIds(
    adminId: string,
    entityType: EntityType,
    entityIds: string[],
  ): Promise<string[]> {
    if (entityIds.length === 0) return [];

    try {
      return await AdminViewTracking.getViewedIds(
        adminId,
        entityType,
        entityIds,
      );
    } catch (error) {
      console.error(`[ViewTracking] Error getting viewed IDs:`, error);
      return []; // Default to empty on error
    }
  }

  /**
   * Enhance entities with isNew flag based on view status
   * Non-breaking: adds optional isNew field
   */
  async enhanceWithViewStatus<T extends { id: string }>(
    adminId: string,
    entityType: EntityType,
    entities: T[],
  ): Promise<(T & { isNew?: boolean })[]> {
    if (entities.length === 0) return entities;

    try {
      const entityIds = entities.map((e) => e.id);
      const viewedIds = new Set(
        await this.getViewedIds(adminId, entityType, entityIds),
      );

      return entities.map((entity) => ({
        ...entity,
        isNew: !viewedIds.has(entity.id),
      }));
    } catch (error) {
      console.error(`[ViewTracking] Error enhancing with view status:`, error);
      return entities; // Return original on error (isNew will be undefined)
    }
  }

  /**
   * Get all action-required entity IDs for a given type
   * Aligned with "Major Activities" rules.
   */
  async getActionRequiredIds(entityType: EntityType): Promise<string[]> {
    try {
      switch (entityType) {
        case "USER":
          // Renter verification cases (users with pending verifications)
          const usersWithVerifications = await Verification.find({
            status: "PENDING",
          }).distinct("userId");
          return usersWithVerifications.map((id) => id.toString());

        case "COMPANY":
          // Companies awaiting initial approval OR with pending profile changes
          const companies = await Company.find({
            $or: [
              { status: "PENDING_APPROVAL" },
              { pendingChanges: { $exists: true, $ne: null } },
            ],
          }).select("_id");
          return companies.map((c) => c._id.toString());

        case "VEHICLE":
          // ONLY Peerhost vehicles pending approval
          const vehicles = await Vehicle.find({
            status: "PENDING_APPROVAL",
            ownerType: "User",
          }).select("_id");
          return vehicles.map((v) => v._id.toString());

        case "VERIFICATION":
          // Verifications with PENDING status
          const verifications = await Verification.find({
            status: "PENDING",
          }).select("_id");
          return verifications.map((v) => v._id.toString());

        case "P2P_HOST":
          // Peerhost applications (users who submitted license/hosting verifications)
          // For now, these are users who are ID/License verified but not yet Peerhosts, 
          // or specifically those awaiting verification review.
          const p2pUsers = await User.find({
            status: "PENDING",
            accountType: "USER",
            verificationLevel: { $in: ["ID_VERIFIED", "LICENSE_VERIFIED"] },
          }).select("_id");
          return p2pUsers.map((u) => u._id.toString());

        default:
          return [];
      }
    } catch (error) {
      console.error(
        `[ViewTracking] Error getting action-required IDs for ${entityType}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Get sidebar badge counts for all entity types
   * Returns counts of unviewed action-required items
   */
  async getSidebarBadgeCounts(adminId: string): Promise<{
    users: number;
    p2pHosts: number;
    companies: number;
    vehicles: number;
    verifications: number;
  }> {
    try {
      const [userIds, companyIds, vehicleIds, verificationIds, p2pIds] =
        await Promise.all([
          this.getActionRequiredIds("USER"),
          this.getActionRequiredIds("COMPANY"),
          this.getActionRequiredIds("VEHICLE"),
          this.getActionRequiredIds("VERIFICATION"),
          this.getActionRequiredIds("P2P_HOST"),
        ]);

      const [
        usersUnviewed,
        companiesUnviewed,
        vehiclesUnviewed,
        verificationsUnviewed,
        p2pUnviewed,
        unreadNotifs,
      ] = await Promise.all([
        this.getUnviewedCount(adminId, "USER", userIds),
        this.getUnviewedCount(adminId, "COMPANY", companyIds),
        this.getUnviewedCount(adminId, "VEHICLE", vehicleIds),
        this.getUnviewedCount(adminId, "VERIFICATION", verificationIds),
        this.getUnviewedCount(adminId, "P2P_HOST", p2pIds),
        AdminNotification.aggregate([
          { $match: { recipientId: adminId as any, isRead: false } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]),
      ]);

      // Create a map for easy lookup
      const notifCounts: Record<string, number> = {};
      unreadNotifs.forEach((group: any) => {
        notifCounts[group._id] = group.count;
      });

      // Ensure the sidebar badge only reflects unviewed action-required records.
      // Notifications (notifCounts) are handled separately by the notification bell.
      return {
        users: usersUnviewed,
        p2pHosts: p2pUnviewed,
        companies: companiesUnviewed,
        vehicles: vehiclesUnviewed,
        verifications: verificationsUnviewed,
      };
    } catch (error) {
      console.error("[ViewTracking] Error getting sidebar counts:", error);
      return {
        users: 0,
        p2pHosts: 0,
        companies: 0,
        vehicles: 0,
        verifications: 0,
      };
    }
  }

  /**
   * Mark action as taken on an entity
   * Useful for clearing badges after approve/reject actions
   */
  async markActionTaken(
    adminId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<void> {
    try {
      await AdminViewTracking.markActionTaken(adminId, entityType, entityId);
    } catch (error) {
      console.error(`[ViewTracking] Error marking action taken:`, error);
    }
  }
}

// Singleton instance
export const viewTrackingService = new ViewTrackingService();
