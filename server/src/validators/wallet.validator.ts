import { z } from "zod";

export const payoutRequestSchema = z.object({
  amount: z.number().finite().positive(),
});

export const payoutApproveSchema = z.object({
  payoutRequestId: z.string().trim().min(8),
});

export const bookingCompleteSchema = z.object({
  bookingId: z.string().trim().min(8),
});

export const bookingCancelSchema = z.object({
  bookingId: z.string().trim().min(8),
});

