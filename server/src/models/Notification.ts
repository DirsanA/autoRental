import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Category & Priority Constants
 *
 * Using `as const` arrays as the single source of truth:
 *   - The schema enum is derived from these arrays (no duplication)
 *   - TypeScript union types are inferred automatically
 *   - Adding a new category/priority only requires editing ONE place
 */
export const NOTIFICATION_CATEGORIES = [
  "BOOKING_UPDATE",
  "PAYMENT",
  "VERIFICATION",
  "SYSTEM_ALERT",
  "DISPUTE",
  "MAINTENANCE",
  "REVIEW",
  "ACCOUNT",
  "PROMOTION",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_CHANNELS = ["IN_APP", "EMAIL", "SMS", "PUSH"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

/**
 * 2. Interface Definition
 */
export interface IRelatedEntity {
  /**
   * The ObjectId of the related document.
   * Kept as ObjectId so Mongoose can populate it if needed.
   */
  id: Schema.Types.ObjectId;

  /**
   * A free-form string (not enum-locked) naming the Mongoose model.
   * This makes the notification system usable by any future model
   * without a schema migration (e.g. "Rental", "DriverProfile").
   */
  entityType: string;
}

export interface INotification {
  recipientId: Schema.Types.ObjectId;

  title: string;
  message: string;

  category: NotificationCategory;
  priority: NotificationPriority;

  /** Which delivery channels this notification was sent through */
  channels: NotificationChannel[];

  isRead: boolean;
  readAt?: Date | undefined;

  /** Deep link or absolute URL to navigate to on click */
  actionUrl?: string | undefined;

  /** The document that triggered this notification */
  relatedEntity?: IRelatedEntity | undefined;

  /** TTL for ephemeral notifications (e.g. flash sales, OTP alerts) */
  expiresAt?: Date | undefined;

  /**
   * Open-ended payload for feature-specific data.
   * Avoids adding new top-level fields to this schema for every feature.
   * Example: { oldStatus: "PENDING", newStatus: "CONFIRMED" }
   */
  metadata?: Record<string, unknown> | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type NotificationDocument = HydratedDocument<INotification>;

/**
 * 3. Schema Definition
 */
const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    // Enum is sourced directly from the exported const — single source of truth
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORIES,
      required: true,
    },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITIES,
      default: "MEDIUM" satisfies NotificationPriority,
    },
    channels: {
      type: [String],
      enum: NOTIFICATION_CHANNELS,
      default: ["IN_APP"] satisfies NotificationChannel[],
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },

    actionUrl: { type: String, trim: true },

    relatedEntity: {
      id: { type: Schema.Types.ObjectId },
      // String (not enum) — intentionally open to accommodate future models
      entityType: { type: String, trim: true },
    },

    expiresAt: { type: Date },

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

/**
 * 4. Performance Indexing
 */
notificationSchema.index({ recipientId: 1, isRead: 1 });     // Unread count & inbox queries
notificationSchema.index({ recipientId: 1, createdAt: -1 }); // Inbox — newest first
notificationSchema.index({ category: 1 });                    // Filter by category
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete

export const Notification = model<INotification>("Notification", notificationSchema);
