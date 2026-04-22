import mongoose from "mongoose";
import {
  Verification,
  type VerificationDocument,
} from "../models/Verification.js";
import { VerificationLevel } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { userPersistenceService } from "./user.persistence.service.js";
import type {
  ReviewVerificationInput,
  SubmitPeerhostVerificationInput,
  SubmitRenterIdVerificationInput,
  SubmitRenterLicenseVerificationInput,
} from "../validators/verification.validator.js";

type VerificationMetadata = {
  targetVerificationLevel:
    | VerificationLevel.ID_VERIFIED
    | VerificationLevel.LICENSE_VERIFIED;
  documentNumber: string;
  dateOfBirth: string;
  documentExpiry: string;
  address?: string | undefined;
};

type VerificationSubmission = {
  documentType: "NATIONAL_ID" | "DRIVER_LICENSE";
  targetVerificationLevel:
    | VerificationLevel.ID_VERIFIED
    | VerificationLevel.LICENSE_VERIFIED;
};

const VERIFICATION_LEVEL_ORDER: Record<VerificationLevel, number> = {
  [VerificationLevel.NONE]: 0,
  [VerificationLevel.ID_VERIFIED]: 1,
  [VerificationLevel.LICENSE_VERIFIED]: 2,
  [VerificationLevel.PEER_HOST]: 3,
};

/**
 * Preserves the user's highest achieved level when an older document is approved.
 */
function mergeVerificationLevel(
  currentLevel: VerificationLevel,
  approvedLevel:
    | VerificationLevel.ID_VERIFIED
    | VerificationLevel.LICENSE_VERIFIED,
) {
  return VERIFICATION_LEVEL_ORDER[currentLevel] >=
    VERIFICATION_LEVEL_ORDER[approvedLevel]
    ? currentLevel
    : approvedLevel;
}

export class VerificationService {
  /**
   * Submits the identity document used for ID verification (With-Driver).
   */
  async submitRenterIdVerification(
    authUserId: string,
    data: SubmitRenterIdVerificationInput,
  ): Promise<VerificationDocument> {
    return this.submitVerification(authUserId, data, {
      documentType: "NATIONAL_ID",
      targetVerificationLevel: VerificationLevel.ID_VERIFIED,
    });
  }

  /**
   * Submits the driver's license used for license verification (Self-Drive).
   */
  async submitRenterLicenseVerification(
    authUserId: string,
    data: SubmitRenterLicenseVerificationInput,
  ): Promise<VerificationDocument> {
    return this.submitVerification(authUserId, data, {
      documentType: "DRIVER_LICENSE",
      targetVerificationLevel: VerificationLevel.LICENSE_VERIFIED,
    });
  }

  /**
   * Submits the driving license used for license verification.
   */
  async submitPeerhostVerification(
    authUserId: string,
    data: SubmitPeerhostVerificationInput,
  ): Promise<VerificationDocument> {
    return this.submitVerification(authUserId, data, {
      documentType: "DRIVER_LICENSE",
      targetVerificationLevel: VerificationLevel.LICENSE_VERIFIED,
    });
  }

  /**
   * Returns every verification owned by the current user.
   */
  async getMyVerifications(authUserId: string): Promise<VerificationDocument[]> {
    const user = await this.findUserByAuthIdOrThrow(authUserId);
    return Verification.find({ userId: user._id }).sort({ createdAt: -1 });
  }

  /**
   * Approves or rejects a verification request.
   */
  async reviewVerification(
    verificationId: string,
    adminUserId: string,
    data: ReviewVerificationInput,
  ): Promise<{
    verification: VerificationDocument;
    user: NonNullable<Awaited<ReturnType<typeof userPersistenceService.findByMongoId>>>;
  }> {
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw ApiError.notFound("Verification not found");
    }

    if (verification.status !== "PENDING") {
      throw ApiError.unprocessable("Verification has already been reviewed");
    }

