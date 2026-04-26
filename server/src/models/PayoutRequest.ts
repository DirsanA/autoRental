import { Schema, model, type HydratedDocument } from "mongoose";
import type { WalletOwnerType } from "./Wallet.js";

export const PAYOUT_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type PayoutRequestStatus = (typeof PAYOUT_REQUEST_STATUSES)[number];

export interface IPayoutRequest {
  ownerId: Schema.Types.ObjectId;
  ownerType: WalletOwnerType;
  amount: number;
  currency: string;
  status: PayoutRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  processedByAuthUserId?: string;
  rejectionReason?: string;
}

export type PayoutRequestDocument = HydratedDocument<IPayoutRequest>;

const payoutRequestSchema = new Schema<IPayoutRequest>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, refPath: "ownerType" },
    ownerType: { type: String, required: true, enum: ["User", "Company"] },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "ETB", uppercase: true, trim: true },
    status: { type: String, enum: PAYOUT_REQUEST_STATUSES, default: "PENDING" },
    requestedAt: { type: Date, default: () => new Date() },
    processedAt: { type: Date },
    processedByAuthUserId: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
  },
  {
    timestamps: false,
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

payoutRequestSchema.index({ ownerId: 1, ownerType: 1, requestedAt: -1 });
payoutRequestSchema.index({ status: 1, requestedAt: -1 });

export const PayoutRequest = model<IPayoutRequest>(
  "PayoutRequest",
  payoutRequestSchema,
);

