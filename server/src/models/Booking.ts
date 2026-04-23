import { Schema, model, type HydratedDocument } from "mongoose";
import { randomBytes } from "node:crypto";

/**
 * =========================
 * 1. PRICE SNAPSHOT
 * =========================
 * Stores immutable pricing details at the time of booking.
 * This ensures price consistency even if vehicle price changes later.
 */
export interface IPriceSnapshot {
  pricePerHour: number;        // Base hourly rental price
  systemCommission: number;    // Platform commission fee
  totalAmount: number;         // Final payable amount
  totalHours: number;          // Duration in hours
  currency: string;            // Currency (e.g. ETB)
}

/**
 * =========================
 * 2. COLLATERAL DETAILS
 * =========================
 * Security deposit or guarantee details for the booking.
 * Used mainly for self-drive rentals.
 */
export interface ICollateralDetails {
  hasCheque: boolean;                 // Whether cheque is provided
  cashAmount: number;                 // Cash deposit amount
  verifiedByStaff?: Schema.Types.ObjectId; // Staff who verified collateral
}

/**
 * =========================
 * 3. PAYMENT STRUCTURE
 * =========================
 * Handles payment tracking (Chapa / Cash / Bank / Telebirr).
 */
export interface IPayment {
  tx_ref?: string;   // Unique transaction reference (Chapa)
  checkoutUrl?: string;
  referenceId?: string;
  method?: "CHAPA" | "CASH" | "BANK_TRANSFER" | "TELEBIRR";
  status: "PENDING" | "PAID" | "FAILED";
  paidAt?: Date;     // Timestamp when payment was completed
  checkoutExpiresAt?: Date;
  lastVerifiedAt?: Date;
}

/**
 * =========================
 * 4. BOOKING MAIN ENTITY
 * =========================
 * Core booking model representing vehicle rental transaction.
 */
export interface IBooking {
  bookingId: string; // Human-readable unique ID (e.g. BK-ABC123XYZ)

  renterId: Schema.Types.ObjectId;  // User who booked the vehicle
  vehicleId: Schema.Types.ObjectId; // Vehicle being rented

  priceSnapshot: IPriceSnapshot; // Locked price details

  startTime: Date;  // Rental start time
  endTime: Date;    // Rental end time
  actualReturnTime?: Date; // Actual return time (if completed)

  withDriver: boolean; // Whether booking includes driver

  /**
   * =========================
   * BOOKING STATUS FLOW
   * =========================
   * PENDING → CONFIRMED → ACTIVE → COMPLETED
   * or CANCELLED / DISPUTED
   */
  status:
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

  payment: IPayment; // Payment tracking information

  pickupAddress?: string; // Where vehicle is picked up
  returnAddress?: string;  // Where vehicle is returned

  contactPhone: string; // Contact number for communication

  isBlocked: boolean; // Prevents double booking during payment process

  driverAssigned?: Schema.Types.ObjectId; // Assigned driver if applicable

  collateralDetails?: ICollateralDetails; // Security deposit info

  cancelReason?: string; // Reason for cancellation (if any)
  cancelledAt?: Date;    // Cancellation timestamp

  createdAt?: Date;
  updatedAt?: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

/**
 * =========================
 * 5. MONGOOSE SCHEMA
 * =========================
 * Defines database structure and validation rules.
 */
const bookingSchema = new Schema<IBooking>(
  {
    /**
     * Unique human-readable booking ID
     * Used instead of MongoDB _id for user-facing reference
     */
    bookingId: {
      type: String,
      unique: true,
      index: true,
      default: () => `BK-${randomBytes(5).toString("hex").toUpperCase()}`,
    },

    /**
     * Reference to user who created booking
     */

    renterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Vehicle being booked
     */
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    /**
     * Locked price snapshot at booking time
     */
    priceSnapshot: {
      pricePerHour: { type: Number, required: true },
      systemCommission: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      totalHours: { type: Number, required: true },
      currency: { type: String, default: "ETB" },
    },

    /**
     * Rental time range
     */
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    actualReturnTime: { type: Date },

    /**
     * Whether booking includes driver service
     */
    withDriver: { type: Boolean, default: false },

    /**
     * Booking lifecycle status
     */
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "PENDING",
      index: true,
    },

    /**
     * Payment tracking (Chapa / Cash / Bank)
     */
    payment: {
      tx_ref: { type: String, index: true },
      checkoutUrl: { type: String, trim: true },
      referenceId: { type: String, trim: true },
      method: {
        type: String,
        enum: ["CHAPA", "CASH", "BANK_TRANSFER", "TELEBIRR"],
      },
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
        index: true,
      },
      paidAt: Date,
      checkoutExpiresAt: Date,
      lastVerifiedAt: Date,
    },

    /**
     * Pickup & return locations
     */
    pickupAddress: { type: String, trim: true },
    returnAddress: { type: String, trim: true },

    /**
     * Contact number for renter-owner communication
     */
    contactPhone: {
      type: String,
      required: true,
    },

    /**
     * Prevents overlapping bookings during payment processing
     */
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * Assigned driver (if service is included)
     */
    driverAssigned: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    /**
     * Security deposit / collateral tracking
     */
    collateralDetails: {
      hasCheque: { type: Boolean, default: false },
      cashAmount: { type: Number, default: 0, min: 0 },
      verifiedByStaff: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },

    /**
     * Cancellation details
     */
    cancelReason: String,
    cancelledAt: Date,
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt

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
  }
);

/**
 * =========================
 * 6. INDEXES (Performance)
 * =========================
 */
bookingSchema.index({ renterId: 1 });
bookingSchema.index({ vehicleId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });

/**
 * Prevents double booking for same vehicle in overlapping time ranges
 */
bookingSchema.index(
  { vehicleId: 1, startTime: 1, endTime: 1 },
  { name: "vehicle_availability_index" }
);

/**
 * Export Booking Model
 */
export const Booking = model<IBooking>("Booking", bookingSchema);