    const user = await userPersistenceService.findByMongoId(verification.userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (data.status === "REJECTED") {
      verification.status = "REJECTED";
      verification.adminComment = data.adminComment;
      verification.verifiedBy = undefined;
      verification.verifiedAt = undefined;
      await verification.save();

      return { verification, user };
    }

    const metadata = verification.extractedData as VerificationMetadata | undefined;
    const approvedLevel = this.resolveApprovedVerificationLevel(
      verification.documentType,
      metadata,
    );

    verification.status = "APPROVED";
    verification.adminComment = data.adminComment;

    const adminPrimaryKey =
      await userPersistenceService.resolveUserPrimaryKey(adminUserId);
    if (adminPrimaryKey && mongoose.Types.ObjectId.isValid(adminPrimaryKey)) {
      verification.verifiedBy = new mongoose.Types.ObjectId(adminPrimaryKey);
    }
    verification.verifiedAt = new Date();

    user.verificationLevel = mergeVerificationLevel(
      user.verificationLevel,
      approvedLevel,
    );
    user.idNumber = metadata?.documentNumber ?? user.idNumber;
    user.idImageUrl = verification.documentFrontUrl;
    if (metadata?.address) {
      user.address = metadata.address;
    }

    await user.save();
    await verification.save();

    const refreshedUser = await userPersistenceService.findByMongoId(user._id);

    return { verification, user: refreshedUser ?? user };
  }

  /**
   * Finds a user by auth id or throws a not-found error.
   */
  private async findUserByAuthIdOrThrow(authUserId: string) {
    const user = await userPersistenceService.findByAuthId(authUserId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  }

  /**
   * Builds the metadata stored alongside a verification submission.
   */
  private buildVerificationMetadata(
    data: SubmitRenterIdVerificationInput | SubmitRenterLicenseVerificationInput | SubmitPeerhostVerificationInput,
    submission: VerificationSubmission,
  ): VerificationMetadata {
    return {
      targetVerificationLevel: submission.targetVerificationLevel,
      documentNumber: "documentNumber" in data ? data.documentNumber : data.licenseNumber,
      dateOfBirth: data.dateOfBirth,
      documentExpiry: "licenseExpiry" in data ? data.licenseExpiry : "",
      address: "address" in data ? data.address : undefined,
    };
  }

  /**
   * Creates a pending verification after duplicate checks.
   */
  private async submitVerification(
    authUserId: string,
    data: SubmitRenterIdVerificationInput | SubmitRenterLicenseVerificationInput | SubmitPeerhostVerificationInput,
    submission: VerificationSubmission,
  ): Promise<VerificationDocument> {
    const user = await this.findUserByAuthIdOrThrow(authUserId);

    if (
      VERIFICATION_LEVEL_ORDER[user.verificationLevel] >=
      VERIFICATION_LEVEL_ORDER[submission.targetVerificationLevel]
    ) {
      throw ApiError.conflict("User has already reached this verification level");
    }

    const existingPending = await Verification.findOne({
      userId: user._id,
      status: "PENDING",
      documentType: submission.documentType,
    });

    if (existingPending) {
      throw ApiError.conflict(
        "A verification request for this document type is already pending review",
      );
    }

    return Verification.create({
      userId: user._id,
      documentType: submission.documentType,
      documentFrontUrl: data.documentFrontUrl,
      documentBackUrl: data.documentBackUrl,
      extractedData: this.buildVerificationMetadata(data, submission),
      status: "PENDING",
    });
  }

  /**
   * Derives the resulting user verification level from a stored verification.
   */
  private resolveApprovedVerificationLevel(
    documentType: VerificationDocument["documentType"],
    metadata?: VerificationMetadata,
  ) {
    if (metadata?.targetVerificationLevel) {
      return metadata.targetVerificationLevel;
    }

    if (documentType === "NATIONAL_ID" || documentType === "PASSPORT") {
      return VerificationLevel.ID_VERIFIED;
    }

    return VerificationLevel.LICENSE_VERIFIED;
  }
}

export const verificationService = new VerificationService();
