import type { Request, Response, NextFunction } from "express";
import {
  authPermissionService,
  type AppActions,
  type AppSubjects,
} from "../services/auth.permission.service.js";
import { userPersistenceService } from "../services/user.persistence.service.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { ApiError } from "../utils/ApiError.js";
import { getRequestUser, setRequestAbility } from "../utils/requestContext.js";

async function requestUserIsAdmin(authUserId: string): Promise<boolean> {
  const user = await userPersistenceService.findByAuthIdWithRoles(authUserId);
  if (!user) {
    return false;
  }

  if (String(user.accountType || "").toUpperCase() === "ADMIN") {
    return true;
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role) => {
    const name = (role as { name?: string } | undefined)?.name;
    return String(name || "").toLowerCase() === SYSTEM_ROLES.ADMIN;
  });
}

/**
 * Checks whether the current user can perform an action on a subject.
 */
export function authorize(action: AppActions, subject: AppSubjects) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = getRequestUser(req);
    if (!user?.id) {
      next(ApiError.unauthorized());
      return;
    }

    try {
      // Step 1: System Admin Override
      // If the user's base account type is 'ADMIN', they automatically have access to everything.
      // We skip all other checks to speed up their requests.
      if (String(user.accountType || "").toUpperCase() === "ADMIN") {
        next();
        return;
      }

      // Step 2: Role-based Admin Override
      // If the user has a specific 'admin' role assigned in the database,
      // they also get full access.
      if (await requestUserIsAdmin(user.authUserId || user.id)) {
        next();
        return;
      }

      // Step 3: Granular Permission Check
      // For all other users, we load their specific permissions (abilities)
      // and check if they are allowed to perform this exact action on this subject.
      const ability = await authPermissionService.getAbilityForUser(user.authUserId || user.id);

      if (!ability.can(action, subject)) {
        next(ApiError.forbidden(`Insufficient permissions to ${action} ${subject}`));
        return;
      }

      // If they pass, attach their abilities to the request so later code can use it, and proceed!
      setRequestAbility(req, ability);
      next();
    } catch (error) {
      next(ApiError.internal("Failed to verify permissions"));
    }
  };
}
