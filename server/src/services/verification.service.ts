import mongoose from "mongoose";
import {
  Verification,
  type VerificationDocument,
} from "../models/Verification.js";
import { VerificationLevel } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { userPersistenceService } from "./user.persistence.service.js";
import { notificationDispatcher } from "./notification.dispatcher.js";
import { notificationEmitter } from "./notification-emitter.service.js";
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
  dateOfBirth?: string;
  documentExpiry: string;
  address?: string | undefined;
};

type VerificationSubmission = {
  documentType: "NATIONAL_ID" | "DRIVER_LICENSE";
  targetVerificationLevel:
    | VerificationLevel.ID_VERIFIED
    | VerificationLevel.LICENSE_VERIFIED;
};

type VerificationDocumentType = VerificationDocument["documentType"];

type VerificationSnapshotStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

type VerificationSnapshot = {
  latest: VerificationDocument | null;
  status: VerificationSnapshotStatus;
  canSubmit: boolean;
  submissionsCount: number;
};

type VerificationOverview = {
  idVerification: VerificationSnapshot;
  licenseVerification: VerificationSnapshot;
};

type MyVerificationOverview = {
  verifications: VerificationDocument[];
  overview: VerificationOverview;
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
    }, "RENTER_VERIFICATION");
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
    }, "RENTER_VERIFICATION");
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
    }, "PEERHOST_APPLICATION");
  }

  /**
   * Returns every verification owned by the current user.
   */
  async getMyVerifications(
    authUserId: string,
  ): Promise<MyVerificationOverview> {
    const user = await this.findUserByAuthIdOrThrow(authUserId);
    const verifications = await Verification.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    return {
      verifications,
      overview: {
        idVerification: this.buildVerificationSnapshot(verifications, [
          "NATIONAL_ID",
          "PASSPORT",
        ]),
        licenseVerification: this.buildVerificationSnapshot(verifications, [
          "DRIVER_LICENSE",
        ]),
      },
    };
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
    user: NonNullable<
      Awaited<ReturnType<typeof userPersistenceService.findByMongoId>>
    >;
  }> {
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw ApiError.notFound("Verification not found");
    }

    if (verification.status !== "PENDING") {
      throw ApiError.unprocessable("Verification has already been reviewed");
    }

    const user = await userPersistenceService.findByMongoId(
      verification.userId,
    );
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (data.status === "REJECTED") {
      verification.status = "REJECTED";
      verification.adminComment = data.adminComment;
      verification.verifiedBy = undefined;
      verification.verifiedAt = undefined;
      await verification.save();

      // Send rejection notification
      await notificationDispatcher.sendVerificationNotification({
        recipientId: user._id,
        recipientEmail: user.email || "",
        recipientName: user.name || "User",
        action: "VERIFICATION_REJECTED",
        reason: data.adminComment,
        entityId: verification._id,
        entityType: "User",
        documentType: verification.documentType,
        adminId: adminUserId,
      });

      return { verification, user };
    }

    const metadata = verification.extractedData as
      | VerificationMetadata
      | undefined;
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

    // Send approval notification
    await notificationDispatcher.sendVerificationNotification({
      recipientId: user._id,
      recipientEmail: user.email || "",
      recipientName: user.name || "User",
      action: "VERIFICATION_APPROVED",
      reason: data.adminComment,
      entityId: verification._id,
      entityType: "User",
      documentType: verification.documentType,
      adminId: adminUserId,
    });

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
    data:
      | SubmitRenterIdVerificationInput
      | SubmitRenterLicenseVerificationInput
      | SubmitPeerhostVerificationInput,
    submission: VerificationSubmission,
  ): VerificationMetadata {
    return {
      targetVerificationLevel: submission.targetVerificationLevel,
      documentNumber:
        "documentNumber" in data ? data.documentNumber : data.licenseNumber,
      dateOfBirth: data.dateOfBirth || "",
      documentExpiry: "licenseExpiry" in data ? data.licenseExpiry : "",
      address: "address" in data ? data.address : undefined,
    };
  }

  private async submitVerification(
    authUserId: string,
    data:
      | SubmitRenterIdVerificationInput
      | SubmitRenterLicenseVerificationInput
      | SubmitPeerhostVerificationInput,
    submission: VerificationSubmission,
    activityType: "RENTER_VERIFICATION" | "PEERHOST_APPLICATION"
  ): Promise<VerificationDocument> {
    const user = await this.findUserByAuthIdOrThrow(authUserId);

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

    const verification = await Verification.create({
      userId: user._id,
      documentType: submission.documentType,
      documentFrontUrl: data.documentFrontUrl,
      documentBackUrl: data.documentBackUrl,
      extractedData: {
        ...this.buildVerificationMetadata(data, submission),
        activityType,
      },
      status: "PENDING",
    });

    // ✅ Emit real-time notification to all admins for major activity

    await notificationEmitter.emitNewActionRequired({
      entityType: "VERIFICATION",
      entityId: verification._id.toString(),
      activityType,
      metadata: {
        userId: user._id.toString(),
        userName: user.name,
        documentType: submission.documentType,
      }
    });

    return verification;
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

  /**
   * Picks the latest submission for a document group and exposes submit readiness.
   */
  private buildVerificationSnapshot(
    verifications: VerificationDocument[],
    documentTypes: VerificationDocumentType[],
  ): VerificationSnapshot {
    const matchingVerifications = verifications.filter((verification) =>
      documentTypes.includes(verification.documentType),
    );

    const latest = matchingVerifications[0] ?? null;

    return {
      latest,
      status: latest?.status ?? "NOT_SUBMITTED",
      canSubmit: !matchingVerifications.some(
        (verification) => verification.status === "PENDING",
      ),
      submissionsCount: matchingVerifications.length,
    };
  }
}

export const verificationService = new VerificationService();
