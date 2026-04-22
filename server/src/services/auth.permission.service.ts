import { PureAbility, AbilityBuilder, createMongoAbility } from "@casl/ability";
import { userPersistenceService } from "./user.persistence.service.js";
import { Company } from "../models/Company.js";

/**
 * Subject types for CASL abilities.
 */
export type AppSubjects =
  | "User"
  | "Company"
  | "Vehicle"
  | "Booking"
  | "Availability"
  | "FleetDocument"
  | "Maintenance"
  | "Transaction"
  | "Payout"
  | "Review"
  | "Dispute"
  | "Verification"
  | "Notification"
  | "Role"
  | "all";
export type AppActions = "manage" | "create" | "read" | "update" | "delete";

export type AppAbility = PureAbility<[AppActions, AppSubjects]>;

type AbilityPlaceholderContext = {
  authUserId: string;
  mongoUserId: string;
  companyId: string;
};

type StoredPermission = {
  action: AppActions;
  subject: AppSubjects;
  conditions?: unknown;
};

/**
 * Service to manage role permissions and generate CASL abilities.
 */
export class AuthPermissionService {
  /**
   * Replaces stored permission placeholders with the current user's values.
   */
  private interpolatePlaceholders(
    value: unknown,
    context: AbilityPlaceholderContext,
  ): unknown {
    if (typeof value === "string") {
      return value
        .replaceAll("${userId}", context.authUserId)
        .replaceAll("${userMongoId}", context.mongoUserId)
        .replaceAll("${companyId}", context.companyId);
    }

    if (Array.isArray(value)) {
      return value.map((entry) => this.interpolatePlaceholders(entry, context));
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [
          key,
          this.interpolatePlaceholders(entry, context),
        ]),
      );
    }

    return value;
  }

  /**
   * Resolves the placeholder values used by dynamic CASL conditions.
   */
  private async buildPlaceholderContext(
    authUserId: string,
    mongoUserId: string,
  ): Promise<AbilityPlaceholderContext> {
    const company = await Company.findOne({ authUserId }).select("_id").lean();

    return {
      authUserId,
      mongoUserId,
      companyId: company?._id?.toString?.() ?? "",
    };
  }

  /**
   * Fetches permissions for a user and builds the resulting CASL ability.
   */
  async getAbilityForUser(userId: string): Promise<AppAbility> {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    const user = await userPersistenceService.findByAuthIdWithRoles(userId);

    if (!user || !user.roles || (Array.isArray(user.roles) && user.roles.length === 0)) {
      return build();
    }

    const mongoUserId = user._id?.toString?.() ?? userId;
    const context = await this.buildPlaceholderContext(userId, mongoUserId);
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];

    for (const role of roles) {
      const permissions = ((role as { permissions?: StoredPermission[] }).permissions ??
        []) as StoredPermission[];

      for (const permission of permissions) {
        const conditions = permission.conditions
          ? this.interpolatePlaceholders(permission.conditions, context)
          : undefined;

        can(permission.action, permission.subject, conditions);
      }
    }

    return build();
  }
}

export const authPermissionService = new AuthPermissionService();
