import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definitions
 * Defines dynamic permissions and conditional logic for CASL integration.
 */
export interface IRole {
  name: string;
  description?: string | undefined;
  permissions: {
    action: string;
    subject: string;
    conditions?: Record<string, any> | undefined;
  }[];
  isSystemRole: boolean;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type RoleDocument = HydratedDocument<IRole>;

/**
 * 2. Schema Configuration
 * Stores granular permissions with Mixed types for flexible MongoDB-style conditions.
 */
const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    permissions: [
      {
        action: { type: String, required: true },
        subject: { type: String, required: true },
        conditions: { type: Schema.Types.Mixed }, // Supports dynamic rules (e.g., ownerId match)
      },
    ],
    isSystemRole: { type: Boolean, default: false },
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
 * 3. Model Export
 */
export const Role = model<IRole>("Role", roleSchema);
