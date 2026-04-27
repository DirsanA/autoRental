import { z } from "zod";

export const transactionListQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(200).optional().default(50),
  status: z
    .enum([
      "PENDING",
      "HELD_IN_ESCROW",
      "COMPLETED",
      "FAILED",
      "REFUNDED",
      "CANCELLED",
    ])
    .optional(),
  type: z
    .enum([
      "RENTAL_FEE",
      "COLLATERAL_DEPOSIT",
      "REFUND",
      "PAYOUT",
      "COMMISSION",
      "ESCROW_HOLD",
      "ESCROW_RELEASE",
      "REFUND_REVERSAL",
    ])
    .optional(),
  receiverModel: z.enum(["User", "Company", "System"]).optional(),
  q: z.string().trim().min(1).max(120).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type TransactionListQueryInput = z.infer<typeof transactionListQuerySchema>;

