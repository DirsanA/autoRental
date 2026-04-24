import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid ObjectId");

export const chapaCheckoutSchema = z.object({
  vehicleId: objectIdSchema,
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  withDriver: z.boolean().default(false),
  pickupAddress: z.string().trim().max(300).optional(),
  returnAddress: z.string().trim().max(300).optional(),
  contactPhone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const chapaVerifyQuerySchema = z
  .object({
    bookingId: objectIdSchema.optional(),
    tx_ref: z.string().trim().min(2).optional(),
    trx_ref: z.string().trim().min(2).optional(),
    status: z.string().trim().optional(),
    ref_id: z.string().trim().optional(),
  })
  .refine((value) => Boolean(value.bookingId || value.tx_ref || value.trx_ref), {
    message: "bookingId or tx_ref is required",
  });

export type ChapaCheckoutInput = z.infer<typeof chapaCheckoutSchema>;
