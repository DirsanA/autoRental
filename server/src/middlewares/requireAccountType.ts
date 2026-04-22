import type { NextFunction, Request, Response } from "express";
import { type AccountType } from "../models/User.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { userPersistenceService } from "../services/user.persistence.service.js";
import { ApiError } from "../utils/ApiError.js";
import { getRequestUser } from "../utils/requestContext.js";

async function requestUserHasAdminRole(authUserId: string): Promise<boolean> {
  const user = await userPersistenceService.findByAuthIdWithRoles(authUserId);
  if (!user) {
    return false;
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role) => {
    const name = (role as { name?: string } | undefined)?.name;
    return String(name || "").toLowerCase() === SYSTEM_ROLES.ADMIN;
  });
}

/**
 * Restricts a route to one or more Better Auth account types.
 * Admin-role users are also allowed through admin-only routes.
 */
export function requireAccountType(...allowedAccountTypes: AccountType[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = getRequestUser(req);

    if (!user) {
      next(ApiError.unauthorized());
      return;
    }

    if (allowedAccountTypes.includes(user.accountType as AccountType)) {
      next();
      return;
    }

    const adminRouteRequested = allowedAccountTypes.includes("ADMIN" as AccountType);
    if (adminRouteRequested && (await requestUserHasAdminRole(user.id))) {
      next();
      return;
    }

    next(ApiError.forbidden("This account cannot access the requested portal"));
  };
}
