import { Schema, model, type HydratedDocument } from "mongoose";
import { WALLET_OWNER_TYPES, type WalletOwnerType } from "./Wallet.js";

export const WALLET_ENTRY_TYPES = [
  "ESCROW_HOLD",
  "ESCROW_RELEASE",
  "DEPOSIT_HOLD",
  "DEPOSIT_REFUND",
  "DEPOSIT_RELEASE",
  "PAYOUT_DEBIT",
  "REFUND_DEBIT",
  "ADJUSTMENT",
] as const;

export type WalletEntryType = (typeof WALLET_ENTRY_TYPES)[number];

export interface IWalletEntry {
  walletId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  ownerType: WalletOwnerType;
  bookingId?: Schema.Types.ObjectId | undefined;
  transactionId?: Schema.Types.ObjectId | undefined;
  payoutId?: Schema.Types.ObjectId | undefined;
  entryType: WalletEntryType;
  currency: string;
  amount: number;
  balanceField: "pendingBalance" | "availableBalance";
  before: number;
  after: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown> | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type WalletEntryDocument = HydratedDocument<IWalletEntry>;

const walletEntrySchema = new Schema<IWalletEntry>(
  {
    walletId: { type: Schema.Types.ObjectId, required: true, ref: "Wallet" },
    ownerId: { type: Schema.Types.ObjectId, required: true, refPath: "ownerType" },
    ownerType: {
      type: String,
      required: true,
      enum: WALLET_OWNER_TYPES,
    },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    payoutId: { type: Schema.Types.ObjectId, ref: "Payout" },
    entryType: {
      type: String,
      required: true,
      enum: WALLET_ENTRY_TYPES,
    },
    currency: { type: String, required: true, uppercase: true, trim: true },
    amount: { type: Number, required: true },
    balanceField: {
      type: String,
      required: true,
      enum: ["pendingBalance", "availableBalance"],
    },
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    idempotencyKey: { type: String, required: true, trim: true, unique: true },
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

walletEntrySchema.index({ walletId: 1, createdAt: -1 });
walletEntrySchema.index({ ownerId: 1, ownerType: 1, createdAt: -1 });
walletEntrySchema.index({ bookingId: 1, entryType: 1 });

export const WalletEntry = model<IWalletEntry>("WalletEntry", walletEntrySchema);
