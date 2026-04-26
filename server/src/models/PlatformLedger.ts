import { Schema, model, type HydratedDocument } from "mongoose";

export interface IPlatformLedger {
  currency: string;
  totalCollected: number; // total customer payments collected
  totalCommission: number; // total platform commission accumulated
  totalPaidOut: number; // total payouts approved/paid
  createdAt?: Date;
  updatedAt?: Date;
}

export type PlatformLedgerDocument = HydratedDocument<IPlatformLedger>;

const platformLedgerSchema = new Schema<IPlatformLedger>(
  {
    currency: { type: String, default: "ETB", uppercase: true, trim: true, unique: true },
    totalCollected: { type: Number, default: 0, min: 0 },
    totalCommission: { type: Number, default: 0, min: 0 },
    totalPaidOut: { type: Number, default: 0, min: 0 },
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

export const PlatformLedger = model<IPlatformLedger>(
  "PlatformLedger",
  platformLedgerSchema,
);

