import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { companyService } from "../services/company.service.js";
import { ApiError } from "../utils/ApiError.js";
import { requireRequestUser } from "../utils/requestContext.js";

/**
 * Parses company list query params into service options.
 */
function buildListOptions(query: Request["query"]) {
  const { status, page, limit, search } = query;
  const options: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {};

  if (typeof status === "string") options.status = status;
  if (typeof page === "string") options.page = Number.parseInt(page, 10);
  if (typeof limit === "string") options.limit = Number.parseInt(limit, 10);
  if (typeof search === "string") options.search = search;

  return options;
}

export const companyController = {
  /**
   * POST /api/companies
   * Creates a company profile for the authenticated company account.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireRequestUser(req);
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
   * Returns the company owned by the authenticated company account.
   */
  getMyCompany: asyncHandler(async (req: Request, res: Response) => {
    const user = requireRequestUser(req);
    const company = await companyService.getByAuthUserId(user.id);

    if (!company) {
      throw ApiError.notFound("You don't have a registered company account");
    }

    res.json({
      success: true,
      data: { company },
    });
  }),

  /**
   * GET /api/companies/:id
   * Returns a single company by id.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.getById(req.params.id as string);

    res.json({
      success: true,
      data: { company },
    });
  }),

  /**
   * PATCH /api/companies/:id
   * Updates the authenticated company's profile.
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const user = requireRequestUser(req);
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
   * Lists companies with admin filters and pagination.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await companyService.list(buildListOptions(req.query));

    res.json({
      success: true,
      data: result,
    });
  }),

  /**
   * PATCH /api/companies/:id/approve
   * Approves a pending company.
   */
  approve: asyncHandler(async (req: Request, res: Response) => {
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
   * Suspends a company with a required reason.
   */
  suspend: asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;

    if (!reason || typeof reason !== "string") {
      throw ApiError.badRequest("Suspension reason is required");
    }

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
