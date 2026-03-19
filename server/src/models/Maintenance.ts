import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definition
 */
export interface IMaintenance {
  vehicleId: Schema.Types.ObjectId;

  taskName: string; // e.g. "Oil Change", "Brake Check"
  description?: string | undefined;

  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

  scheduledDate: Date;
  completedDate?: Date | undefined;

  cost: number;
  performedBy?: string | undefined; // Service center name

  attachments?: string[] | undefined; // Receipts or inspection reports

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type MaintenanceDocument = HydratedDocument<IMaintenance>;

/**
 * 2. Schema Definition
 */
const maintenanceSchema = new Schema<IMaintenance>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },

    taskName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },

    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },

    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    performedBy: { type: String, trim: true },

    attachments: { type: [String], default: [] },
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
maintenanceSchema.index({ vehicleId: 1 }); // Fetch all maintenance for a vehicle
maintenanceSchema.index({ status: 1 }); // Filter by current status
maintenanceSchema.index({ scheduledDate: 1 }); // Sort/filter by upcoming schedule

export const Maintenance = model<IMaintenance>("Maintenance", maintenanceSchema);
