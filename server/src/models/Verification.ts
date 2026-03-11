import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definition
 */
export interface IVerification {
  userId: Schema.Types.ObjectId; // The uploader
  companyId?: Schema.Types.ObjectId | undefined; // Link if this is a business verification

  documentType:
    | "NATIONAL_ID"
    | "PASSPORT"
    | "DRIVER_LICENSE"
    | "BUSINESS_LICENSE";
  documentFrontUrl: string;
  documentBackUrl?: string | undefined;

  // OCR/AI Extracted Metadata
  extractedData?: Record<string, any> | undefined;

  status: "PENDING" | "APPROVED" | "REJECTED";
  adminComment?: string | undefined;
  verifiedBy?: Schema.Types.ObjectId | undefined;
  verifiedAt?: Date | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type VerificationDocument = HydratedDocument<IVerification>;

/**
 * 2. Schema Definition
 */
const verificationSchema = new Schema<IVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" }, // Optional for P2P users

    documentType: {
      type: String,
      enum: ["NATIONAL_ID", "PASSPORT", "DRIVER_LICENSE", "BUSINESS_LICENSE"],
      required: true,
    },
    documentFrontUrl: { type: String, required: true },
    documentBackUrl: { type: String },

    extractedData: { type: Schema.Types.Mixed }, // Flexible for various doc types

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    adminComment: String,
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
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
 * 3. Performance & Governance
 */
verificationSchema.index({ userId: 1 });
verificationSchema.index({ companyId: 1 });
verificationSchema.index({ status: 1 });

export const Verification = model<IVerification>(
  "Verification",
  verificationSchema,
);
