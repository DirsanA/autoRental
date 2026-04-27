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
      if (String(user.accountType || "").toUpperCase() === "ADMIN") {
        next();
        return;
      }

      if (await requestUserIsAdmin(user.authUserId || user.id)) {
        next();
        return;
      }

      const ability = await authPermissionService.getAbilityForUser(user.authUserId || user.id);

      if (!ability.can(action, subject)) {
        next(ApiError.forbidden(`Insufficient permissions to ${action} ${subject}`));
        return;
      }

      setRequestAbility(req, ability);
      next();
    } catch (error) {
      console.error("Authorization check failed:", error);
      next(ApiError.internal("Failed to verify permissions"));
    }
  };
}
