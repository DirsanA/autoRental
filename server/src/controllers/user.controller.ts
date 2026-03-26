import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromNodeHeaders } from "better-auth/node";
import type { Auth } from "../config/auth.js";

/**
 * Creates user-related route handlers.
 * The auth instance is injected so we can call auth.api methods.
 */
export function createUserController(auth: Auth) {
  return {
    /**
     * GET /api/users/me
     * Returns the currently authenticated user's profile.
     */
    getMe: asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;

      // Returns the authenticated user object already attached by the auth middleware.
      res.json({
        success: true,
        data: { user },
      });
    }),

    /**
     * PATCH /api/users/me
     * Updates the authenticated user's profile fields.
     * Delegates to better-auth's updateUser for fields it manages,
     * and can be extended for custom fields.
     */
    updateMe: asyncHandler(async (req: Request, res: Response) => {
      const { firstName, lastName, phoneNumber } = req.body;
      const user = (req as any).user;

      // Builds a partial update payload so omitted fields do not overwrite existing values.
      // Build the update payload for better-auth
      const updateData: Record<string, any> = {};

      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

      // Keeps the aggregate display name in sync when either first or last name changes.
      // Update name in better-auth's core user field as well
      if (firstName !== undefined || lastName !== undefined) {
        updateData.name = `${firstName ?? user.firstName} ${lastName ?? user.lastName}`;
      }

      // Persists the profile edit through better-auth so auth-owned user fields stay authoritative.
      const updatedUser = await auth.api.updateUser({
        headers: fromNodeHeaders(req.headers),
        body: updateData,
      });

      res.json({
        success: true,
        data: { user: updatedUser },
      });
    }),
  };
}
