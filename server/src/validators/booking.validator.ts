import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid ObjectId");

const bookingReferenceSchema = z
  .string()
  .trim()
  .regex(
    /^(?:[a-f\d]{24}|BK-[A-Z0-9]{10})$/i,
    "Must be a valid booking reference",
  );

const optionalTrimmedString = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value ? value : undefined));

const reviewImagesSchema = z.array(z.string().trim().url()).max(6).optional();

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

export const bookingPickupVerificationSchema = z
  .object({
    originalDocsChecked: z.boolean(),
    manualDocumentHoldNote: z.string().trim().max(500).optional(),
  })
  .strict();

export const bookingReturnConfirmationSchema = z
  .object({
    returnCondition: z.enum(["CLEAN", "ISSUE_REPORTED"]),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const bookingDepositSettlementSchema = z
  .object({
    action: z.enum(["REFUND_TO_RENTER", "RELEASE_TO_OWNER"]),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const chapaVerifyQuerySchema = z
  .object({
    bookingId: bookingReferenceSchema.optional(),
    tx_ref: z.string().trim().min(2).optional(),
    trx_ref: z.string().trim().min(2).optional(),
    status: z.string().trim().optional(),
    ref_id: z.string().trim().optional(),
  })
  .refine((value) => Boolean(value.bookingId || value.tx_ref || value.trx_ref), {
    message: "bookingId or tx_ref is required",
  });

export const renterBookingListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    status: z
      .enum([
        "PENDING",
        "CONFIRMED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ])
      .optional(),
    paymentState: z.enum(["pending", "paid", "failed"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  })
  .strict();

export const bookingIdParamsSchema = z
  .object({
    bookingId: bookingReferenceSchema,
  })
  .strict();

export const bookingSettlementActionSchema = z
  .object({
    reason: z.string().trim().max(300).optional(),
  })
  .strict();

export const bookingReviewParamsSchema = z
  .object({
    bookingId: bookingReferenceSchema,
    reviewId: objectIdSchema,
  })
  .strict();

export const bookingReviewCreateSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: optionalTrimmedString,
    images: reviewImagesSchema,
  })
  .strict();

export const bookingReviewUpdateSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: optionalTrimmedString,
    images: reviewImagesSchema,
  })
  .strict()
  .refine(
    (value) =>
      value.rating !== undefined ||
      value.comment !== undefined ||
      value.images !== undefined,
    {
      message: "Provide at least one review field to update",
    },
  );

export type ChapaCheckoutInput = z.infer<typeof chapaCheckoutSchema>;
export type RenterBookingListQueryInput = z.infer<
  typeof renterBookingListQuerySchema
>;
export type BookingReviewCreateInput = z.infer<typeof bookingReviewCreateSchema>;
export type BookingReviewUpdateInput = z.infer<typeof bookingReviewUpdateSchema>;
export type BookingSettlementActionInput = z.infer<
  typeof bookingSettlementActionSchema
>;
export type BookingPickupVerificationInput = z.infer<
  typeof bookingPickupVerificationSchema
>;
export type BookingReturnConfirmationInput = z.infer<
  typeof bookingReturnConfirmationSchema
>;
export type BookingDepositSettlementInput = z.infer<
  typeof bookingDepositSettlementSchema
>;
