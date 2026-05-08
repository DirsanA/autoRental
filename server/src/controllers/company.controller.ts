import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { companyService } from "../services/company.service.js";
import { walletService } from "../services/wallet.service.js";
import { notificationDispatcher } from "../services/notification.dispatcher.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { normalizePhoneNumber } from "../utils/phone.js";
import { requireRequestUser } from "../utils/requestContext.js";
import { Verification } from "../models/Verification.js";
import { Company } from "../models/Company.js";

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
        readString(body, "contactInfo[phoneNumber]", "phoneNumber", "phone") ||
          "",
      ),
      address: readString(
        body,
        "contactInfo[address]",
        "address",
        "companyAddress",
      ),
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
    // 1. Fetch company with specific fields needed for detail page
    const company = await Company.findById(req.params.id as string)
      .select(
        "name tinNumber website bio logoUrl licenseDocumentUrl contactInfo socialLinks location isVerified verifiedAt status rejectionReason walletBalance createdAt updatedAt authUserId pendingChanges pendingChangesRequestedAt",
      )
      .lean();

    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    // 2. Fetch auth account with controlled projection
    const authAccount = company.authUserId
      ? await User.findById(company.authUserId)
          .select("name email image idImageUrl accountType status")
          .lean()
      : null;

    // 3. Fetch verification docs for the owner/company
    const authUserObjectId = authAccount?._id ?? null;
    const [verificationDocs, wallet, ledger] = await Promise.all([
      Verification.find({
        $or: [
          ...(authUserObjectId ? [{ userId: authUserObjectId }] : []),
          { companyId: company._id },
        ],
        documentType: { $in: ["NATIONAL_ID", "DRIVER_LICENSE", "PASSPORT"] },
      })
        .select(
          "documentType documentFrontUrl documentBackUrl status createdAt updatedAt",
        )
        .sort({ createdAt: -1 })
        .lean(),
      walletService.getWalletByOwner(company._id, "Company"),
      walletService.getLedgerByOwner(company._id, "Company"),
    ]);

    res.json({
      success: true,
      data: {
        company: {
          ...company,
          id: company._id.toString(),
          authAccount: authAccount
            ? {
                id: authAccount._id.toString(),
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
              id: doc._id.toString(),
              documentType: doc.documentType,
              documentFrontUrl: doc.documentFrontUrl,
              documentBackUrl: doc.documentBackUrl ?? null,
              status: doc.status,
              createdAt: doc.createdAt ?? null,
              updatedAt: doc.updatedAt ?? null,
            })),
          },
          wallet: wallet
            ? {
                availableBalance: wallet.availableBalance,
                pendingBalance: wallet.pendingBalance,
                lifetimeEarned: wallet.lifetimeEarned,
                currency: wallet.currency,
              }
            : null,
          ledger: ledger.map((entry) => ({
            id: entry._id.toString(),
            entryType: entry.entryType,
            amount: entry.amount,
            balanceField: entry.balanceField,
            before: entry.before,
            after: entry.after,
            createdAt: entry.createdAt!,
            metadata: entry.metadata,
          })),
        },
      },
    });
  }),

  /**
   * PATCH /api/companies/:id
   * Updates the authenticated company's profile, handling optional file uploads.
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const user = requireRequestUser(req);

    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const body: Record<string, unknown> = { ...req.body };

    if (files?.logo?.[0]) {
      body.logoUrl = await uploadToCloudinary(
        fileBufferToDataUrl(files.logo[0]),
        "auto-rental/company-logos",
      );
    }

    if (files?.licenseDocument?.[0]) {
      body.licenseDocumentUrl = await uploadToCloudinary(
        fileBufferToDataUrl(files.licenseDocument[0]),
        "auto-rental/company-documents",
      );
    }

    const company = await companyService.update(
      req.params.id as string,
      user.id,
      body as any,
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
    const caller = requireRequestUser(req);
    const company = await companyService.approve(req.params.id as string);

    // Send notification to auth account email (not company contact email)
    if (company.authUserId) {
      const authUser = await User.findById(company.authUserId)
        .select("email name")
        .lean();
      if (authUser?.email) {
        await notificationDispatcher.sendAdminActionNotification({
          recipientId: company.authUserId,
          recipientEmail: authUser.email,
          recipientName: authUser.name || company.name,
          action: "COMPANY_APPROVED",
          entityId: company._id,
          entityType: "Company",
          adminId: caller.id,
        });
      }
    }

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
    const caller = requireRequestUser(req);
    const { reason } = req.body;

    if (!reason || typeof reason !== "string") {
      throw ApiError.badRequest("Suspension reason is required");
    }

    const company = await companyService.suspend(
      req.params.id as string,
      reason,
    );

    // Send notification to auth account email (not company contact email)
    if (company.authUserId) {
      const authUser = await User.findById(company.authUserId)
        .select("email name")
        .lean();
      if (authUser?.email) {
        await notificationDispatcher.sendAdminActionNotification({
          recipientId: company.authUserId,
          recipientEmail: authUser.email,
          recipientName: authUser.name || company.name,
          action: "COMPANY_SUSPENDED",
          reason,
          entityId: company._id,
          entityType: "Company",
          adminId: caller.id,
        });
      }
    }

    res.json({
      success: true,
      data: {
        company,
        message: "Company suspended",
      },
    });
  }),

  /**
   * PATCH /api/companies/:id/approve-pending
   * Approves pending changes for a company.
   */
  approvePending: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.approvePendingChanges(
      req.params.id as string,
    );

    res.json({
      success: true,
      data: {
        company,
        message: "Pending changes approved",
      },
    });
  }),

  /**
   * PATCH /api/companies/:id/reject-pending
   * Rejects pending changes for a company.
   */
  rejectPending: asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;

    if (!reason || typeof reason !== "string") {
      throw ApiError.badRequest("Rejection reason is required");
    }

    const company = await companyService.rejectPendingChanges(
      req.params.id as string,
      reason,
    );

    res.json({
      success: true,
      data: {
        company,
        message: "Pending changes rejected",
      },
    });
  }),
};
