import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { companyService } from "../services/company.service.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { normalizePhoneNumber } from "../utils/phone.js";
import { requireRequestUser } from "../utils/requestContext.js";
import { User } from "../models/User.js";
import { Verification } from "../models/Verification.js";

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

function fileBufferToDataUrl(file: Express.Multer.File): string {
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
      email: readString(body, "contactInfo[email]", "email", "contactEmail"),
      phoneNumber: normalizePhoneNumber(
        readString(body, "contactInfo[phoneNumber]", "phoneNumber", "phone") || "",
      ),
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

    const licenseFile = req.file
      ? await uploadToCloudinary(
          fileBufferToDataUrl(req.file),
          "auto-rental/company-documents",
        )
      : undefined;

    const company = await companyService.create(user.id, {
      ...body,
      name: readString(body, "name") || "",
      tinNumber: readString(body, "tinNumber") || "",
      website: readString(body, "website"),
      bio: readString(body, "bio"),
      licenseDocumentUrl: readString(body, "licenseDocumentUrl"),
      contactInfo,
      fullAddress,
      licenseFile,
    });

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
   * GET /api/companies/:id/admin
   * Returns a single company by id including linked auth account + uploaded docs.
   */
  getByIdAdmin: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.getById(req.params.id as string);

    const authAccount = company.authUserId
      ? await User.findById(company.authUserId)
          .select("name email image idImageUrl accountType status")
          .lean()
      : null;

    const authUserObjectId = authAccount?._id ?? null;
    const verificationDocs = authUserObjectId
      ? await Verification.find({
          $or: [
            { userId: authUserObjectId },
            ...(company?._id ? [{ companyId: company._id }] : []),
          ],
          documentType: { $in: ["NATIONAL_ID", "DRIVER_LICENSE", "PASSPORT"] },
        })
          .select(
            "documentType documentFrontUrl documentBackUrl status createdAt updatedAt",
          )
          .sort({ createdAt: -1 })
          .lean()
      : [];

    res.json({
      success: true,
      data: {
        company: {
          ...(company.toJSON ? company.toJSON() : company),
          authAccount: authAccount
            ? {
                id: authAccount._id?.toString?.() ?? String(authAccount._id),
                name: authAccount.name ?? null,
                email: authAccount.email ?? null,
                image: authAccount.image ?? null,
                status: authAccount.status ?? null,
                accountType: authAccount.accountType ?? null,
                idImageUrl: authAccount.idImageUrl ?? null,
              }
            : null,
          authDocuments: {
            verifications: verificationDocs.map((doc: any) => ({
              id: doc._id?.toString?.() ?? String(doc._id),
              documentType: doc.documentType,
              documentFrontUrl: doc.documentFrontUrl,
              documentBackUrl: doc.documentBackUrl ?? null,
              status: doc.status,
              createdAt: doc.createdAt ?? null,
              updatedAt: doc.updatedAt ?? null,
            })),
          },
        },
      },
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
