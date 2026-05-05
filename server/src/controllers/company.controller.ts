import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { companyService } from "../services/company.service.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { normalizePhoneNumber } from "../utils/phone.js";
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

function readString(
  source: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

type MulterFile = { buffer: Buffer; mimetype: string };

function fileBufferToDataUrl(file: MulterFile): string {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}

export const companyController = {
  /**
   * POST /api/companies
   * Creates a company profile for the authenticated company account.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireRequestUser(req);
    const body = req.body as Record<string, unknown>;
    const contactInfo = {
      email:
        readString(body, "contactInfo[email]", "email", "contactEmail") || "",
      phoneNumber:
        normalizePhoneNumber(
          readString(body, "contactInfo[phoneNumber]", "phoneNumber", "phone") || "",
        ) || "",
      address: readString(body, "contactInfo[address]", "address", "companyAddress"),
    };

    if (!contactInfo.email || !contactInfo.phoneNumber) {
      throw ApiError.badRequest(
        "Company contact email and phone number are required",
      );
    }

    const fullAddress =
      readString(body, "fullAddress") ||
      [
        contactInfo.address,
        readString(body, "city"),
        readString(body, "region"),
        "Ethiopia",
      ]
        .filter(Boolean)
        .join(", ");

    const licenseFile = (req as any).file
      ? await uploadToCloudinary(
          fileBufferToDataUrl((req as any).file as MulterFile),
          "auto-rental/company-documents",
        )
      : undefined;

    const logoFile = (req as any).files?.logo?.[0]
      ? await uploadToCloudinary(
          fileBufferToDataUrl((req as any).files.logo[0] as MulterFile),
          "auto-rental/company-logos",
        )
      : undefined;

    const companyData: any = {
      ...body,
      name: readString(body, "name") || "",
      tinNumber: readString(body, "tinNumber") || "",
      website: readString(body, "website"),
      bio: readString(body, "bio"),
      logoUrl: readString(body, "logoUrl"),
      licenseDocumentUrl: readString(body, "licenseDocumentUrl"),
      contactInfo,
      fullAddress,
    };

    if (licenseFile !== undefined) {
      companyData.licenseFile = licenseFile;
    }

    if (logoFile !== undefined) {
      companyData.logoUrl = logoFile;
    }

    const company = await companyService.create(user.id, companyData);

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

  getMyCompanyDashboard: asyncHandler(async (req: Request, res: Response) => {
    const user = requireRequestUser(req);
    const dashboard = await companyService.getDashboardForAuthUser(user.id);

    res.json({
      success: true,
      data: { dashboard },
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
    const body = req.body as Record<string, unknown>;
    const files = (req as any).files as Record<string, MulterFile[]> | undefined;

    const licenseFile = (files?.licenseDocument?.[0] as MulterFile | undefined)
      ? await uploadToCloudinary(
          fileBufferToDataUrl(files!.licenseDocument![0] as MulterFile),
          "auto-rental/company-documents",
        )
      : undefined;

    const logoFile = (files?.logo?.[0] as MulterFile | undefined)
      ? await uploadToCloudinary(
          fileBufferToDataUrl(files!.logo![0] as MulterFile),
          "auto-rental/company-logos",
        )
      : undefined;

    const company = await companyService.update(
      req.params.id as string,
      user.id,
      {
        ...body,
        ...(licenseFile ? { licenseDocumentUrl: licenseFile } : {}),
        ...(logoFile ? { logoUrl: logoFile } : {}),
      },
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

  reject: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.rejectPendingUpdate(req.params.id as string);

    res.json({
      success: true,
      data: {
        company,
        message: "Pending company changes were rejected",
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
  getMyCompanyReviews: asyncHandler(async (req: Request, res: Response) => {
  const user = requireRequestUser(req);

  const company = await companyService.getByAuthUserId(user.id);

  if (!company) {
    throw ApiError.notFound("You don't have a registered company account");
  }

  const reviews = await companyService.getCompanyReviews(
    company._id.toString()
  );

  res.json({
    success: true,
    data: reviews,
  });
}),
};
