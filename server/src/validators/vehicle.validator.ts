import { z } from "zod";

const uploadValueSchema = z
  .string()
  .trim()
  .min(1, "Upload value is required")
  .refine(
    (value) => value.startsWith("data:") || /^https?:\/\//.test(value),
    "Upload must be a data URL or http(s) URL",
  );

export const createVehicleSchema = z.object({
  ownerId: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "ownerId must be a valid ObjectId")
    .optional(),
  ownerType: z.enum(["User", "Company"]).optional(),

  make: z.string().trim().min(1, "Make is required"),
  model: z.string().trim().min(1, "Model is required"),
  year: z.number().int().min(1900).max(2100),
  vin: z.string().trim().min(5).max(32).optional(),
  plate: z.string().trim().min(2, "License plate is required"),

  mileage: z.number().int().min(0).optional(),
  fuel: z.enum(["petrol", "diesel", "hybrid", "electric"]).optional(),
  transmission: z.enum(["manual", "automatic", "cvt"]).optional(),
  seats: z.number().int().min(1).optional(),
  features: z.array(z.string().trim().min(1)).default([]),
  condition: z.string().trim().max(500).optional(),

  price: z.number().nonnegative(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
  availability: z.string().trim().max(1000).optional(),
  delivery: z.string().trim().max(1000).optional(),

  photos: z.object({
    front: uploadValueSchema,
    back: uploadValueSchema,
    side: uploadValueSchema,
    interior: uploadValueSchema,
  }),
  documents: z.object({
    ownership: uploadValueSchema,
    insurance: uploadValueSchema,
  }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
