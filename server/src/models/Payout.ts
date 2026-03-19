import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Constants — Single Source of Truth
 */
export const PAYOUT_OWNER_TYPES = ["User", "Company"] as const;
export type PayoutOwnerType = (typeof PAYOUT_OWNER_TYPES)[number];

export const PAYOUT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED", // Manually cancelled before processing
] as const;

export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const PAYOUT_METHODS = [
  "BANK_TRANSFER",
  "TELEBIRR",
  "CHAPA",
  "MANUAL",  // Cash or offline disbursement handled outside the system
] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

/**
 * 2. Interface Definition
 */
export interface IPayout {
  // Polymorphic owner — either a private host (User) or a fleet company
  ownerId: Schema.Types.ObjectId;
  ownerType: PayoutOwnerType;

  amount: number;
  currency: string; // ISO 4217 e.g. "ETB", "USD"

  /** All Transaction documents included in this payout batch */
  transactionIds: Schema.Types.ObjectId[];

  status: PayoutStatus;
  payoutMethod?: PayoutMethod | undefined;

  /**
   * The reference number returned by the bank, Telebirr, or Chapa.
   * Used for reconciliation and dispute resolution.
   */
  gatewayReference?: string | undefined;

  /** Reason provided when status is FAILED or CANCELLED */
  failureReason?: string | undefined;

  processedAt?: Date | undefined; // When status moved to PROCESSING
  paidAt?: Date | undefined;      // When status moved to PAID

  /**
   * Open-ended payload for gateway-specific response data.
   * Example: { chapaTransactionId: "...", bankCode: "CBE" }
   */
  metadata?: Record<string, unknown> | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type PayoutDocument = HydratedDocument<IPayout>;

/**
 * 3. Schema Definition
 */
const payoutSchema = new Schema<IPayout>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "ownerType",
    },
    ownerType: {
      type: String,
      required: true,
      enum: PAYOUT_OWNER_TYPES,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Payout amount cannot be negative"],
    },
    currency: { type: String, default: "ETB", uppercase: true, trim: true },

    transactionIds: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],

    status: {
      type: String,
      enum: PAYOUT_STATUSES,
      default: "PENDING" satisfies PayoutStatus,
    },
    payoutMethod: {
      type: String,
      enum: PAYOUT_METHODS,
    },

    gatewayReference: { type: String, trim: true },
    failureReason: { type: String, trim: true },

    processedAt: { type: Date },
    paidAt: { type: Date },

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
payoutSchema.index({ ownerId: 1, ownerType: 1 });  // All payouts for an owner
payoutSchema.index({ status: 1 });                  // Admin payout queue filtering
payoutSchema.index({ paidAt: -1 });                 // Payout history — newest first
payoutSchema.index({ gatewayReference: 1 });        // Reconciliation-by-reference lookups

export const Payout = model<IPayout>("Payout", payoutSchema);
