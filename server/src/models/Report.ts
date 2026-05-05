import { Schema, model, type HydratedDocument } from "mongoose";

export const REPORT_TYPES = [
  "SYSTEM_GLITCH",
  "USER_BEHAVIOR",
  "VEHICLE_ISSUE",
  "COMPANY_ISSUE",
  "OTHER",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "CLOSED",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type ReportPriority = (typeof REPORT_PRIORITIES)[number];

export const REPORT_SUBJECT_MODELS = [
  "User",
  "Vehicle",
  "Company",
  "Booking",
] as const;

export type ReportSubjectModel = (typeof REPORT_SUBJECT_MODELS)[number];

export interface IAdminResolution {
  resolvedBy: Schema.Types.ObjectId;
  resolutionNotes: string;
  actionTaken: string;
  resolvedAt: Date;
}

export interface IInternalNote {
  authorId: Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IReport {
  reportedBy: Schema.Types.ObjectId;
  type: ReportType;
  
  subjectId?: Schema.Types.ObjectId | undefined;
  subjectModel?: ReportSubjectModel | undefined;

  description: string;
  evidenceUrls: string[];
  
  priority: ReportPriority;
  status: ReportStatus;

  metadata?: Record<string, any> | undefined; // Tech context: Browser, URL, OS, etc.
  
  internalNotes: IInternalNote[];
  adminResolution?: IAdminResolution | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type ReportDocument = HydratedDocument<IReport>;

const reportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: REPORT_TYPES,
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      refPath: "subjectModel",
    },
    subjectModel: {
      type: String,
      enum: REPORT_SUBJECT_MODELS,
    },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    evidenceUrls: { type: [String], default: [] },
    priority: {
      type: String,
      enum: REPORT_PRIORITIES,
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "OPEN",
    },
    metadata: { type: Schema.Types.Mixed },
    internalNotes: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
    adminResolution: {
      resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      resolutionNotes: { type: String },
      actionTaken: { type: String },
      resolvedAt: { type: Date },
    },
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
  }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ subjectId: 1, subjectModel: 1, createdAt: -1 });

export const Report = model<IReport>("Report", reportSchema);
