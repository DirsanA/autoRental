import { Schema, model, type HydratedDocument, type Model } from "mongoose";

/**
 * Entity types that support action-required tracking
 */
export const ENTITY_TYPES = [
  "USER",
  "P2P_HOST",
  "COMPANY",
  "VEHICLE",
  "VERIFICATION",
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/**
 * Interface for admin view tracking
 * Tracks which admin has viewed which action-required entities
 */
export interface IAdminViewTracking {
  /** The admin who viewed the entity */
  adminId: Schema.Types.ObjectId;

  /** Type of entity viewed (USER, P2P_HOST, COMPANY, etc.) */
  entityType: EntityType;

  /** The specific entity ID that was viewed */
  entityId: Schema.Types.ObjectId;

  /** When the entity was first viewed */
  viewedAt: Date;

  /** Whether the admin took action on this entity (approve/reject/etc) */
  actionTaken?: boolean;

  /** When action was taken */
  actionTakenAt?: Date;

  /** Optional metadata for future extensibility */
  metadata?: Record<string, unknown>;
}

export type AdminViewTrackingDocument = HydratedDocument<IAdminViewTracking>;

/**
 * Schema definition for admin view tracking
 */
const adminViewTrackingSchema = new Schema<IAdminViewTracking>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ENTITY_TYPES,
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    actionTaken: {
      type: Boolean,
      default: false,
    },
    actionTakenAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
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
 * Compound index for unique view tracking per admin-entity combination
 */
adminViewTrackingSchema.index(
  { adminId: 1, entityType: 1, entityId: 1 },
  { unique: true },
);

/**
 * Index for querying viewed records by admin and type
 */
adminViewTrackingSchema.index({ adminId: 1, entityType: 1, viewedAt: -1 });

/**
 * Index for querying by entity (useful for admin dashboard stats)
 */
adminViewTrackingSchema.index({ entityType: 1, createdAt: -1 });

/**
 * Static method: Mark an entity as viewed by an admin
 */
adminViewTrackingSchema.statics.markAsViewed = async function (
  adminId: string,
  entityType: EntityType,
  entityId: string,
): Promise<void> {
  await this.findOneAndUpdate(
    { adminId, entityType, entityId },
    {
      adminId,
      entityType,
      entityId,
      viewedAt: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
};

/**
 * Static method: Mark multiple entities as viewed (batch operation for list views)
 */
adminViewTrackingSchema.statics.markPageAsViewed = async function (
  adminId: string,
  entityType: EntityType,
  entityIds: string[],
): Promise<void> {
  const operations = entityIds.map((entityId) => ({
    updateOne: {
      filter: { adminId, entityType, entityId },
      update: {
        $setOnInsert: {
          adminId,
          entityType,
          entityId,
          viewedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await this.bulkWrite(operations);
  }
};

/**
 * Static method: Check if an entity was viewed by an admin
 */
adminViewTrackingSchema.statics.isViewed = async function (
  adminId: string,
  entityType: EntityType,
  entityId: string,
): Promise<boolean> {
  const record = await this.findOne({ adminId, entityType, entityId });
  return !!record;
};

/**
 * Static method: Get count of unviewed entities from a list
 */
adminViewTrackingSchema.statics.getUnviewedCount = async function (
  adminId: string,
  entityType: EntityType,
  entityIds: string[],
): Promise<number> {
  const viewedRecords = await this.find({
    adminId,
    entityType,
    entityId: { $in: entityIds },
  }).select("entityId");

  const viewedIds = new Set(viewedRecords.map((r) => r.entityId.toString()));
  return entityIds.filter((id) => !viewedIds.has(id)).length;
};

/**
 * Static method: Get list of viewed entity IDs
 */
adminViewTrackingSchema.statics.getViewedIds = async function (
  adminId: string,
  entityType: EntityType,
  entityIds: string[],
): Promise<string[]> {
  const viewedRecords = await this.find({
    adminId,
    entityType,
    entityId: { $in: entityIds },
  }).select("entityId");

  return viewedRecords.map((r) => r.entityId.toString());
};

/**
 * Static method: Mark action as taken on an entity
 */
adminViewTrackingSchema.statics.markActionTaken = async function (
  adminId: string,
  entityType: EntityType,
  entityId: string,
): Promise<void> {
  await this.findOneAndUpdate(
    { adminId, entityType, entityId },
    {
      actionTaken: true,
      actionTakenAt: new Date(),
    },
    { upsert: true, new: true },
  );
};

export interface AdminViewTrackingModel extends Model<IAdminViewTracking> {
  markAsViewed(
    adminId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<void>;
  markPageAsViewed(
    adminId: string,
    entityType: EntityType,
    entityIds: string[],
  ): Promise<void>;
  isViewed(
    adminId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<boolean>;
  getUnviewedCount(
    adminId: string,
    entityType: EntityType,
    entityIds: string[],
  ): Promise<number>;
  getViewedIds(
    adminId: string,
    entityType: EntityType,
    entityIds: string[],
  ): Promise<string[]>;
  markActionTaken(
    adminId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<void>;
}

export const AdminViewTracking = model<
  IAdminViewTracking,
  AdminViewTrackingModel
>("AdminViewTracking", adminViewTrackingSchema);
