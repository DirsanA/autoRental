import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromNodeHeaders } from "better-auth/node";
import type { AuthService } from "../services/auth.service.js";
import type { Auth } from "../config/auth.js";
import { ENV } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Creates authentication-related route handlers.
 * Handles custom registration flows for different user types and login.
 */
export function createAuthController(auth: Auth, authService: AuthService) {
  return {
    /**
     * POST /api/auth/register
     * Register a new base user.
     */
    registerUser: asyncHandler(async (req: Request, res: Response) => {
      // Delegates user sign-up to the auth service so controller logic stays transport-focused.
      const result = await authService.registerUser(
        req.body,
        fromNodeHeaders(req.headers),
      );

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          message:
            "Account created successfully. Please check your email to verify your account.",
        },
      });
    }),

    /**
     * POST /api/auth/register/company
     * Register a new company admin + create company profile.
     */
    registerCompany: asyncHandler(async (req: Request, res: Response) => {
      // Runs the combined company-account onboarding flow through the auth service.
      const result = await authService.registerCompany(
        req.body,
        fromNodeHeaders(req.headers),
      );

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          company: result.company,
          message:
            "Company account registered successfully. Your company is pending admin approval. Please verify your email.",
        },
      });
    }),

    /**
     * POST /api/auth/login
     * Login with email and password.
     */
    login: asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body;

      // Signs the user in through better-auth-backed service logic and returns the issued session token.
      const result = await authService.login(
        email,
        password,
        fromNodeHeaders(req.headers),
      );

      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          message: "Login successful",
        },
      });
    }),

    /**
     * POST /api/auth/logout
     * Invalidate the current session.
     */
    logout: asyncHandler(async (req: Request, res: Response) => {
      // Invalidates the active session using the same request headers that created it.
      await auth.api.signOut({
        headers: fromNodeHeaders(req.headers),
      });

      res.json({
        success: true,
        data: { message: "Logged out successfully" },
      });
    }),

    /**
     * GET /api/auth/session
     * Get the current session and user data.
     */
    getSession: asyncHandler(async (req: Request, res: Response) => {
      // Reads the current session directly from better-auth to reflect the latest auth state.
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      // Returns a standard unauthorized response when the caller has no active session.
      if (!session) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No active session",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: session.user,
          session: session.session,
        },
      });
    }),

    /**
     * POST /api/auth/forgot-password
     * Request a password reset email.
     */
    forgotPassword: asyncHandler(async (req: Request, res: Response) => {
      const { email } = req.body;

      // Requests a reset email without exposing whether the submitted address exists in the system.
      await auth.api.requestPasswordReset({
        headers: fromNodeHeaders(req.headers),
        body: { email, redirectTo: `${ENV.FRONTEND_URL}/reset-password` },
      });

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        data: {
          message:
            "If an account with that email exists, a password reset link has been sent.",
        },
      });
    }),

    /**
     * POST /api/auth/reset-password
     * Reset password using the token from the email.
     */
    resetPassword: asyncHandler(async (req: Request, res: Response) => {
      const { token, newPassword } = req.body;

      // Completes the password reset through better-auth once the reset token is presented.
      await auth.api.resetPassword({
        headers: fromNodeHeaders(req.headers),
        body: { token, newPassword },
      });

      res.json({
        success: true,
        data: { message: "Password reset successfully. You can now log in with your new password." },
      });
    }),
  };
}
