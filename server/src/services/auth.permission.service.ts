import { PureAbility, AbilityBuilder, createMongoAbility } from "@casl/ability";
import { userPersistenceService } from "./user.persistence.service.js";

/**
 * Subject types for CASL abilities.
 * In production, you might want to automate this or use class names.
 */
export type AppSubjects = "User" | "Company" | "Vehicle" | "Booking" | "all";
export type AppActions = "manage" | "create" | "read" | "update" | "delete";

export type AppAbility = PureAbility<[AppActions, AppSubjects]>;

/**
 * Service to manage role permissions and generate CASL abilities.
 */
export class AuthPermissionService {
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

    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];

    for (const role of roles) {
      // Reads each role's permission list and replays it into the CASL builder.
      // Cast role.permissions to the expected structure
      const permissions = (role as any).permissions || [];
      
      for (const p of permissions) {
        // Replaces template placeholders so permission conditions are scoped to the current user.
        // Handle conditions by replacing ${userId} placeholder with actual ID
        const conditions = p.conditions 
          ? JSON.parse(JSON.stringify(p.conditions).replace(/\${userId}/g, userId))
          : undefined;

        can(p.action as AppActions, p.subject as AppSubjects, conditions);
      }
    }

    return build();
  }
}

export const authPermissionService = new AuthPermissionService();
