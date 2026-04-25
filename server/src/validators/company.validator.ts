import { z } from "zod";
import { isValidE164Phone, normalizePhoneNumber } from "../utils/phone.js";

const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value) => normalizePhoneNumber(value))
  .refine((value): value is string => typeof value === "string" && isValidE164Phone(value), {
    message: "Phone must be in E.164 format",
  });

// Validates the full company creation payload required during initial company registration.
export const createCompanySchema = z.object({
  name: z.string().min(2).max(100, "Company name must be at most 100 characters"),
  tinNumber: z.string().min(4).max(30, "TIN number is required"),
  website: z.string().url("Invalid website URL").optional(),
  bio: z.string().max(500).optional(),
  licenseDocumentUrl: z.string().url("Invalid license document URL").optional(),
  contactInfo: z.object({
    email: z.string().email("Invalid contact email"),
    phoneNumber: phoneNumberSchema,
    address: z.string().max(200).optional(),
  }),
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

// Supports partial company profile edits while still rejecting unknown update fields.
export const updateCompanySchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    website: z.string().url("Invalid website URL").optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    licenseDocumentUrl: z.string().url().optional().nullable(),
    contactInfo: z
      .object({
        email: z.string().email().optional(),
        phoneNumber: phoneNumberSchema.optional(),
        address: z.string().max(200).optional().nullable(),
      })
      .optional(),
    location: z
      .object({
        type: z.literal("Point"),
        coordinates: z.tuple([
          z.number().min(-180).max(180),
          z.number().min(-90).max(90),
        ]),
      })
      .optional()
      .nullable(),
    socialLinks: z
      .object({
        linkedin: z.string().url().optional().nullable(),
        facebook: z.string().url().optional().nullable(),
        x: z.string().url().optional().nullable(),
      })
      .optional(),
  })
  .strict();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
