import type { Request, Response, NextFunction } from "express";
import { authPermissionService, type AppActions, type AppSubjects } from "../services/auth.permission.service.js";

/**
 * Authorization middleware.
 * Checks if the authenticated user has permission for a specific action on a subject.
 *
 * Usage:
 *   router.get("/:id", authenticate, authorize("read", "Company"), controller.get)
 */
export function authorize(action: AppActions, subject: AppSubjects) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    // Fails fast when authentication has not attached a current user to the request.
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }

    try {
      // Loads the user's permission set so this request can be checked against centralized rules.
      const ability = await authPermissionService.getAbilityForUser(user.id);

      if (ability.can(action, subject)) {
        // Attach ability to request in case it's needed in the controller
        (req as any).ability = ability;
        next();
        return;
      }

      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Insufficient permissions to ${action} ${subject}`,
        },
      });
    } catch (error) {
       // Converts unexpected permission lookup failures into a safe generic server response.
       console.error("Authorization check failed:", error);
       res.status(500).json({
         success: false,
         error: { code: "INTERNAL_ERROR", message: "Failed to verify permissions" },
       });
    }
  };
}
