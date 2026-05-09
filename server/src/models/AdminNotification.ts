import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * Separate collection for admin in-app notifications.
 * Each notification targets a specific admin (recipientId) and tracks
 * actions required from users, peerhosts, companies, vehicles, and verifications.
 */
export const ADMIN_NOTIFICATION_CATEGORIES = [
  "USER_ACTIVITY",
  "COMPANY_ACTIVITY",
  "VEHICLE_ACTIVITY",
  "VERIFICATION_ACTIVITY",
  "P2P_ACTIVITY",
  "SYSTEM_ALERT",
] as const;

export type AdminNotificationCategory =
  (typeof ADMIN_NOTIFICATION_CATEGORIES)[number];

export const ADMIN_NOTIFICATION_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;
export type AdminNotificationPriority =
  (typeof ADMIN_NOTIFICATION_PRIORITIES)[number];

export interface IAdminNotification {
  recipientId: Schema.Types.ObjectId;

  title: string;
  message: string;

  category: AdminNotificationCategory;
  priority: AdminNotificationPriority;

  isRead: boolean;
  readAt?: Date | undefined;

  actionUrl?: string | undefined;

  relatedEntity?: {
    id: Schema.Types.ObjectId;
    entityType: string;
  };

  metadata?: Record<string, unknown> | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type AdminNotificationDocument =
  HydratedDocument<IAdminNotification>;

const adminNotificationSchema = new Schema<IAdminNotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    category: {
      type: String,
      enum: ADMIN_NOTIFICATION_CATEGORIES,
      required: true,
    },
    priority: {
      type: String,
      enum: ADMIN_NOTIFICATION_PRIORITIES,
      default: "MEDIUM" satisfies AdminNotificationPriority,
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },

    actionUrl: { type: String, trim: true },

    relatedEntity: {
      id: { type: Schema.Types.ObjectId },
      entityType: { type: String, trim: true },
    },

    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

adminNotificationSchema.index({ recipientId: 1, isRead: 1 });
adminNotificationSchema.index({ recipientId: 1, createdAt: -1 });
adminNotificationSchema.index({ category: 1 });

export const AdminNotification = model<IAdminNotification>(
  "AdminNotification",
  adminNotificationSchema,
);
