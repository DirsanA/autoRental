import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definition
 */
export interface IReview {
  bookingId: Schema.Types.ObjectId;
  reviewerId: Schema.Types.ObjectId;

  // Polymorphic target — can point to a Vehicle, Company, or User
  targetId: Schema.Types.ObjectId;
  targetType: "Vehicle" | "Company" | "User";

  rating: number; // 1–5
  comment?: string | undefined;

  images?: string[] | undefined; // Visual proof of vehicle condition

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type ReviewDocument = HydratedDocument<IReview>;

/**
 * 2. Schema Definition
 */
const reviewSchema = new Schema<IReview>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    targetId: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
    targetType: {
      type: String,
      required: true,
      enum: ["Vehicle", "Company", "User"],
    },

    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: { type: String, trim: true, maxlength: 500 },

    images: { type: [String], default: [] },
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
// Prevent duplicate reviews for the same booking by the same reviewer
reviewSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ targetId: 1, targetType: 1 }); // Fetch all reviews for a given target
reviewSchema.index({ rating: 1 }); // Filter/sort by rating

export const Review = model<IReview>("Review", reviewSchema);
