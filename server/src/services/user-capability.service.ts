import mongoose from "mongoose";
import { User, type IUser } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Verification } from "../models/Verification.js";
import { ApiError } from "../utils/ApiError.js";
import { userPersistenceService } from "./user.persistence.service.js";

/**
 * Capabilities represent what a user can DO in the system.
 * These are more granular than roles and can be granted/revoked independently.
 */
export enum Capability {
  /** Can browse and book vehicles */
  BOOK_VEHICLES = "book_vehicles",
  /** Can list own vehicles for rent */
  LIST_VEHICLES = "list_vehicles",
  /** Can manage company fleet (requires company association) */
  MANAGE_COMPANY = "manage_company",
  /** Can access admin panel */
  ADMIN_ACCESS = "admin_access",
}

/**
 * Verification requirements for each capability.
 * AUTO = granted automatically when requirements met
 * DOCUMENT = requires document upload + admin review
 * BUSINESS = requires business verification (TIN, company docs)
 */
export interface CapabilityConfig {
  requiredVerificationLevel: "BASIC" | "ID_VERIFIED" | "LICENSE_VERIFIED";
  requiresDocumentReview: boolean;
  requiredFields: Array<keyof IUser>;
  autoGrantOnRegistration?: boolean;
}

export const CAPABILITY_CONFIG: Record<Capability, CapabilityConfig> = {
  // Defines the verification and profile prerequisites for each grantable user capability.
  [Capability.BOOK_VEHICLES]: {
    requiredVerificationLevel: "BASIC",
    requiresDocumentReview: false,
    requiredFields: ["email", "phoneNumber"],
    autoGrantOnRegistration: false, // Must verify email first
  },
  [Capability.LIST_VEHICLES]: {
    requiredVerificationLevel: "LICENSE_VERIFIED",
    requiresDocumentReview: true,
    requiredFields: ["idNumber", "idImageUrl", "address"],
  },
  [Capability.MANAGE_COMPANY]: {
    requiredVerificationLevel: "ID_VERIFIED",
    requiresDocumentReview: false, // Company verification handles this
    requiredFields: ["email", "phoneNumber"],
  },
  [Capability.ADMIN_ACCESS]: {
    requiredVerificationLevel: "LICENSE_VERIFIED",
    requiresDocumentReview: false, // Manual assignment only
    requiredFields: [],
  },
};

/**
 * User capability result with grant status
 */
export interface UserCapabilityResult {
  capability: Capability;
  granted: boolean;
  pendingRequirements: string[];
  canRequestUpgrade: boolean;
}

export class UserCapabilityService {
  /**
   * Check if user has a specific capability.
   * This is the single source of truth for permission checks.
   */
  async hasCapability(userId: string, capability: Capability): Promise<boolean> {
    // Resolves the user once and then evaluates the requested capability through capability-specific rules.
    const user = await userPersistenceService.findByAuthIdWithRoles(userId);
    if (!user) return false;

    // Routes the permission check through the rule set that matches the requested capability.
    switch (capability) {
      case Capability.BOOK_VEHICLES:
        return this.canBookVehicles(user);
      case Capability.LIST_VEHICLES:
        return this.canListVehicles(user);
      case Capability.MANAGE_COMPANY:
        return this.canManageCompany(user);
      case Capability.ADMIN_ACCESS:
        return this.hasAdminAccess(user);
      default:
        return false;
    }
  }

