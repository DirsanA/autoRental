import { Schema, model, type HydratedDocument } from "mongoose";

export const WALLET_OWNER_TYPES = ["User", "Company"] as const;
export type WalletOwnerType = (typeof WALLET_OWNER_TYPES)[number];

export interface IWallet {
  ownerId: Schema.Types.ObjectId;
  ownerType: WalletOwnerType;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WalletDocument = HydratedDocument<IWallet>;

const walletSchema = new Schema<IWallet>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, refPath: "ownerType" },
    ownerType: { type: String, required: true, enum: WALLET_OWNER_TYPES },
    availableBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "ETB", uppercase: true, trim: true },
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

// One wallet per owner.
walletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
walletSchema.index({ updatedAt: -1 });

export const Wallet = model<IWallet>("Wallet", walletSchema);

