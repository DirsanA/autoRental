import { Schema, model, type HydratedDocument } from "mongoose";

/**
 * 1. Interface Definition
 */
export interface ICompany {
  authUserId: string; // Better Auth account id used to sign into the company portal

  name: string;
  tinNumber: string; // Tax Identification Number

  // Professional Presence
  website?: string | undefined;
  logoUrl?: string | undefined;
  bio?: string | undefined;
  licenseDocumentUrl?: string | undefined;

  contactInfo: {
    email: string;
    phoneNumber: string;
    address?: string | undefined;
  };

  // GeoJSON Point for storefront/HQ location (2DSphere-ready)
  location?:
    | {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
      }
    | undefined;

  socialLinks?:
    | {
        linkedin?: string | undefined;
        facebook?: string | undefined;
        x?: string | undefined; // Formerly Twitter
      }
    | undefined;

  // Verification Lifecycle (driven by the Verification model)
  isVerified: boolean;
  verifiedAt?: Date | undefined; // Set when status transitions to ACTIVE
  status:
    | "PENDING_APPROVAL"
    | "ACTIVE"
    | "REJECTED_TEMPORARY"
    | "REJECTED_PERMANENT"
    | "SUSPENDED";
  rejectionReason?: string | undefined; // Admin-provided reason on SUSPENDED/rejection

  // Financial (mirrors User.walletBalance - platform earnings go here)
  walletBalance: number;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type CompanyDocument = HydratedDocument<ICompany>;

/**
 * 2. Schema Definition
 */
const companySchema = new Schema<ICompany>(
  {
    authUserId: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true, trim: true },
    tinNumber: { type: String, required: true, unique: true, trim: true },

    // Professional Presence
    website: { type: String, trim: true },
    logoUrl: String,
    bio: { type: String, maxlength: 500 },
    licenseDocumentUrl: { type: String, trim: true },

    contactInfo: {
      email: {
        type: String,
        required: [true, "Company contact email is required"],
        lowercase: true,
        trim: true,
      },
      phoneNumber: {
        type: String,
        required: [true, "Company contact phone is required"],
        trim: true,
      },
      address: String,
    },

    // GeoJSON Point — enables $near / $geoWithin queries for location-based discovery
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    socialLinks: {
      linkedin: String,
      facebook: String,
      x: String,
    },

    // Verification Lifecycle
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    status: {
      type: String,
      enum: [
        "PENDING_APPROVAL",
        "ACTIVE",
        "REJECTED_TEMPORARY",
        "REJECTED_PERMANENT",
        "SUSPENDED",
      ],
      default: "PENDING_APPROVAL",
    },
    rejectionReason: { type: String },

    // Financial
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
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
  },
);

/**
 * 3. Performance Indexing
 */
companySchema.index({ status: 1 });
companySchema.index({ name: "text" }); // Full-text search on company name
companySchema.index({ location: "2dsphere" }); // Geospatial queries (find nearby companies)

export const Company = model<ICompany>("Company", companySchema);
