import { z } from "zod";

/**
 * Query parameters for listing P2P host applicants.
 */
export const adminP2PListQuerySchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "flagged", "all"])
    .optional()
    .default("all"),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Path parameters for P2P host detail.
 */
export const adminP2PHostIdSchema = z.object({
  hostId: z.string().trim().min(1, "Host ID is required"),
});

/**
 * Body for approving/rejecting a peer-host application.
 */
export const adminP2PDecisionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminComment: z.string().optional(),
});

/**
 * Body for approving/rejecting a vehicle.
 */
export const adminVehicleDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminComment: z.string().optional(),
});

export type AdminP2PListQueryInput = z.infer<typeof adminP2PListQuerySchema>;
export type AdminP2PDecisionInput = z.infer<typeof adminP2PDecisionSchema>;
export type AdminVehicleDecisionInput = z.infer<
  typeof adminVehicleDecisionSchema
>;
