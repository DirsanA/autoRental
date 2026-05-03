import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { UserService } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireRequestUser } from "../utils/requestContext.js";
import type {
  AdminUserListQueryInput,
  AdminUserVerificationLevelInput,
} from "../validators/user.admin.validator.js";

/**
 * Creates user-related route handlers.
 */
export function createUserController(userService: UserService) {
  return {
    /**
     * GET /api/users/me
     * Returns the currently authenticated user's profile.
     */
    getMe: asyncHandler(async (req: Request, res: Response) => {
      const data = userService.getMe(requireRequestUser(req));

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/users/me/peerhost-dashboard
     * Returns peer host dashboard statistics.
     */
    getPeerHostDashboard: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.getPeerHostDashboard(requireRequestUser(req));

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/users/me/peerhost-reviews
     * Returns reviews for the peer host (reviews where the host is the target).
     */
    getPeerHostReviews: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.getPeerHostReviews(requireRequestUser(req));

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * PATCH /api/users/me
     * Updates the authenticated user's profile fields.
     */
    updateMe: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.updateMe(
        requireRequestUser(req),
        req.body,
        fromNodeHeaders(req.headers),
      );

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/users
     * Lists users for the admin experience.
     */
    listUsers: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.listUsers(req.query as AdminUserListQueryInput);

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/users/:id
     * Returns a single user by id for admins.
     */
    getById: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.getById(String(req.params.id));

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * PATCH /api/users/:id/status
     * Updates a user's status.
     */
    updateStatus: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.updateStatus(
        requireRequestUser(req),
        String(req.params.id),
        req.body,
      );

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * PATCH /api/users/:id/verification-level
     * Applies an admin-managed verification level transition.
     */
    updateVerificationLevel: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.updateVerificationLevel(
        requireRequestUser(req),
        String(req.params.id),
        req.body as AdminUserVerificationLevelInput,
      );

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * DELETE /api/users/:id
     * Deletes a user and their auth artifacts.
     */
    deleteUser: asyncHandler(async (req: Request, res: Response) => {
      const data = await userService.deleteUser(
        requireRequestUser(req),
        String(req.params.id),
      );

      res.json({
        success: true,
        data,
      });
    }),
  };
}
