import { z } from "zod";

// Limits profile updates to the editable self-service fields exposed by the user settings flow.
export const updateProfileSchema = z
  .object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phoneNumber: z.string().max(15).optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
