import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { Auth } from "../config/auth.js";

/**
 * Creates an authentication middleware that uses better-auth's getSession.
 *
 * Attaches `req.user` and `req.session` if authenticated.
 * Returns 401 if no valid session exists.
 */
export function createAuthMiddleware(auth: Auth) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Resolves the caller's session on every protected request using better-auth headers.
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      // Rejects the request immediately when there is no active authenticated session.
      if (!session) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      // Attach to request for downstream use
      (req as any).user = session.user;
      (req as any).session = session.session;

      // Passes the authenticated user context to downstream middleware and controllers.
      next();
    } catch (error) {
      // Treats lookup failures as invalid authentication rather than exposing internals.
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired session",
        },
      });
    }
  };
}
