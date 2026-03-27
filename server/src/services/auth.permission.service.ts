import { PureAbility, AbilityBuilder, createMongoAbility } from "@casl/ability";
import { userPersistenceService } from "./user.persistence.service.js";
import { Company } from "../models/Company.js";

/**
 * Subject types for CASL abilities.
 * In production, you might want to automate this or use class names.
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

/**
 * Service to manage role permissions and generate CASL abilities.
 */
export class AuthPermissionService {
  private interpolatePlaceholders(
    value: unknown,
    context: {
      authUserId: string;
      mongoUserId: string;
      companyId: string;
    },
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
   * Fetches the permissions for a given user and builds their CASL ability.
   * Currently users have a single role in the `roles` array; this can be extended for multiple roles.
   */
  async getAbilityForUser(userId: string): Promise<AppAbility> {
    // Builds a CASL ability from the user's populated roles and stored permission documents.
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    const user = await userPersistenceService.findByAuthIdWithRoles(userId);
    // Returns an empty ability when the user cannot be resolved to any permission-bearing roles.
    if (!user || !user.roles || (Array.isArray(user.roles) && user.roles.length === 0)) {
      // Unauthenticated or roleless users get no permissions by default
      return build();
    }

    const mongoUserId = user._id?.toString?.() ?? userId;
    const company = await Company.findOne({ authUserId: userId }).select("_id").lean();
    const companyId = company?._id?.toString?.() ?? "";

    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];

    for (const role of roles) {
      // Reads each role's permission list and replays it into the CASL builder.
      // Cast role.permissions to the expected structure
      const permissions = (role as any).permissions || [];
      
      for (const p of permissions) {
        // Replaces template placeholders so permission conditions are scoped to the current user.
        const conditions = p.conditions
          ? this.interpolatePlaceholders(p.conditions, {
              authUserId: userId,
              mongoUserId,
              companyId,
            })
          : undefined;

        can(p.action as AppActions, p.subject as AppSubjects, conditions);
      }
    }

    return build();
  }
}

export const authPermissionService = new AuthPermissionService();