  /**
   * Get all capabilities for a user with status details.
   */
  async getAllCapabilities(userId: string): Promise<UserCapabilityResult[]> {
    // Builds a capability summary so callers can see granted access and the remaining blockers together.
    const user = await userPersistenceService.findByAuthIdWithRoles(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return Object.values(Capability).map((cap) => ({
      capability: cap,
      granted: this.isCapabilityGranted(user, cap),
      pendingRequirements: this.getPendingRequirements(user, cap),
      canRequestUpgrade: this.canRequestUpgrade(user, cap),
    }));
  }

  /**
   * Request a capability upgrade.
   * Creates a verification record if document review is required.
   */
  async requestCapability(
    userId: string,
    capability: Capability,
    supportingData?: Record<string, any>,
  ): Promise<{ requiresReview: boolean; verificationId?: string }> {
    // Starts a capability upgrade flow and decides whether it can be granted immediately or needs review.
    const user = await userPersistenceService.findByAuthId(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const config = CAPABILITY_CONFIG[capability];

    // Stops duplicate upgrade flows when the user already has the requested capability.
    // Check if already has capability
    if (this.isCapabilityGranted(user, capability)) {
      throw ApiError.conflict(`User already has ${capability} capability`);
    }

    // Prevents stacking multiple pending review requests for the same capability.
    // Check if there's already a pending request
    const hasPending = await this.hasPendingRequest(userId, capability);
    if (hasPending) {
      throw ApiError.conflict("Capability request already pending review");
    }

    // Verifies the user's profile already contains the fields required to request this upgrade.
    // Validate required fields
    const missingFields = config.requiredFields.filter(
      (field) => !user[field],
    );
    if (missingFields.length > 0) {
      throw ApiError.unprocessable(
        `Missing required fields: ${missingFields.join(", ")}`,
      );
    }

    // Grants immediately when the capability does not require a separate document review cycle.
    // If no document review needed, grant immediately
    if (!config.requiresDocumentReview) {
      await this.grantCapability(userId, capability);
      return { requiresReview: false };
    }

    // Creates a pending verification record when an admin must review supporting documents.
    // Create verification request for document review
    const verification = await Verification.create({
      userId: user._id,
      documentType: this.getVerificationTypeForCapability(capability),
      documentFrontUrl: supportingData?.documentFrontUrl,
      documentBackUrl: supportingData?.documentBackUrl,
      extractedData: {
        requestedCapability: capability,
        ...supportingData,
      },
      status: "PENDING",
    });

    return { requiresReview: true, verificationId: String(verification._id) };
  }

  /**
   * Approve a capability request (admin only).
   */
  async approveCapability(
    verificationId: string,
    adminUserId: string,
    adminComment?: string,
  ): Promise<void> {
    // Approves a pending capability request and then grants the underlying role or verification upgrade.
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw ApiError.notFound("Verification not found");
    }

    if (verification.status !== "PENDING") {
      throw ApiError.unprocessable("Verification already processed");
    }

    // Reads the requested capability from the stored verification payload before granting access.
    const requestedCapability = (verification.extractedData as any)
      ?.requestedCapability as Capability | undefined;

    if (!requestedCapability) {
      throw ApiError.internal("Verification missing capability information");
    }

    // Records the moderation decision directly on the verification for auditability.
    // Update verification record
    verification.status = "APPROVED";
    verification.verifiedBy = userPersistenceService.toObjectId(adminUserId);
    verification.verifiedAt = new Date();
    verification.adminComment = adminComment;
    await verification.save();

    // Applies the capability grant only after the verification has been marked approved.
    // Grant the capability
    await this.grantCapability(String(verification.userId), requestedCapability);
  }

  /**
   * Reject a capability request (admin only).
   */
  async rejectCapability(
    verificationId: string,
    adminUserId: string,
    reason: string,
  ): Promise<void> {
    // Rejects the pending request and stores the admin rationale without changing user access.
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw ApiError.notFound("Verification not found");
    }

    if (verification.status !== "PENDING") {
      throw ApiError.unprocessable("Verification already processed");
    }

    verification.status = "REJECTED";
    verification.verifiedBy = userPersistenceService.toObjectId(adminUserId);
    verification.verifiedAt = new Date();
    verification.adminComment = reason;
    await verification.save();
  }

