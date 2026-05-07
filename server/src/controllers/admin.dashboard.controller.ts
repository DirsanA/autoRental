import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { adminDashboardService } from "../services/admin.dashboard.service.js";

export const adminDashboardController = {
  /**
   * GET /api/admin/dashboard
   */
  getDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const dashboard = await adminDashboardService.getDashboardSnapshot();
    res.json({ success: true, data: { dashboard } });
  }),
};
