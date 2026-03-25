import type { NextFunction, Request, Response } from "express";
import { type AccountType } from "../models/User.js";

/**
 * Restricts a route to one or more Better Auth account types.
 */
export function requireAccountType(...allowedAccountTypes: AccountType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    if (!allowedAccountTypes.includes(user.accountType)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "This account cannot access the requested portal",
        },
      });
      return;
    }

    next();
  };
}
