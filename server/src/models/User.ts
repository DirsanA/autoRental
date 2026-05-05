import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export enum AccountType {
  USER = "USER",
  COMPANY = "COMPANY",
  ADMIN = "ADMIN",
}

export enum VerificationLevel {
  NONE = "NONE",
  ID_VERIFIED = "ID_VERIFIED",
  LICENSE_VERIFIED = "LICENSE_VERIFIED",
  PEER_HOST = "PEER_HOST",
}
/**
 * 1. Interface Definitions
 * Defines the shape of the User data for TypeScript safety across the app.
 */
export interface IUser {
  accountType: AccountType;
  name?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
  emailVerified?: boolean | undefined;
  image?: string | undefined;
  phoneNumber?: string | undefined;
  roles: Types.ObjectId[];
  verificationLevel: VerificationLevel;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  walletBalance: number;

  // Identity Verification
  idNumber?: string | undefined;
  idImageUrl?: string | undefined;

  // Additional info for Peerhost
  address?: string | undefined;

  lastLogin?: Date | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type UserDocument = HydratedDocument<IUser>;

/**
 * 2. Schema Configuration
 * Implements validation rules, E.164 phone formatting, and transformation logic.
 */
const userSchema = new Schema<IUser>(
  {
    accountType: {
      type: String,
      enum: AccountType,
      default: AccountType.USER,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        "Phone number must be in valid E.164 format",
      ],
    },
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    verificationLevel: {
      type: String,
      enum: VerificationLevel,
      default: VerificationLevel.NONE,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED"],
      default: "PENDING",
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    idNumber: { type: String, trim: true },
    idImageUrl: { type: String, trim: true },
    address: { type: String, trim: true },
    lastLogin: { type: Date },
  },
  {
    collection: "user",
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
 * Optimized for high-frequency queries on account type and lifecycle state.
 */
userSchema.index({ accountType: 1, createdAt: -1 });
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

export const User = model<IUser>("User", userSchema);
