import { AdminNotification } from "../models/AdminNotification.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { Vehicle } from "../models/Vehicle.js";
import { Verification } from "../models/Verification.js";
import type {
  AdminNotificationCategory,
  IAdminNotification,
} from "../models/AdminNotification.js";
import type { EntityType } from "../models/AdminViewTracking.js";

export type {
  AdminNotificationCategory,
  IAdminNotification,
};

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  category: AdminNotificationCategory;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  entityType: EntityType;
  entityId: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminNotificationListResult {
  notifications: AdminNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export class AdminNotificationService {
  async getNotifications(params: {
    adminId: string;
    page?: number;
    limit?: number;
    category?: AdminNotificationCategory | "all";
    priority?: string;
    isRead?: boolean;
  }): Promise<AdminNotificationListResult> {
    const {
      adminId,
      page = 1,
      limit = 20,
      category,
      priority,
      isRead,
    } = params;

    const filter: Record<string, unknown> = {
      recipientId: adminId,
    };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (typeof isRead === "boolean") {
      filter.isRead = isRead;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      AdminNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminNotification.countDocuments(filter),
      AdminNotification.countDocuments({
        recipientId: adminId,
        isRead: false,
      }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        category: n.category,
        priority: n.priority,
        entityType: (n.metadata?.entityType as EntityType) || "USER",
        entityId: (n.metadata?.entityId as string) || "",
        isRead: n.isRead,
        readAt: n.readAt ? n.readAt.toISOString() : undefined,
        actionUrl: n.actionUrl,
        metadata: n.metadata,
        createdAt: n.createdAt!.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(
    adminId: string,
    notificationId: string,
  ): Promise<void> {
    await AdminNotification.findOneAndUpdate(
      { _id: notificationId, recipientId: adminId },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllAsRead(adminId: string): Promise<number> {
    const result = await AdminNotification.updateMany(
      { recipientId: adminId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return result.modifiedCount;
  }

  async deleteNotification(
    adminId: string,
    notificationId: string,
  ): Promise<void> {
    await AdminNotification.deleteOne({
      _id: notificationId,
      recipientId: adminId,
    });
  }

  async getUnreadCount(adminId: string): Promise<number> {
    return AdminNotification.countDocuments({
      recipientId: adminId,
      isRead: false,
    });
  }

  async sendAdminNotification(params: {
    adminId: string;
    title: string;
    message: string;
    entityType: EntityType;
    entityId: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const priority = params.priority || "MEDIUM";

    const notification = await AdminNotification.create({
      recipientId: params.adminId as any,
      title: params.title,
      message: params.message,
      category:
        params.entityType === "USER"
          ? "USER_ACTIVITY"
          : params.entityType === "COMPANY"
            ? "COMPANY_ACTIVITY"
            : params.entityType === "VEHICLE"
              ? "VEHICLE_ACTIVITY"
              : params.entityType === "VERIFICATION"
                ? "VERIFICATION_ACTIVITY"
                : params.entityType === "P2P_HOST"
                  ? "P2P_ACTIVITY"
                  : "SYSTEM_ALERT",
      priority,
      isRead: false,
      relatedEntity: {
        id: params.entityId as any,
        entityType: params.entityType,
      },
      actionUrl: params.actionUrl,
      metadata: {
        ...params.metadata,
        entityType: params.entityType,
        entityId: params.entityId,
        sentToAdmin: true,
      },
    });

    return notification._id.toString();
  }

  async sendBulkAdminNotifications(params: {
    adminId: string;
    notifications: Array<{
      title: string;
      message: string;
      entityType: EntityType;
      entityId: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      actionUrl?: string;
      metadata?: Record<string, unknown>;
    }>;
  }): Promise<string[]> {
    const docs = params.notifications.map((n) => ({
      recipientId: params.adminId as any,
      title: n.title,
      message: n.message,
      category:
        n.entityType === "USER"
          ? "USER_ACTIVITY"
          : n.entityType === "COMPANY"
            ? "COMPANY_ACTIVITY"
            : n.entityType === "VEHICLE"
              ? "VEHICLE_ACTIVITY"
              : n.entityType === "VERIFICATION"
                ? "VERIFICATION_ACTIVITY"
                : n.entityType === "P2P_HOST"
                  ? "P2P_ACTIVITY"
                  : "SYSTEM_ALERT",
      priority: n.priority || "MEDIUM",
      isRead: false,
      relatedEntity: {
        id: n.entityId as any,
        entityType: n.entityType,
      },
      actionUrl: n.actionUrl,
      metadata: {
        ...n.metadata,
        entityType: n.entityType,
        entityId: n.entityId,
        sentToAdmin: true,
      },
    }));

    const created = await AdminNotification.insertMany(docs);
    return created.map((n) => n._id.toString());
  }

  async autoGenerateNotificationsForPendingItems(
    adminId: string,
  ): Promise<number> {
    const [pendingCompanies, pendingVehicles, pendingVerifications, companyProfileChanges] =
      await Promise.all([
        Company.find({ status: "PENDING_APPROVAL" })
          .select("_id name")
          .lean(),
        Vehicle.find({ status: "PENDING_APPROVAL", ownerType: "User" })
          .select("_id make model")
          .lean(),
        Verification.find({ status: "PENDING" })
          .select("_id documentType userId")
          .lean(),
        Company.find({ pendingChanges: { $exists: true, $ne: null } })
          .select("_id name")
          .lean(),
      ]);

    const existingNotifications = await AdminNotification.find({
      recipientId: adminId,
      "metadata.sentToAdmin": true,
    }).select("metadata.entityType metadata.entityId metadata.activityType");

    const existingMap = new Map(
      existingNotifications.map(
        (n) =>
          [
            `${n.metadata?.entityType}-${n.metadata?.entityId}-${n.metadata?.activityType}`,
            true,
          ] as [string, boolean],
      ),
    );

    const docs = [];

    // 1. Company Registration
    for (const c of pendingCompanies) {
      const key = `COMPANY-${c._id.toString()}-COMPANY_REGISTRATION`;
      if (!existingMap.has(key)) {
        docs.push({
          recipientId: adminId as any,
          title: "Company Registration Awaiting Approval",
          message: `${c.name} registered as a company.`,
          category: "COMPANY_ACTIVITY" as AdminNotificationCategory,
          priority: "HIGH" as const,
          isRead: false,
          relatedEntity: { id: c._id, entityType: "COMPANY" },
          actionUrl: `/sysadmin/companies/${c._id}`,
          metadata: {
            entityType: "COMPANY",
            entityId: c._id.toString(),
            activityType: "COMPANY_REGISTRATION",
            targetUrl: `/sysadmin/companies/${c._id}`,
            sentToAdmin: true,
          },
        });
      }
    }

    // 2. Company Profile Change
    for (const c of companyProfileChanges) {
      const key = `COMPANY-${c._id.toString()}-COMPANY_PROFILE_CHANGE`;
      if (!existingMap.has(key)) {
        docs.push({
          recipientId: adminId as any,
          title: "Company Profile Change Request",
          message: `${c.name} requested a profile update.`,
          category: "COMPANY_ACTIVITY" as AdminNotificationCategory,
          priority: "MEDIUM" as const,
          isRead: false,
          relatedEntity: { id: c._id, entityType: "COMPANY" },
          actionUrl: `/sysadmin/companies/${c._id}`,
          metadata: {
            entityType: "COMPANY",
            entityId: c._id.toString(),
            activityType: "COMPANY_PROFILE_CHANGE",
            targetUrl: `/sysadmin/companies/${c._id}`,
            sentToAdmin: true,
          },
        });
      }
    }

    // 3. Peerhost Vehicle Adding
    for (const v of pendingVehicles) {
      const key = `VEHICLE-${v._id.toString()}-PEERHOST_VEHICLE_ADD`;
      if (!existingMap.has(key)) {
        docs.push({
          recipientId: adminId as any,
          title: "New Peerhost Vehicle",
          message: `${v.make} ${v.model} added for review.`,
          category: "VEHICLE_ACTIVITY" as AdminNotificationCategory,
          priority: "MEDIUM" as const,
          isRead: false,
          relatedEntity: { id: v._id, entityType: "VEHICLE" },
          actionUrl: `/sysadmin/p2p/vehicles/${v._id}`,
          metadata: {
            entityType: "VEHICLE",
            entityId: v._id.toString(),
            activityType: "PEERHOST_VEHICLE_ADD",
            targetUrl: `/sysadmin/p2p/vehicles/${v._id}`,
            sentToAdmin: true,
          },
        });
      }
    }

    // 4. Verifications (Renter or Peerhost)
    for (const v of pendingVerifications) {
      const isPeerhostApp = v.documentType === "DRIVER_LICENSE"; // Simplified check for auto-gen
      const activityType = isPeerhostApp ? "PEERHOST_APPLICATION" : "RENTER_VERIFICATION";
      const key = `VERIFICATION-${v._id.toString()}-${activityType}`;
      
      if (!existingMap.has(key)) {
        docs.push({
          recipientId: adminId as any,
          title: isPeerhostApp ? "New Peerhost Application" : "Renter Profile Verification",
          message: `A verification document is waiting for review.`,
          category: "VERIFICATION_ACTIVITY" as AdminNotificationCategory,
          priority: isPeerhostApp ? "HIGH" : "MEDIUM",
          isRead: false,
          relatedEntity: { id: v._id, entityType: "VERIFICATION" },
          actionUrl: isPeerhostApp ? `/sysadmin/p2p/${v._id}` : `/sysadmin/users/${v.userId}`,
          metadata: {
            entityType: "VERIFICATION",
            entityId: v._id.toString(),
            activityType,
            targetUrl: isPeerhostApp ? `/sysadmin/p2p/${v._id}` : `/sysadmin/users/${v.userId}`,
            sentToAdmin: true,
          },
        });
      }
    }

    if (docs.length > 0) {
      await AdminNotification.insertMany(docs);
    }

    return docs.length;
  }
}

export const adminNotificationService = new AdminNotificationService();
