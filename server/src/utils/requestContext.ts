import type { Request } from "express";
import { ApiError } from "./ApiError.js";

export type RequestUser = { id: string; authUserId?: string; accountType?: string } & Record<string, unknown>;

type MutableRequest = Request & {
  user?: RequestUser;
  session?: unknown;
  ability?: unknown;
};

/**
 * Reads the authenticated user attached by auth middleware.
 */
export function getRequestUser(req: Request): RequestUser | undefined {
  return (req as MutableRequest).user;
}

/**
 * Returns the authenticated user or throws a 401 ApiError.
 */
export function requireRequestUser(
  req: Request,
  message = "Authentication required",
): RequestUser {
  const user = getRequestUser(req);
  if (!user?.id) {
    throw ApiError.unauthorized(message);
  }

  return user;
}

/**
 * Stores the authenticated user and session for downstream handlers.
 */
export function setRequestAuth(
  req: Request,
  user: RequestUser,
  session: unknown,
): void {
  const request = req as MutableRequest;
  request.user = user;
  request.session = session;
}

/**
 * Stores the resolved ability for downstream authorization-aware handlers.
 */
export function setRequestAbility(req: Request, ability: unknown): void {
  (req as MutableRequest).ability = ability;
}

/**
 * Extracts a bearer token from the Authorization header.
 */
export function getBearerToken(req: Request): string | null {
  const rawAuthorization = req.headers.authorization;
  if (
    typeof rawAuthorization !== "string" ||
    !rawAuthorization.toLowerCase().startsWith("bearer ")
  ) {
    return null;
  }

  return rawAuthorization.slice(7).trim() || null;
}
