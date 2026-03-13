import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Constants — Single Source of Truth
 *
 * Exporting these allows services and controllers to reference the
 * same values without hardcoding strings (e.g. in switch statements).
 */
export const DISPUTE_ISSUE_CATEGORIES = [
  "VEHICLE_CONDITION",
  "LATE_RETURN",
  "PAYMENT_ISSUE",
  "DRIVER_CONDUCT",
  "LISTING_MISREPRESENTATION",
  "COLLATERAL_DISPUTE",
  "OTHER",
] as const;

export type DisputeIssueCategory = (typeof DISPUTE_ISSUE_CATEGORIES)[number];

export const DISPUTE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "AWAITING_RESPONSE", // Waiting for the other party to respond
  "RESOLVED",
  "CLOSED",
] as const;

export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_ACTIONS_TAKEN = [
  "FULL_REFUND",
  "PARTIAL_REFUND",
  "PAYOUT_RELEASED",
  "PENALTY_APPLIED",
  "WARNING_ISSUED",
  "NO_ACTION",
] as const;

export type DisputeActionTaken = (typeof DISPUTE_ACTIONS_TAKEN)[number];

/**
 * Mongoose model names this dispute can be raised against.
 * Add to this list as new disputable entities are introduced.
 */
export const DISPUTE_SUBJECT_MODELS = [
  "Booking",
  "Transaction",
  "Vehicle",
  "Review",
  "User",
] as const;

export type DisputeSubjectModel = (typeof DISPUTE_SUBJECT_MODELS)[number];

/**
 * 2. Interface Definitions
 */
export interface IAdminResolution {
  resolvedBy: Schema.Types.ObjectId; // Admin User who resolved
  resolutionNotes: string;
  actionTaken: DisputeActionTaken;
  resolvedAt: Date;
}

export interface IDisputeNote {
  authorId: Schema.Types.ObjectId;
  content: string;
  attachments?: string[] | undefined;
  createdAt: Date;
}

export interface IDispute {
  /**
   * Polymorphic subject — the dispute can be raised against any entity,
   * not just a Booking. Uses refPath so Mongoose can populate correctly.
   */
  subjectId: Schema.Types.ObjectId;
  subjectModel: DisputeSubjectModel;

  /**
   * Optional convenience ref to the related booking.
   * Populated when subjectModel !== "Booking" but a booking is still
   * involved in the context (e.g. a Transaction dispute tied to a Booking).
   */
  relatedBookingId?: Schema.Types.ObjectId | undefined;

  raisedBy: Schema.Types.ObjectId;       // The User who opened the dispute
  respondentId?: Schema.Types.ObjectId | undefined; // The accused party (User or Company staff)

  issueCategory: DisputeIssueCategory;
  description: string;
  evidenceUrls: string[];

  status: DisputeStatus;

  /**
   * Append-only internal notes thread.
   * Allows both parties and admins to add context without mutating the
   * original description.
   */
  notes?: IDisputeNote[] | undefined;

  adminResolution?: IAdminResolution | undefined;

  /**
   * Open-ended payload for feature-specific context.
   * Example: { estimatedDamageCost: 4500, currency: "ETB" }
   */
  metadata?: Record<string, unknown> | undefined;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type DisputeDocument = HydratedDocument<IDispute>;

/**
 * 3. Schema Definition
 */
const disputeNoteSchema = new Schema<IDisputeNote>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    attachments: { type: [String], default: [] },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

const disputeSchema = new Schema<IDispute>(
  {
    // Polymorphic subject — not locked to Booking
    subjectId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "subjectModel",
    },
    subjectModel: {
      type: String,
      required: true,
      enum: DISPUTE_SUBJECT_MODELS,
    },

    relatedBookingId: { type: Schema.Types.ObjectId, ref: "Booking" },

    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    respondentId: { type: Schema.Types.ObjectId, ref: "User" },

    issueCategory: {
      type: String,
      required: true,
      enum: DISPUTE_ISSUE_CATEGORIES,
    },

    description: { type: String, required: true, trim: true, maxlength: 2000 },
    evidenceUrls: { type: [String], default: [] },

    status: {
      type: String,
      enum: DISPUTE_STATUSES,
      default: "OPEN" satisfies DisputeStatus,
    },

    notes: { type: [disputeNoteSchema], default: [] },

    adminResolution: {
      resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      resolutionNotes: { type: String, trim: true },
      actionTaken: {
        type: String,
        enum: DISPUTE_ACTIONS_TAKEN,
      },
      resolvedAt: { type: Date },
    },

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
 * 4. Performance Indexing
 */
disputeSchema.index({ subjectId: 1, subjectModel: 1 }); // All disputes for any entity
disputeSchema.index({ raisedBy: 1 });                    // Disputes filed by a user
disputeSchema.index({ respondentId: 1 });                // Disputes filed against a user
disputeSchema.index({ status: 1 });                      // Admin queue filtering
disputeSchema.index({ issueCategory: 1 });               // Analytics by category
disputeSchema.index({ relatedBookingId: 1 });            // Booking-level dispute lookup
disputeSchema.index({ createdAt: -1 });                  // Newest-first for admin queue

export const Dispute = model<IDispute>("Dispute", disputeSchema);
