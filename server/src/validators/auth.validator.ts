import { z } from "zod";
import { isValidE164Phone, normalizePhoneNumber } from "../utils/phone.js";

const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value) => normalizePhoneNumber(value))
  .refine((value): value is string => typeof value === "string" && isValidE164Phone(value), {
    message: "Phone number must be in valid E.164 format",
  });

/**
 * Shared credential fields for all registration types.
 */
// Reuses the login credential rules across user and company registration flows.
const authRegistrationFields = {
  email: z.string().email("Please provide a valid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
};

/**
 * Shared personal identity fields for user registration.
 */
const personalRegistrationFields = {
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters")
    .trim(),
  email: z.string().email("Please provide a valid email address").trim().toLowerCase(),
  phoneNumber: phoneNumberSchema,
};

/**
 * POST /api/auth/register
 * Register a base user account (no rental abilities yet).
 */
// Validates the standard user sign-up payload without any company-specific fields.
export const registerUserSchema = z.object({
  ...authRegistrationFields,
  ...personalRegistrationFields,
});

/**
 * POST /api/auth/register/company
 * Register a new company host account.
 * Includes user info + company details in a single request.
 */
// Combines personal account details and company profile data into one onboarding schema.
export const registerCompanySchema = z.object({
  ...authRegistrationFields,

  // Company fields
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters")
    .trim(),
  tinNumber: z
    .string()
    .min(4, "TIN number must be at least 4 characters")
    .max(30, "TIN number must be at most 30 characters")
    .trim(),
  companyEmail: z.string().email("Invalid company contact email").trim().toLowerCase(),
  companyPhone: phoneNumberSchema,
  companyAddress: z.string().max(200).optional(),
  website: z.string().url("Invalid website URL").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  licenseDocumentUrl: z.string().url("Invalid license document URL").optional(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
      ]),
    })
    .optional(),
  socialLinks: z
    .object({
      linkedin: z.string().url().optional(),
      facebook: z.string().url().optional(),
      x: z.string().url().optional(),
    })
    .optional(),
});

/**
 * POST /api/auth/login
 * Login with email and password.
 */
// Restricts login requests to the minimum credentials needed for email/password auth.
export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /api/auth/forgot-password
 */
// Validates the email used to request a password reset without revealing account existence.
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address").trim().toLowerCase(),
});

/**
 * POST /api/auth/reset-password
 */
// Validates the reset token and replacement password before handing off to better-auth.
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

// Type exports
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
