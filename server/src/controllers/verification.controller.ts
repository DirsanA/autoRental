import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import type { VerificationService } from "../services/verification.service.js";

export function createVerificationController(service: VerificationService) {
  return {
    // Submits a renter verification for the authenticated user through the service layer.
    submitRenter: asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      // Double-checks authentication before tying the submission to a user account.
      if (!user?.id) {
        throw ApiError.unauthorized(
          "Authentication required to submit verification",
        );
      }

      const verification = await service.submitRenterVerification(
        user.id,
        req.body,
      );

      res.status(201).json({
        success: true,
        data: {
          verification,
          message: "Renter verification submitted for review.",
        },
      });
    }),

    // Submits a peerhost verification using the same authenticated-user handoff pattern.
    submitPeerhost: asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      // Ensures the peerhost request cannot proceed without a signed-in user.
      if (!user?.id) {
        throw ApiError.unauthorized(
          "Authentication required to submit verification",
        );
      }

      const verification = await service.submitPeerhostVerification(
        user.id,
        req.body,
      );

      res.status(201).json({
        success: true,
        data: {
          verification,
          message: "Peerhost verification submitted for review.",
        },
      });
    }),

    // Returns every verification record associated with the current authenticated user.
    getMyVerifications: asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      // Blocks anonymous access so verification history stays private to its owner.
      if (!user?.id) {
        throw ApiError.unauthorized(
          "Authentication required to view verifications",
        );
      }

      const verifications = await service.getMyVerifications(user.id);

      res.json({
        success: true,
        data: { verifications },
      });
    }),

    // Lets an authorized reviewer approve or reject a specific verification request.
    reviewVerification: asyncHandler(async (req: Request, res: Response) => {
      const reviewer = (req as any).user;
      // Requires the reviewer identity so the service can record who made the decision.
      if (!reviewer?.id) {
        throw ApiError.unauthorized(
          "Authentication required to review verifications",
        );
      }

      const result = await service.reviewVerification(
        req.params.id as string,
        reviewer.id,
        req.body,
      );

      // Tailors the success message to the moderation outcome that was just applied.
      res.json({
        success: true,
        data: {
          verification: result.verification,
          user: result.user,
          message:
            req.body.status === "APPROVED"
              ? "Verification approved successfully."
              : "Verification rejected successfully.",
        },
      });
    }),
  };
}
