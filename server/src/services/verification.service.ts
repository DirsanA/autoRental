import mongoose from "mongoose";
import { Role } from "../models/Role.js";
import { Verification, type VerificationDocument } from "../models/Verification.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { VerificationLevel } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { userPersistenceService } from "./user.persistence.service.js";
import type {
  ReviewVerificationInput,
  SubmitPeerhostVerificationInput,
  SubmitRenterVerificationInput,
} from "../validators/verification.validator.js";

type RequestedRole = typeof SYSTEM_ROLES.RENTER | typeof SYSTEM_ROLES.PEERHOST;

type VerificationMetadata = {
  requestedRole: RequestedRole;
  licenseNumber: string;
  dateOfBirth: string;
  licenseExpiry: string;
  address?: string | undefined;
};

export class VerificationService {
  async submitRenterVerification(
    authUserId: string,
    data: SubmitRenterVerificationInput,
  ): Promise<VerificationDocument> {
    // Routes renter verification requests through the shared submission workflow.
    return this.submitVerification(authUserId, SYSTEM_ROLES.RENTER, data);
  }

  async submitPeerhostVerification(
    authUserId: string,
    data: SubmitPeerhostVerificationInput,
  ): Promise<VerificationDocument> {
    // Routes peerhost verification requests through the same shared submission workflow.
    return this.submitVerification(authUserId, SYSTEM_ROLES.PEERHOST, data);
  }

  async getMyVerifications(authUserId: string): Promise<VerificationDocument[]> {
    // Resolves the caller's user record first so verification queries use the persisted Mongo id.
    const user = await userPersistenceService.findByAuthId(authUserId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return Verification.find({ userId: user._id }).sort({ createdAt: -1 });
  }

  async reviewVerification(
    verificationId: string,
    adminUserId: string,
    data: ReviewVerificationInput,
  ): Promise<{
    verification: VerificationDocument;
    user: NonNullable<Awaited<ReturnType<typeof userPersistenceService.findByMongoId>>>;
  }> {
    // Loads the pending verification record that an admin is attempting to review.
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw ApiError.notFound("Verification not found");
    }

    // Rejects duplicate moderation actions once a verification has already been processed.
    if (verification.status !== "PENDING") {
      throw ApiError.unprocessable("Verification has already been reviewed");
    }

    // Loads the target user so approval or rejection can update both verification and account state.
    const user = await userPersistenceService.findByMongoId(verification.userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Persists a rejection without changing user roles or verification level.
    if (data.status === "REJECTED") {
      verification.status = "REJECTED";
      verification.adminComment = data.adminComment;
      verification.verifiedBy = undefined;
      verification.verifiedAt = undefined;
      await verification.save();

      return { verification, user };
    }

    // Reads the submission metadata that tells the service which role the approval should unlock.
    const metadata = verification.extractedData as VerificationMetadata | undefined;
    if (!metadata?.requestedRole) {
      throw ApiError.internal("Verification metadata is missing the requested role");
    }

    // Marks the verification approved before applying the corresponding user upgrades.
    verification.status = "APPROVED";
    verification.adminComment = data.adminComment;
    const adminPrimaryKey =
      await userPersistenceService.resolveUserPrimaryKey(adminUserId);
    if (adminPrimaryKey && adminPrimaryKey instanceof mongoose.Types.ObjectId) {
      verification.verifiedBy = adminPrimaryKey;
    }
    verification.verifiedAt = new Date();

    // Resolves the requested role id so the approved capability can be attached to the user.
    const roleId = await this.getRoleId(metadata.requestedRole);
    if (!roleId) {
      throw ApiError.internal(`Role "${metadata.requestedRole}" is not available`);
    }

    // Copies verified identity data onto the user record and elevates their verification level.
    user.verificationLevel = VerificationLevel.LICENSE_VERIFIED;
    user.idNumber = metadata.licenseNumber;
    user.idImageUrl = verification.documentFrontUrl;
    if (metadata.address) {
      user.address = metadata.address;
    }

    await user.save();
    await userPersistenceService.addRole(String(user._id), roleId);
    // Reloads the user after role assignment so the response reflects the latest persisted state.
    const refreshedUser = await userPersistenceService.findByMongoId(user._id);

    await verification.save();

    return { verification, user: refreshedUser ?? user };
  }

  private async submitVerification(
    authUserId: string,
    requestedRole: RequestedRole,
    data: SubmitRenterVerificationInput | SubmitPeerhostVerificationInput,
  ): Promise<VerificationDocument> {
    // Resolves the submitting user before checking duplicate roles or pending verification requests.
    const user = await userPersistenceService.findByAuthId(authUserId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Blocks verification requests for roles the user already holds.
    const roleId = await this.getRoleId(requestedRole);
    if (roleId && user.roles.some((existingRole) => existingRole.toString() === roleId.toString())) {
      throw ApiError.conflict(`User is already a ${requestedRole}`);
    }

    // Prevents duplicate pending submissions for the same role and document type.
    const existingPending = await Verification.findOne({
      userId: user._id,
      status: "PENDING",
      documentType: "DRIVER_LICENSE",
      "extractedData.requestedRole": requestedRole,
    });

    if (existingPending) {
      throw ApiError.conflict("A verification request for this role is already pending review");
    }

    // Stores the verified identity fields as extracted metadata for later admin review.
    const metadata: VerificationMetadata = {
      requestedRole,
      licenseNumber: data.licenseNumber,
      dateOfBirth: data.dateOfBirth,
      licenseExpiry: data.licenseExpiry,
      address: "address" in data ? data.address : undefined,
    };

    // Creates a pending verification record that can be reviewed and approved by an admin later.
    return Verification.create({
      userId: user._id,
      documentType: "DRIVER_LICENSE",
      documentFrontUrl: data.documentFrontUrl,
      documentBackUrl: data.documentBackUrl,
      extractedData: metadata,
      status: "PENDING",
    });
  }

  private async getRoleId(roleName: RequestedRole) {
    // Resolves a system role name into the database id stored on the user document.
    const role = await Role.findOne({ name: roleName });
    return role?._id ?? null;
  }
}

export const verificationService = new VerificationService();
