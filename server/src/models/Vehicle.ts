import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definitions
 */
export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IVehicleFeatures {
  transmission?: "MANUAL" | "AUTOMATIC" | undefined;
  fuelType?: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID" | undefined;
  seatingCapacity?: number | undefined;
  hasAC?: boolean | undefined;
  hasGPS?: boolean | undefined;
}

export interface IVehicle {
  // Ownership (Polymorphic)
  ownerId: Schema.Types.ObjectId;
  ownerType: "User" | "Company";

  // Basic Details
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  category: "SEDAN" | "SUV" | "LUXURY" | "TRUCK" | "VAN";

  // Rental Configuration
  isDriverAvailable: boolean;
  canSelfDrive: boolean;
  minRentalHours: number;
  pricePerHour: number;

  // Location Management (Pickup & Return can be different)
  pickupLocation: IGeoPoint;
  returnLocation: IGeoPoint;
  addressName?: string | undefined;

  // Status & Availability
  status:
    | "AVAILABLE"
    | "BOOKED"
    | "MAINTENANCE"
    | "RETIRED"
    | "PENDING_APPROVAL";

  // Dynamic Features
  features?: IVehicleFeatures | undefined;

  images: string[];
  verifiedAt?: Date | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type VehicleDocument = HydratedDocument<IVehicle>;

/**
 * 2. Schema Definition
 */
const pointSchema = new Schema<IGeoPoint>(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

const vehicleSchema = new Schema<IVehicle>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, refPath: "ownerType" },
    ownerType: { type: String, required: true, enum: ["User", "Company"] },

    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    plateNumber: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ["SEDAN", "SUV", "LUXURY", "TRUCK", "VAN"],
      required: true,
    },

    isDriverAvailable: { type: Boolean, default: false },
    canSelfDrive: {
      type: Boolean,
      default: true,
      alias: "allowsSelfDrive",
    },
    minRentalHours: { type: Number, default: 24 },
    pricePerHour: { type: Number, required: true },

    pickupLocation: { type: pointSchema, required: true },
    returnLocation: { type: pointSchema, required: true },
    addressName: { type: String, trim: true },

    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED", "MAINTENANCE", "RETIRED", "PENDING_APPROVAL"],
      default: "PENDING_APPROVAL",
    },

    features: {
      transmission: { type: String, enum: ["MANUAL", "AUTOMATIC"] },
      fuelType: { type: String, enum: ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"] },
      seatingCapacity: { type: Number },
      hasAC: { type: Boolean, default: true },
      hasGPS: { type: Boolean, default: true },
    },

    images: { type: [String], default: [] },
    verifiedAt: { type: Date },
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
vehicleSchema.index({ ownerId: 1, ownerType: 1 });
vehicleSchema.index({ plateNumber: 1 }, { unique: true });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ pickupLocation: "2dsphere" });

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);
