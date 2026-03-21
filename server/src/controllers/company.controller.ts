import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { companyService } from "../services/company.service.js";

export const companyController = {
  /**
   * POST /api/companies
   * Register a new company. The authenticated user becomes the owner.
   * Company starts in PENDING_APPROVAL state.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    // Creates a company record owned by the authenticated user through the company service.
    const company = await companyService.create(user.id, req.body);

    res.status(201).json({
      success: true,
      data: {
        company,
        message:
          "Company registered successfully. It is under admin review and will be activated upon approval.",
      },
    });
  }),

  /**
   * GET /api/companies/me
   * Get the company owned by the authenticated user.
   */
  getMyCompany: asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    // Looks up the company currently associated with the signed-in owner account.
    const company = await companyService.getByOwnerId(user.id);

    // Returns a not-found response instead of an empty object when the user has no company.
    if (!company) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "You don't have a registered company",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { company },
    });
  }),

  /**
   * GET /api/companies/:id
   * Get a company by ID. Public endpoint.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    // Fetches a single company by route id for public or internal detail views.
    const company = await companyService.getById(req.params.id as string);

    res.json({
      success: true,
      data: { company },
    });
  }),

  /**
   * PATCH /api/companies/:id
   * Update company profile. Only the company owner can update.
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    // Delegates ownership checks and partial update rules to the company service.
    const company = await companyService.update(
      req.params.id as string,
      user.id,
      req.body,
    );

    res.json({
      success: true,
      data: { company },
    });
  }),

  /**
   * GET /api/companies
   * Admin: List all companies with filters and pagination.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { status, page, limit, search } = req.query;

    // Builds filter and pagination options from query params before calling the service layer.
    const options: any = {};
    if (status) options.status = status as string;
    if (page) options.page = parseInt(page as string, 10);
    if (limit) options.limit = parseInt(limit as string, 10);
    if (search) options.search = search as string;

    const result = await companyService.list(options);

    res.json({
      success: true,
      data: result,
    });
  }),

  /**
   * PATCH /api/companies/:id/approve
   * Admin: Approve a pending company.
   */
  approve: asyncHandler(async (req: Request, res: Response) => {
    // Approves a pending company through the admin-facing company service workflow.
    const company = await companyService.approve(req.params.id as string);

    res.json({
      success: true,
      data: {
        company,
        message: "Company approved successfully",
      },
    });
  }),

  /**
   * PATCH /api/companies/:id/suspend
   * Admin: Suspend a company with a reason.
   */
  suspend: asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;
    // Requires an explicit suspension reason so administrative actions remain explainable.
    if (!reason || typeof reason !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Suspension reason is required",
        },
      });
      return;
    }

    // Applies the suspension through the service once the controller-level input check passes.
    const company = await companyService.suspend(req.params.id as string, reason);

    res.json({
      success: true,
      data: {
        company,
        message: "Company suspended",
      },
    });
  }),
};
