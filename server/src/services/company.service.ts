import mongoose from "mongoose";
import { Company, type CompanyDocument } from "../models/Company.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../validators/company.validator.js";

type CompanyRegistrationAvailabilityInput = {
  authUserId?: string;
  loginEmail?: string;
  contactEmail: string;
  tinNumber: string;
  phoneNumber: string;
};

/**
 * Normalizes company emails before they are compared or queried.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class CompanyService {
  /**
   * Validates company uniqueness constraints shared across onboarding flows.
   */
  async assertRegistrationAvailability(
    input: CompanyRegistrationAvailabilityInput,
  ): Promise<void> {
    const loginEmail = input.loginEmail ? normalizeEmail(input.loginEmail) : undefined;
    const contactEmail = normalizeEmail(input.contactEmail);
    const reservedEmails = Array.from(
      new Set([loginEmail, contactEmail].filter((email): email is string => !!email)),
    );

    const [
      existingCompanyForOwner,
      companiesByEmail,
      existingCompanyByTin,
      existingCompanyByPhone,
    ] = await Promise.all([
      input.authUserId
        ? Company.findOne({ authUserId: input.authUserId }).lean()
        : Promise.resolve(null),
      reservedEmails.length > 0
        ? Company.find({ "contactInfo.email": { $in: reservedEmails } })
            .select("contactInfo.email")
            .lean()
        : Promise.resolve([]),
      Company.findOne({ tinNumber: input.tinNumber }).lean(),
      Company.findOne({ "contactInfo.phoneNumber": input.phoneNumber }).lean(),
    ]);

    if (existingCompanyForOwner) {
      throw ApiError.conflict("You already have a registered company");
    }

    const usedCompanyEmails = new Set(
      companiesByEmail
        .map((company) => company.contactInfo?.email)
        .filter((email): email is string => typeof email === "string")
        .map(normalizeEmail),
    );

    if (loginEmail && usedCompanyEmails.has(loginEmail)) {
      throw ApiError.conflict(
        "This login email is already used as another company's contact email",
      );
    }

    if (usedCompanyEmails.has(contactEmail)) {
      throw ApiError.conflict("A company with this contact email already exists");
    }

    if (existingCompanyByTin) {
      throw ApiError.conflict("A company with this TIN number already exists");
    }

    if (existingCompanyByPhone) {
      throw ApiError.conflict(
        "A company with this contact phone number already exists",
      );
    }
  }

  /**
   * Registers a new company under the authenticated company account.
   */
  async create(
  authUserId: string,
  data: CreateCompanyInput & { fullAddress?: string; licenseFile?: string },
): Promise<CompanyDocument> {
  await this.assertRegistrationAvailability({
    authUserId,
    contactEmail: data.contactInfo.email,
    tinNumber: data.tinNumber,
    phoneNumber: data.contactInfo.phoneNumber,
  });

  const tempAddress = data.fullAddress;

  return Company.create({
    authUserId,
    name: data.name,
    tinNumber: data.tinNumber,

    website: data.website,

    bio: tempAddress || data.bio, 

    licenseDocumentUrl: data.licenseFile || data.licenseDocumentUrl,

    contactInfo: data.contactInfo,


    socialLinks: data.socialLinks,
  });
}


  /**
   * Returns a company by its id.
   */
  async getById(companyId: string): Promise<CompanyDocument> {
    const company = await Company.findById(companyId);
    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    return company;
  }

  /**
   * Returns the company owned by a specific auth account.
   */
  async getByAuthUserId(authUserId: string): Promise<CompanyDocument | null> {
    return Company.findOne({ authUserId }).select("-logoUrl -licenseDocumentUrl");
  }

  /**
   * Updates company profile data for the owning account only.
   */
  async update(
    companyId: string,
    authUserId: string,
    data: UpdateCompanyInput,
  ): Promise<CompanyDocument> {
    const company = await Company.findById(companyId);
    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    if (company.authUserId !== authUserId) {
      throw ApiError.forbidden("You can only update your own company");
    }

    if (data.name !== undefined) company.name = data.name;
    if (data.website !== undefined) company.website = data.website ?? undefined;
    if (data.bio !== undefined) company.bio = data.bio ?? undefined;
    if (data.logoUrl !== undefined) company.logoUrl = data.logoUrl ?? undefined;
    if (data.licenseDocumentUrl !== undefined) {
      company.licenseDocumentUrl = data.licenseDocumentUrl ?? undefined;
    }

    if (data.contactInfo) {
      if (data.contactInfo.email) {
        company.contactInfo.email = data.contactInfo.email;
      }
      if (data.contactInfo.phoneNumber) {
        company.contactInfo.phoneNumber = data.contactInfo.phoneNumber;
      }
      if (data.contactInfo.address !== undefined) {
        company.contactInfo.address = data.contactInfo.address ?? undefined;
      }
    }

    if (data.location !== undefined) {
      company.location = data.location ?? undefined;
    }

    if (data.socialLinks) {
      company.socialLinks = {
        ...company.socialLinks,
        ...(data.socialLinks as any),
      };
    }

    await company.save();
    return company;
  }

  /**
   * Lists companies with optional filters and pagination.
   */
  async list(options: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { status, page = 1, limit = 20, search } = options;
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    const authUserIds = companies
      .map((company) => company.authUserId)
      .filter(
        (authUserId): authUserId is string =>
          typeof authUserId === "string" &&
          mongoose.Types.ObjectId.isValid(authUserId),
      )
      .map((authUserId) => new mongoose.Types.ObjectId(authUserId));

    const authAccounts = authUserIds.length
      ? await User.find({ _id: { $in: authUserIds } })
          .select("name email accountType status")
          .lean()
      : [];

    const authAccountMap = new Map(
      authAccounts.map((account) => [account._id.toString(), account]),
    );

    return {
      companies: companies.map((company) => ({
        ...company,
        authAccount: authAccountMap.get(company.authUserId) ?? null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approves a pending company.
   */
  async approve(companyId: string): Promise<CompanyDocument> {
    const company = await Company.findById(companyId);
    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    if (company.status === "ACTIVE") {
      throw ApiError.unprocessable("Company is already approved");
    }

    company.status = "ACTIVE";
    company.isVerified = true;
    company.verifiedAt = new Date();
    company.rejectionReason = undefined;

    await company.save();
    return company;
  }

  /**
   * Suspends a company with a required reason.
   */
  async suspend(companyId: string, reason: string): Promise<CompanyDocument> {
    const company = await Company.findById(companyId);
    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    if (company.status === "SUSPENDED") {
      throw ApiError.unprocessable("Company is already suspended");
    }

    company.status = "SUSPENDED";
    company.rejectionReason = reason;

    await company.save();
    return company;
  }

  /**
   * Finds a company by its contact email.
   */
  async findByEmail(email: string): Promise<CompanyDocument | null> {
    return Company.findOne({ "contactInfo.email": normalizeEmail(email) });
  }
}

export const companyService = new CompanyService();
