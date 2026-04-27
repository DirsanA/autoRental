import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid ObjectId");

export const createPayoutSchema = z
  .object({
    bookingId: objectIdSchema,
    amount: z.number().positive(),
    payoutMethod: z.enum(["BANK_TRANSFER", "TELEBIRR", "CHAPA", "MANUAL"]).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    ownerType: z.enum(["User", "Company"]).optional(),
  })
  .strict();

export const payoutListQuerySchema = z
  .object({
    status: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED"]).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    ownerType: z.enum(["User", "Company"]).optional(),
  })
  .strict();

export const payoutIdParamsSchema = z
  .object({
    payoutId: objectIdSchema,
  })
  .strict();

export const payoutDecisionSchema = z
  .object({
    status: z.enum(["approve", "fail"]),
    failureReason: z.string().trim().max(300).optional(),
    gatewayReference: z.string().trim().max(120).optional(),
  })
  .strict();

export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
export type PayoutListQueryInput = z.infer<typeof payoutListQuerySchema>;
export type PayoutDecisionInput = z.infer<typeof payoutDecisionSchema>;
