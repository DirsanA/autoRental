import { Schema, model, type HydratedDocument, type Types } from "mongoose";

/**
 * 1. Interface Definitions
 */
export type VehicleOwnerType = "User" | "Company";
export type VehicleFuel = "petrol" | "diesel" | "hybrid" | "electric";
export type VehicleTransmission = "manual" | "automatic" | "cvt";
export type VehicleStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "MAINTENANCE"
  | "RETIRED"
  | "SUSPENDED"
  | "PENDING_APPROVAL";

export interface IVehiclePhotos {
  front?: string | undefined;
  back?: string | undefined;
  side?: string | undefined;
  interior?: string | undefined;
  gallery?: string[] | undefined;
}

export interface IVehicleDocuments {
  ownership?: string | undefined;
  insurance?: string | undefined;
}

export interface IVehicle {
  // Ownership
  ownerId: Types.ObjectId;
  ownerType: VehicleOwnerType;

  // Become Host: Car details
  make: string;
  model: string;
  year: number;
  vin?: string | undefined;
  plate: string;

  // Become Host: Specs and comfort
  mileage?: number | undefined;
  fuel?: VehicleFuel | undefined;
  transmission?: VehicleTransmission | undefined;
  seats?: number | undefined;
  features: string[];
  condition?: string | undefined;

  // Become Host: Pricing
  price: number;
  weeklyDiscount?: number | undefined;
  monthlyDiscount?: number | undefined;

  // Become Host: Optional availability and delivery notes
  availability?: string | undefined;
  delivery?: string | undefined;

  // Become Host: Uploaded media and documents
  photos?: IVehiclePhotos | undefined;
  documents?: IVehicleDocuments | undefined;

  // Lifecycle
  status: VehicleStatus;
  adminComment?: string | undefined;
  verifiedBy?: Types.ObjectId | undefined;
  verifiedAt?: Date | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type VehicleDocument = HydratedDocument<IVehicle>;

/**
 * 2. Schema Definition
 */
const photosSchema = new Schema<IVehiclePhotos>(
  {
    front: { type: String, trim: true },
    back: { type: String, trim: true },
    side: { type: String, trim: true },
    interior: { type: String, trim: true },
    gallery: { type: [String], default: [] },
  },
  { _id: false },
);

const documentsSchema = new Schema<IVehicleDocuments>(
  {
    ownership: { type: String, trim: true },
    insurance: { type: String, trim: true },
  },
  { _id: false },
);

const vehicleSchema = new Schema<IVehicle>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, refPath: "ownerType" },
    ownerType: { type: String, required: true, enum: ["User", "Company"] },

    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1900 },
    vin: { type: String, trim: true, uppercase: true },
    plate: { type: String, required: true, unique: true, trim: true, uppercase: true },

    mileage: { type: Number, min: 0 },
    fuel: {
      type: String,
      enum: ["petrol", "diesel", "hybrid", "electric"],
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic", "cvt"],
    },
    seats: { type: Number, min: 1 },
    features: { type: [String], default: [] },
    condition: { type: String, trim: true },

    price: { type: Number, required: true, min: 0 },
    weeklyDiscount: { type: Number, min: 0, max: 100 },
    monthlyDiscount: { type: Number, min: 0, max: 100 },

    availability: { type: String, trim: true },
    delivery: { type: String, trim: true },

    photos: { type: photosSchema, default: {} },
    documents: { type: documentsSchema, default: {} },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "BOOKED",
        "MAINTENANCE",
        "RETIRED",
        "SUSPENDED",
        "PENDING_APPROVAL",
      ],
      default: "PENDING_APPROVAL",
    },

    adminComment: { type: String, trim: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
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
vehicleSchema.index({ ownerId: 1, ownerType: 1, createdAt: -1 });
vehicleSchema.index({ ownerId: 1, createdAt: -1 });
vehicleSchema.index({ status: 1, createdAt: -1 });
vehicleSchema.index({ make: 1, model: 1, year: -1 });
vehicleSchema.index({ price: 1 });

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);
