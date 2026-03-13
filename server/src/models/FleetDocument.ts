import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Constants — Single Source of Truth
 */
export const FLEET_DOCUMENT_TYPES = [
  "INSURANCE",
  "INSPECTION_BOLO",  // Bolo (Ethiopian roadworthiness certificate)
  "LIBRE",            // Libre (Ethiopian vehicle ownership booklet)
  "OPERATIONAL_PERMIT",
  "THIRD_PARTY_LIABILITY",
  "CUSTOMS_CLEARANCE", // For imported vehicles
] as const;

export type FleetDocumentType = (typeof FLEET_DOCUMENT_TYPES)[number];

export const FLEET_DOCUMENT_STATUSES = [
  "VALID",
  "EXPIRING_SOON",  // e.g. within 30 days — set by background job
  "EXPIRED",
  "PENDING_RENEWAL",
  "REJECTED",       // Submitted renewal was rejected by authority
] as const;

export type FleetDocumentStatus = (typeof FLEET_DOCUMENT_STATUSES)[number];

/**
 * 2. Interface Definition
 */
export interface IFleetDocument {
  vehicleId: Schema.Types.ObjectId;

  type: FleetDocumentType;
  documentNumber: string;

  issuedDate?: Date | undefined;   // When the document was issued
  expiryDate: Date;

  fileUrl: string;                 // Stored document scan/photo
  status: FleetDocumentStatus;

  remindersSent: number;           // Tracks how many expiry reminders have been dispatched

  /**
   * Optional notes from admin or fleet manager.
   * Useful when a document is rejected or flagged for follow-up.
   */
  notes?: string | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type FleetDocumentDocument = HydratedDocument<IFleetDocument>;

/**
 * 3. Schema Definition
 */
const fleetDocumentSchema = new Schema<IFleetDocument>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },

    type: {
      type: String,
      required: true,
      enum: FLEET_DOCUMENT_TYPES,
    },
    documentNumber: { type: String, required: true, trim: true },

    issuedDate: { type: Date },
    expiryDate: { type: Date, required: true },

    fileUrl: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: FLEET_DOCUMENT_STATUSES,
      default: "VALID" satisfies FleetDocumentStatus,
    },

    remindersSent: { type: Number, default: 0, min: 0 },

    notes: { type: String, trim: true, maxlength: 1000 },
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
 * The background job that auto-disables Vehicles with expired documents
 * relies on the compound (expiryDate + status) index for efficient scanning.
 */
fleetDocumentSchema.index({ expiryDate: 1, status: 1 }); // Background job: expiry scanner
fleetDocumentSchema.index({ vehicleId: 1, type: 1 });    // All docs of a given type for a vehicle
fleetDocumentSchema.index({ vehicleId: 1 });             // All docs for a vehicle

export const FleetDocument = model<IFleetDocument>("FleetDocument", fleetDocumentSchema);
