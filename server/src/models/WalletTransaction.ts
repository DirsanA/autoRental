import { Schema, model, type HydratedDocument } from "mongoose";
import type { WalletOwnerType } from "./Wallet.js";

export const WALLET_TRANSACTION_TYPES = [
  "CREDIT_PENDING",
  "CREDIT_AVAILABLE",
  "DEBIT_PAYOUT",
  "REFUND",
] as const;
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number];

export const WALLET_TRANSACTION_STATUSES = ["PENDING", "COMPLETED"] as const;
export type WalletTransactionStatus =
  (typeof WALLET_TRANSACTION_STATUSES)[number];

export interface IWalletTransaction {
  ownerId: Schema.Types.ObjectId;
  ownerType: WalletOwnerType;
  bookingId?: Schema.Types.ObjectId;
  amount: number;
  currency: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  description?: string;

  /** For idempotency when driven by a payment reference (e.g. Chapa tx_ref). */
  sourceTxRef?: string;

  createdAt?: Date;
}

export type WalletTransactionDocument = HydratedDocument<IWalletTransaction>;

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, refPath: "ownerType" },
    ownerType: { type: String, required: true, enum: ["User", "Company"] },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "ETB", uppercase: true, trim: true },
    type: { type: String, required: true, enum: WALLET_TRANSACTION_TYPES },
    status: { type: String, required: true, enum: WALLET_TRANSACTION_STATUSES },
    description: { type: String, trim: true },
    sourceTxRef: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

walletTransactionSchema.index({ ownerId: 1, ownerType: 1, createdAt: -1 });
walletTransactionSchema.index({ bookingId: 1, type: 1 }, { sparse: true });
walletTransactionSchema.index({ sourceTxRef: 1 }, { unique: true, sparse: true });

export const WalletTransaction = model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema,
);