  /**
   * Revoke a capability from a user (admin only).
   */
  async revokeCapability(
    userId: string,
    capability: Capability,
    reason: string,
  ): Promise<void> {
    // Revokes role-backed capabilities by removing the mapped role from the user record.
    const user = await userPersistenceService.findByAuthId(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // For role-based capabilities, remove the role
    const roleToRemove = this.getRoleForCapability(capability);
    if (roleToRemove) {
      const role = await Role.findOne({ name: roleToRemove });
      if (role) {
        await userPersistenceService.removeRole(userId, role._id);
      }
    }

    // Log revocation (could be moved to audit log service)
    console.log(`Capability ${capability} revoked for user ${userId}: ${reason}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────

  // Helper methods below keep the public capability flows readable while centralizing rule evaluation.
  private isCapabilityGranted(user: IUser, capability: Capability): boolean {
    // Evaluates the current user state against the rule that defines when a capability counts as granted.
    switch (capability) {
      case Capability.BOOK_VEHICLES:
        return user.status === "ACTIVE" && user.emailVerified === true;
      case Capability.LIST_VEHICLES:
        return user.verificationLevel === "LICENSE_VERIFIED";
      case Capability.MANAGE_COMPANY:
        return this.hasRole(user, "company");
      case Capability.ADMIN_ACCESS:
        return this.hasRole(user, "admin");
      default:
        return false;
    }
  }

  private canBookVehicles(user: IUser): boolean {
    return user.status === "ACTIVE" && user.emailVerified === true;
  }

  private canListVehicles(user: IUser): boolean {
    return (
      user.verificationLevel === "LICENSE_VERIFIED" &&
      !!user.idNumber &&
      !!user.idImageUrl
    );
  }

  private canManageCompany(user: IUser): boolean {
    return this.hasRole(user, "company");
  }

  private hasAdminAccess(user: IUser): boolean {
    return this.hasRole(user, "admin");
  }

  private hasRole(user: IUser, roleName: string): boolean {
    // Checks populated role documents because raw ObjectIds alone do not expose role names.
    // Roles are stored as ObjectIds, need to check against role names
    // This requires the roles to be populated
    if (!user.roles || user.roles.length === 0) return false;

    // If roles are populated with documents
    if (typeof user.roles[0] === "object" && "name" in user.roles[0]) {
      return (user.roles as any[]).some((r) => r.name === roleName);
    }

    // If roles are just ObjectIds, we can't check by name without population
    // In this case, assume false and require population
    return false;
  }

  private getPendingRequirements(user: IUser, capability: Capability): string[] {
    // Explains exactly which missing checks are still blocking the requested capability.
    const config = CAPABILITY_CONFIG[capability];
    const requirements: string[] = [];

    if (user.status !== "ACTIVE") {
      requirements.push("Account activation pending");
    }

    if (!user.emailVerified) {
      requirements.push("Email verification pending");
    }

    if (
      config.requiredVerificationLevel !== "BASIC" &&
      user.verificationLevel !== config.requiredVerificationLevel
    ) {
      requirements.push(
        `${config.requiredVerificationLevel} verification required`,
      );
    }

    const missingFields = config.requiredFields.filter((field) => !user[field]);
    if (missingFields.length > 0) {
      requirements.push(`Missing profile information: ${missingFields.join(", ")}`);
    }

    return requirements;
  }

  private canRequestUpgrade(user: IUser, capability: Capability): boolean {
    // Decides whether the user is far enough along the verification path to request the next upgrade.
    const config = CAPABILITY_CONFIG[capability];

    // Can't request if already has it
    if (this.isCapabilityGranted(user, capability)) {
      return false;
    }

    // Check basic prerequisites
    if (user.status !== "ACTIVE" || !user.emailVerified) {
      return false;
    }

    // Check if verification level is sufficient to start the process
    const levelOrder = { BASIC: 0, ID_VERIFIED: 1, LICENSE_VERIFIED: 2 };
    const currentLevel = levelOrder[user.verificationLevel];
    const requiredLevel = levelOrder[config.requiredVerificationLevel];

    // Can request if within 1 level or auto-approval
    if (!config.requiresDocumentReview) {
      return currentLevel >= requiredLevel - 1;
    }

    return currentLevel >= requiredLevel - 1;
  }

  private async hasPendingRequest(
    userId: string,
    capability: Capability,
  ): Promise<boolean> {
    // Looks for an unresolved verification tied to the same capability request.
    const user = await userPersistenceService.findByAuthId(userId);
    if (!user) return false;

    const pending = await Verification.findOne({
      userId: user._id,
      status: "PENDING",
      "extractedData.requestedCapability": capability,
    });

    return !!pending;
  }

  private async grantCapability(
    userId: string,
    capability: Capability,
  ): Promise<void> {
    // Grants the capability by attaching its mapped role and upgrading verification level when needed.
    const roleName = this.getRoleForCapability(capability);
    if (!roleName) return;

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      console.error(`Role "${roleName}" not found for capability ${capability}`);
      return;
    }

    await userPersistenceService.addRole(userId, role._id);

    // Update verification level if needed
    const config = CAPABILITY_CONFIG[capability];
    if (
      config.requiredVerificationLevel !== "BASIC"
    ) {
      await userPersistenceService.updateByAuthId(userId, {
        verificationLevel: config.requiredVerificationLevel,
      });
    }
  }

  private getRoleForCapability(capability: Capability): string | null {
    // Maps capability concepts to the persisted role names used on user documents.
    switch (capability) {
      case Capability.LIST_VEHICLES:
        return "peerhost";
      case Capability.MANAGE_COMPANY:
        return "company";
      case Capability.ADMIN_ACCESS:
        return "admin";
      default:
        return null;
    }
  }

  private getVerificationTypeForCapability(
    capability: Capability,
  ): "DRIVER_LICENSE" | "BUSINESS_DOCUMENT" {
    // Chooses the verification document category that should back the requested capability.
    switch (capability) {
      case Capability.LIST_VEHICLES:
        return "DRIVER_LICENSE";
      case Capability.MANAGE_COMPANY:
        return "BUSINESS_DOCUMENT";
      default:
        return "DRIVER_LICENSE";
    }
  }
}

export const userCapabilityService = new UserCapabilityService();
