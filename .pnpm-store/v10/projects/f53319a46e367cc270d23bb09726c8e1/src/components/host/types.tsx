import { z } from "zod";

export type HostStep =
  | "landing"
  | "requirements"
  | "location"
  | "form-location"
  | "form-company"
  | "form-contact"
  | "form-professional"
  | "form-review"
  | "pending"
  | "approved";

export type UploadedFile = {
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 preview / payload
};

export type HostFormData = {
  // Location
  region: string;
  city: string;
  subCity: string;
  address: string;
  // Company
  companyName: string;
  tin: string;
  registrationNumber: string;
  yearFounded: string;
  // Contact
  fullName: string;
  email: string;
  phone: string;
  // Professional
  fleetSize: string;
  vehicleTypes: string;
  yearsInBusiness: string;
  website: string;
  licenseFile: UploadedFile | null;
  tinCertFile: UploadedFile | null;
};

export const initialFormData: HostFormData = {
  region: "",
  city: "",
  subCity: "",
  address: "",
  companyName: "",
  tin: "",
  registrationNumber: "",
  yearFounded: "",
  fullName: "",
  email: "",
  phone: "",
  fleetSize: "",
  vehicleTypes: "",
  yearsInBusiness: "",
  website: "",
  licenseFile: null,
  tinCertFile: null,
};

// Ethiopian regions (admin divisions)
export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Dire Dawa",
  "Oromia",
  "Amhara",
  "Tigray",
  "Sidama",
  "South Ethiopia",
  "Central Ethiopia",
  "South West Ethiopia",
  "Afar",
  "Somali",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
] as const;

// Major Ethiopian cities supported by the platform
export const SUPPORTED_CITIES = [
  "Addis Ababa",
  "Adama",
  "Hawassa",
  "Bahir Dar",
  "Mekelle",
  "Dire Dawa",
  "Bishoftu",
  "Jimma",
  "Gondar",
  "Dessie",
] as const;

export const FLEET_SIZES = ["1-5", "6-15", "16-50", "50+"] as const;

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

// Ethiopian phone: +251 followed by 9 digits starting with 9 or 7, or local 09/07 + 8 digits
const ETHIOPIAN_PHONE = /^(?:\+251|0)(9|7)\d{8}$/;
// TIN: 10 digits (Ethiopian Ministry of Revenue format)
const ETHIOPIAN_TIN = /^\d{10}$/;
// Business registration: alphanumeric 6–20 chars
const REG_NUMBER = /^[A-Za-z0-9/-]{4,20}$/;

const fileSchema = z
  .object({
    name: z.string(),
    size: z.number().max(MAX_FILE_BYTES, { message: "File must be 10MB or smaller" }),
    type: z.string().refine((t) => ACCEPTED_FILE_TYPES.includes(t), {
      message: "Only PDF, JPG or PNG files are allowed",
    }),
    dataUrl: z.string(),
  })
  .nullable();

export const locationSchema = z.object({
  region: z.string().min(1, "Select a region"),
  city: z.string().trim().min(2, "City is required").max(60),
  subCity: z.string().trim().max(60).optional().or(z.literal("")),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(200),
});

export const companySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name is required")
    .max(120, "Company name is too long"),
  tin: z
    .string()
    .trim()
    .regex(ETHIOPIAN_TIN, "TIN must be exactly 10 digits"),
  registrationNumber: z
    .string()
    .trim()
    .regex(REG_NUMBER, "Enter a valid registration number"),
  yearFounded: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (/^\d{4}$/.test(v) && +v >= 1950 && +v <= new Date().getFullYear()),
      { message: "Enter a valid year (1950 – present)" },
    )
    .optional()
    .or(z.literal("")),
});

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(80)
    .regex(/^[A-Za-z\u1200-\u137F\s.'-]+$/, "Use letters only"),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z
    .string()
    .trim()
    .regex(ETHIOPIAN_PHONE, "Use Ethiopian format e.g. +251911234567 or 0911234567"),
});

export const professionalSchema = z.object({
  fleetSize: z.string().min(1, "Select your fleet size"),
  vehicleTypes: z
    .string()
    .trim()
    .min(3, "Describe your vehicle types")
    .max(120),
  yearsInBusiness: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,2}$/.test(v) && +v >= 0 && +v <= 80), {
      message: "Enter a value between 0 and 80",
    })
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+/.test(v), {
      message: "Enter a valid URL starting with http(s)://",
    })
    .optional()
    .or(z.literal("")),
  licenseFile: fileSchema.refine((v) => v !== null, {
    message: "Upload your commercial license",
  }),
  tinCertFile: fileSchema.refine((v) => v !== null, {
    message: "Upload your TIN certificate",
  }),
});

export const stepSchemas = {
  "form-location": locationSchema,
  "form-company": companySchema,
  "form-contact": contactSchema,
  "form-professional": professionalSchema,
} as const;
