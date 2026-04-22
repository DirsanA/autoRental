import { z } from "zod";
import { SYSTEM_ROLES } from "../config/constants.js";

// Reuses the browser date input format so date fields always arrive in a predictable shape.
const htmlDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

// Accepts uploaded document references whether the client sends a full URL or an app-relative path.
const uploadedDocumentRefSchema = z
  .string()
  .trim()
  .min(1, "Document upload is required")
  .refine(
    (value) => /^(https?:\/\/|\/|data:)/.test(value),
    "Document must be a valid uploaded file URL, path, or base64 data URL",
  );

// Canonical fields for ID verification
export const submitRenterIdVerificationSchema = z.object({
  documentFrontUrl: uploadedDocumentRefSchema,
  documentBackUrl: uploadedDocumentRefSchema,
  documentNumber: z.string().trim().min(4, "ID number is required"),
  dateOfBirth: htmlDateSchema,
});

// Canonical fields for License verification
export const submitRenterLicenseVerificationSchema = z.object({
  documentFrontUrl: uploadedDocumentRefSchema,
  documentBackUrl: uploadedDocumentRefSchema,
  licenseNumber: z.string().trim().min(4, "License number is required"),
  dateOfBirth: htmlDateSchema,
  licenseExpiry: htmlDateSchema,
});

// Peerhost is basically the license check + address.
export const submitPeerhostVerificationSchema = submitRenterLicenseVerificationSchema.extend({
  address: z.string().trim().min(5, "Full address is required"),
});

// Keeps older clients working by accepting the legacy verification field names as optional aliases.
const legacyVerificationFields = z.object({
  idImageUrl: uploadedDocumentRefSchema.optional(),
  idNumber: z.string().trim().min(4, "ID number is required").optional(),
  documentFrontUrl: uploadedDocumentRefSchema.optional(),
  documentBackUrl: uploadedDocumentRefSchema.optional(),
  licenseNumber: z.string().trim().min(4, "License number is required").optional(),
  dateOfBirth: htmlDateSchema.optional(),
  licenseExpiry: htmlDateSchema.optional(),
});

function normalizeLegacyVerification<
  T extends z.input<typeof legacyVerificationFields> & Record<string, unknown>,
>(data: T) {
  // Maps legacy aliases into the canonical field names used by the rest of the backend.
  const documentFrontUrl = data.documentFrontUrl ?? data.idImageUrl;
  const documentBackUrl = data.documentBackUrl ?? data.idImageUrl;
  const licenseNumber = data.licenseNumber ?? data.idNumber;

  return {
    ...data,
    documentFrontUrl,
    documentBackUrl,
    licenseNumber,
    dateOfBirth: data.dateOfBirth,
    licenseExpiry: data.licenseExpiry,
  };
}

function validateLegacyVerification(
  data: z.input<typeof legacyVerificationFields>,
  ctx: z.RefinementCtx,
) {
  if (!data.documentFrontUrl && !data.idImageUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["documentFrontUrl"], message: "Front document upload is required" });
  }
  if (!data.documentBackUrl && !data.idImageUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["documentBackUrl"], message: "Back document upload is required" });
  }
  if (!data.licenseNumber && !data.idNumber) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["licenseNumber"], message: "License number is required" });
  }
  if (!data.dateOfBirth) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dateOfBirth"], message: "Date of birth is required" });
  }
  if (!data.licenseExpiry) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["licenseExpiry"], message: "License expiry is required" });
  }
}

// Applies the same legacy compatibility flow for peerhosts before checking the full current payload.
export const legacySubmitPeerhostVerificationSchema = legacyVerificationFields
  .extend({
    address: z.string().trim().min(5, "Full address is required"),
  })
  .superRefine(validateLegacyVerification)
  .transform(normalizeLegacyVerification)
  .pipe(submitPeerhostVerificationSchema);

// Restricts review payloads to supported moderation outcomes and an optional admin note.
export const reviewVerificationSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    adminComment: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    // Prevents rejected reviews from carrying a meaningless empty-string comment.
    if (data.status === "REJECTED" && data.adminComment === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["adminComment"],
        message: "Admin comment cannot be empty",
      });
    }
  });

// Validates the verification identifier provided in the route path.
export const verificationIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Verification ID is required"),
});

// Limits role-targeted verification flows to the supported system roles.
export const requestedRoleSchema = z.enum([
  SYSTEM_ROLES.RENTER,
  SYSTEM_ROLES.PEERHOST,
]);

export type SubmitRenterIdVerificationInput = z.infer<typeof submitRenterIdVerificationSchema>;
export type SubmitRenterLicenseVerificationInput = z.infer<typeof submitRenterLicenseVerificationSchema>;
export type SubmitPeerhostVerificationInput = z.infer<typeof submitPeerhostVerificationSchema>;
export type LegacySubmitPeerhostVerificationInput = z.infer<typeof legacySubmitPeerhostVerificationSchema>;
export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>;
