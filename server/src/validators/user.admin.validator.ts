import { z } from "zod";

export const adminUserParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const adminUserStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]),
  })
  .strict();

export const adminUserVerificationLevelSchema = z
  .object({
    verificationLevel: z.enum(["PEER_HOST"]),
  })
  .strict();

export const adminUserListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    status: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
    accountType: z.enum(["USER", "COMPANY", "ADMIN"]).optional(),
    scope: z.enum(["ALL", "PEOPLE"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  })
  .strict();

export type AdminUserParamsInput = z.infer<typeof adminUserParamsSchema>;
export type AdminUserStatusInput = z.infer<typeof adminUserStatusSchema>;
export type AdminUserVerificationLevelInput = z.infer<
  typeof adminUserVerificationLevelSchema
>;
export type AdminUserListQueryInput = z.infer<typeof adminUserListQuerySchema>;
