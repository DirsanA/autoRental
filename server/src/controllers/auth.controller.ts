import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { AuthService } from "../services/auth.service.js";
import { AccountType } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
/**
 *
 */
type AuthResultWithHeaders = {
  headers?: {
    getSetCookie?: () => string[];
    get?: (name: string) => string | null;
    forEach?: (callback: (value: string, key: string) => void) => void;
    ["set-cookie"]?: string | string[];
    ["Set-Cookie"]?: string | string[];
  };
};

/**
 * Forwards better-auth Set-Cookie headers to the Express response.
 */
function forwardAuthCookies(res: Response, result: unknown): void {
  const headers = (result as AuthResultWithHeaders | undefined)?.headers;
  if (!headers) return;

  try {
    if (typeof headers.getSetCookie === "function") {
      for (const cookie of headers.getSetCookie()) {
        res.append("Set-Cookie", cookie);
      }
      return;
    }

    if (
      typeof headers.forEach === "function" &&
      typeof headers.get === "function"
    ) {
      const rawCookie = headers.get("set-cookie");
      if (rawCookie) {
        res.append("Set-Cookie", rawCookie);
      }
      return;
    }

    const rawCookie = headers["set-cookie"] ?? headers["Set-Cookie"];
    if (Array.isArray(rawCookie)) {
      for (const cookie of rawCookie) {
        res.append("Set-Cookie", cookie);
      }
      return;
    }

    if (typeof rawCookie === "string" && rawCookie) {
      res.append("Set-Cookie", rawCookie);
    }
  } catch {
    // Cookie forwarding is best-effort.
  }
}

/**
 * Converts Express request headers into the format expected by better-auth.
 */
function toNodeHeaders(req: Request): Headers {
  return fromNodeHeaders(req.headers);
}

/**
 * Creates authentication-related route handlers.
 */
export function createAuthController(authService: AuthService) {
  const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password, toNodeHeaders(req));

    forwardAuthCookies(res, result.cookieSource);

    res.json({
      success: true,
      data: result.body,
    });
  });

  /**
   * Creates a portal-specific login handler.
   */
  const loginFor = (accountType: AccountType) =>
    asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body;
      const result = await authService.login(
        email,
        password,
        toNodeHeaders(req),
        accountType,
      );

      forwardAuthCookies(res, result.cookieSource);

      res.json({
        success: true,
        data: result.body,
      });
    });

  return {
    /**
     * POST /api/auth/register
     * Registers a base user account.
     */
    registerUser: asyncHandler(async (req: Request, res: Response) => {
      const result = await authService.registerUser(req.body, toNodeHeaders(req));

      forwardAuthCookies(res, result.cookieSource);

      res.status(201).json({
        success: true,
        data: result.body,
      });
    }),

    /**
     * POST /api/auth/register/company
     * Registers a company account and profile in one flow.
     */
    registerCompany: asyncHandler(async (req: Request, res: Response) => {
      const result = await authService.registerCompany(
        req.body,
        toNodeHeaders(req),
      );

      forwardAuthCookies(res, result.cookieSource);

      res.status(201).json({
        success: true,
        data: result.body,
      });
    }),

    /**
     * POST /api/auth/login
     * Logs any account into the unified application session.
     */
    login,

    /**
     * POST /api/auth/login/user
     * Backward-compatible user portal login.
     */
    loginUser: loginFor(AccountType.USER),

    /**
     * POST /api/auth/login/company
     * Logs a company account into the company portal.
     */
    loginCompany: loginFor(AccountType.COMPANY),

    /**
     * POST /api/auth/login/admin
     * Logs an admin into the admin portal.
     */
    loginAdmin: loginFor(AccountType.ADMIN),

    /**
     * POST /api/auth/logout
     * Invalidates the current session.
     */
    logout: asyncHandler(async (req: Request, res: Response) => {
      const result = await authService.logout(toNodeHeaders(req));

      forwardAuthCookies(res, result.cookieSource);

      res.json({
        success: true,
        data: result.body,
      });
    }),

    /**
     * GET /api/auth/session
     * Returns the current session and user data.
     */
    getSession: asyncHandler(async (req: Request, res: Response) => {
      const data = await authService.getSession(toNodeHeaders(req));

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * POST /api/auth/forgot-password
     * Requests a password reset email.
     */
    forgotPassword: asyncHandler(async (req: Request, res: Response) => {
      const { email } = req.body;
      const data = await authService.requestPasswordReset(
        email,
        toNodeHeaders(req),
      );

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * POST /api/auth/reset-password
     * Resets a password using the email token.
     */
    resetPassword: asyncHandler(async (req: Request, res: Response) => {
      const { token, newPassword } = req.body;
      const data = await authService.resetPassword(
        token,
        newPassword,
        toNodeHeaders(req),
      );

      res.json({
        success: true,
        data,
      });
    }),
  };
}
