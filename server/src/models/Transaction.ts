import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definition
 */
export interface ITransaction {
  bookingId: Schema.Types.ObjectId;
  payerId: Schema.Types.ObjectId;

  // Polymorphic receiver — a User, Company, or the platform itself ("System")
  receiverId?: Schema.Types.ObjectId | undefined;
  receiverModel?: "User" | "Company" | "System" | undefined;

  amount: number;
  currency: string; // ISO 4217 e.g. "ETB", "USD"

  type:
    | "RENTAL_FEE"
    | "COLLATERAL_DEPOSIT"
    | "REFUND"
    | "PAYOUT"
    | "COMMISSION"
    | "ESCROW_HOLD"
    | "ESCROW_RELEASE"
    | "REFUND_REVERSAL";

  status:
    | "PENDING"
    | "HELD_IN_ESCROW"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED"
    | "CANCELLED";

  paymentGatewayId?: string | undefined; // Chapa / Stripe / PayPal reference
  invoiceUrl?: string | undefined;
  metadata?: Schema.Types.Mixed | undefined; // Arbitrary gateway response data

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type TransactionDocument = HydratedDocument<ITransaction>;

/**
 * 2. Schema Definition
 */
const transactionSchema = new Schema<ITransaction>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    payerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    receiverId: { type: Schema.Types.ObjectId, refPath: "receiverModel" },
    receiverModel: {
      type: String,
      enum: ["User", "Company", "System"],
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Transaction amount cannot be negative"],
    },
    currency: { type: String, default: "ETB", uppercase: true, trim: true },

    type: {
      type: String,
      required: true,
      enum: [
        "RENTAL_FEE",
        "COLLATERAL_DEPOSIT",
        "REFUND",
        "PAYOUT",
        "COMMISSION",
        "ESCROW_HOLD",
        "ESCROW_RELEASE",
        "REFUND_REVERSAL",
      ],
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "HELD_IN_ESCROW",
        "COMPLETED",
        "FAILED",
        "REFUNDED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    paymentGatewayId: { type: String, trim: true },
    invoiceUrl: { type: String, trim: true },
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
 * 3. Performance Indexing
 */
transactionSchema.index({ bookingId: 1 });      // All transactions for a booking
transactionSchema.index({ payerId: 1 });         // All payments made by a user
transactionSchema.index({ receiverId: 1 });      // All payouts to a recipient
transactionSchema.index({ status: 1 });          // Filter by financial state
transactionSchema.index({ type: 1 });            // Filter by transaction type
transactionSchema.index({ createdAt: -1 });      // Latest-first for ledger views

export const Transaction = model<ITransaction>("Transaction", transactionSchema);
