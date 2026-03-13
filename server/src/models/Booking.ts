import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definitions
 */
export interface IPriceSnapshot {
  pricePerHour: number;
  systemCommission: number;
  totalAmount: number;
}

export interface ICollateralDetails {
  hasCheque: boolean;
  cashAmount: number;
  verifiedByStaff?: Schema.Types.ObjectId | undefined; // Staff User who verified
}

export interface IBooking {
  bookingId: string; // Custom human-readable ID e.g. "BK-ABC123XYZ"

  renterId: Schema.Types.ObjectId;
  vehicleId: Schema.Types.ObjectId;

  // Immutable price record at time of booking
  priceSnapshot: IPriceSnapshot;

  // Timing
  startTime: Date;
  endTime: Date;
  actualReturnTime?: Date | undefined;

  // Options
  withDriver: boolean;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED";

  // Logistics
  pickupAddress?: string | undefined;
  returnAddress?: string | undefined;

  // Collateral (for self-drive bookings)
  collateralDetails?: ICollateralDetails | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type BookingDocument = HydratedDocument<IBooking>;

/**
 * 2. Schema Definition
 */
const bookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      unique: true,
      default: () => `BK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    },

    renterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },

    priceSnapshot: {
      pricePerHour: { type: Number, required: true },
      systemCommission: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
    },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    actualReturnTime: { type: Date },

    withDriver: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"],
      default: "PENDING",
    },

    pickupAddress: { type: String, trim: true },
    returnAddress: { type: String, trim: true },

    collateralDetails: {
      hasCheque: { type: Boolean, default: false },
      cashAmount: { type: Number, default: 0, min: 0 },
      verifiedByStaff: { type: Schema.Types.ObjectId, ref: "User" },
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
 * 3. Performance Indexing
 */
bookingSchema.index({ bookingId: 1 }, { unique: true }); // Quick lookup by human-readable ID
bookingSchema.index({ renterId: 1 });                    // All bookings for a renter
bookingSchema.index({ vehicleId: 1 });                   // All bookings for a vehicle
bookingSchema.index({ status: 1 });                      // Filter by booking state
bookingSchema.index({ startTime: 1, endTime: 1 });       // Availability range queries

export const Booking = model<IBooking>("Booking", bookingSchema);
