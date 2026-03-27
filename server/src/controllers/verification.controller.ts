import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { VerificationService } from "../services/verification.service.js";
import { requireRequestUser } from "../utils/requestContext.js";

/**
 * Returns the current authenticated user id or throws a route-specific 401.
 */
function requireAuthenticatedUserId(req: Request, message: string): string {
  return requireRequestUser(req, message).id;
}

export function createVerificationController(service: VerificationService) {
  return {
    /**
     * Submits a renter verification for the current user.
     */
    submitRenter: asyncHandler(async (req: Request, res: Response) => {
      const verification = await service.submitRenterVerification(
        requireAuthenticatedUserId(
          req,
          "Authentication required to submit verification",
        ),
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

    /**
     * Submits a peerhost verification for the current user.
     */
    submitPeerhost: asyncHandler(async (req: Request, res: Response) => {
      const verification = await service.submitPeerhostVerification(
        requireAuthenticatedUserId(
          req,
          "Authentication required to submit verification",
        ),
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

    /**
     * Returns every verification record owned by the current user.
     */
    getMyVerifications: asyncHandler(async (req: Request, res: Response) => {
      const verifications = await service.getMyVerifications(
        requireAuthenticatedUserId(
          req,
          "Authentication required to view verifications",
        ),
      );

      res.json({
        success: true,
        data: { verifications },
      });
    }),

    /**
     * Approves or rejects a verification request.
     */
    reviewVerification: asyncHandler(async (req: Request, res: Response) => {
      const result = await service.reviewVerification(
        req.params.id as string,
        requireAuthenticatedUserId(
          req,
          "Authentication required to review verifications",
        ),
        req.body,
      );

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
