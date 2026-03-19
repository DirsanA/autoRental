import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Constants — Single Source of Truth
 */
export const AVAILABILITY_BLOCK_REASONS = [
  "BOOKING",        // Blocked by an active rental
  "MAINTENANCE",    // Scheduled service or repair
  "OWNER_USE",      // Owner is personally using the vehicle
  "OFF_SEASON",     // Owner has taken the vehicle off the platform temporarily
  "ADMIN_HOLD",     // Platform admin placed a hold (e.g. pending investigation)
  "PENDING_DELIVERY", // Vehicle is in transit between locations
] as const;

export type AvailabilityBlockReason = (typeof AVAILABILITY_BLOCK_REASONS)[number];

/**
 * Who or what created this availability block.
 * Distinguishes automatic system blocks (from booking flow) vs. manual ones.
 */
export const AVAILABILITY_SOURCES = [
  "SYSTEM",  // Auto-created by the booking or maintenance service
  "OWNER",   // Manually created by the vehicle owner
  "ADMIN",   // Manually created by a platform administrator
] as const;

export type AvailabilitySource = (typeof AVAILABILITY_SOURCES)[number];

/**
 * 2. Interface Definition
 */
export interface IAvailability {
  vehicleId: Schema.Types.ObjectId;

  /**
   * Inclusive date range during which the vehicle is NOT available.
   * Availability query: find vehicles with NO overlapping block in the requested range.
   */
  startDate: Date;
  endDate: Date;

  reason: AvailabilityBlockReason;
  source: AvailabilitySource;

  /**
   * Reference to the document that caused this block.
   * Optional — only set when reason is BOOKING or MAINTENANCE.
   */
  bookingId?: Schema.Types.ObjectId | undefined;
  maintenanceId?: Schema.Types.ObjectId | undefined;

  /**
   * Optional note — useful for OWNER_USE, OFF_SEASON, or ADMIN_HOLD
   * where no linked document explains the reason.
   */
  notes?: string | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type AvailabilityDocument = HydratedDocument<IAvailability>;

/**
 * 3. Schema Definition
 */
const availabilitySchema = new Schema<IAvailability>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    reason: {
      type: String,
      enum: AVAILABILITY_BLOCK_REASONS,
      default: "BOOKING" satisfies AvailabilityBlockReason,
    },
    source: {
      type: String,
      enum: AVAILABILITY_SOURCES,
      default: "SYSTEM" satisfies AvailabilitySource,
    },

    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    maintenanceId: { type: Schema.Types.ObjectId, ref: "Maintenance" },

    notes: { type: String, trim: true, maxlength: 500 },
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
 *
 * The compound index on (vehicleId, startDate, endDate) is the core of the
 * availability query:
 *   db.availabilities.find({ vehicleId, startDate: { $lt: endDate }, endDate: { $gt: startDate } })
 * This finds all blocks that overlap with the requested rental window.
 */
availabilitySchema.index({ vehicleId: 1, startDate: 1, endDate: 1 }); // Availability overlap queries
availabilitySchema.index({ bookingId: 1 });                            // Look up block by booking
availabilitySchema.index({ reason: 1, source: 1 });                   // Filter by block type

export const Availability = model<IAvailability>("Availability", availabilitySchema);
