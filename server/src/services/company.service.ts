import mongoose from "mongoose";
import { Company, type CompanyDocument } from "../models/Company.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../validators/company.validator.js";

export class CompanyService {
  /**
   * Register a new company under the authenticated user.
   * Companies start in PENDING_APPROVAL status until admin approves.
   */
  async create(
    ownerId: string,
    data: CreateCompanyInput,
  ): Promise<CompanyDocument> {
    // Prevents one user from owning multiple company profiles inside the platform.
    // Check if user already owns a company
    const existing = await Company.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) });
    if (existing) {
      throw ApiError.conflict("You already have a registered company");
    }

    // Guards the TIN as a unique business identifier before the company is created.
    // Check if TIN is already taken
    const tinExists = await Company.findOne({ tinNumber: data.tinNumber });
    if (tinExists) {
      throw ApiError.conflict("A company with this TIN number already exists");
    }

    const company = await Company.create({
      ownerId,
      name: data.name,
      tinNumber: data.tinNumber,
      website: data.website,
      bio: data.bio,
      contactInfo: data.contactInfo,
      location: data.location,
      socialLinks: data.socialLinks,
      // Defaults applied by schema:
      // status: "PENDING_APPROVAL"
      // isVerified: false
      // walletBalance: 0
    });

    return company;
  }

  /**
   * Get a company by its ID.
   */
  async getById(companyId: string): Promise<CompanyDocument> {
    // Loads a company by id and fails loudly when the requested record does not exist.
    const company = await Company.findById(companyId);
    if (!company) {
      throw ApiError.notFound("Company not found");
    }
    return company;
  }

  /**
   * Get the company owned by a specific user.
   */
  async getByOwnerId(ownerId: string): Promise<CompanyDocument | null> {
    return Company.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) });
  }

  /**
   * Update company profile. Only the company owner can update.
   */
  async update(
    companyId: string,
    ownerId: string,
    data: UpdateCompanyInput,
  ): Promise<CompanyDocument> {
    // Loads the target company first so ownership and partial field updates can be checked safely.
    const company = await Company.findById(companyId);
    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    // Restricts profile edits to the user who owns the company record.
    if (company.ownerId.toString() !== ownerId) {
      throw ApiError.forbidden("You can only update your own company");
    }

    // Applies only the submitted fields so partial updates do not wipe untouched company data.
    // Apply partial updates
    if (data.name !== undefined) company.name = data.name;
    if (data.website !== undefined) company.website = data.website ?? undefined;
    if (data.bio !== undefined) company.bio = data.bio ?? undefined;
    if (data.logoUrl !== undefined) company.logoUrl = data.logoUrl ?? undefined;

    if (data.contactInfo) {
      if (data.contactInfo.email)
        company.contactInfo.email = data.contactInfo.email;
      if (data.contactInfo.phoneNumber)
        company.contactInfo.phoneNumber = data.contactInfo.phoneNumber;
      if (data.contactInfo.address !== undefined)
        company.contactInfo.address = data.contactInfo.address ?? undefined;
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
   * Admin: List all companies with optional status filter and pagination.
   */
  async list(options: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    // Builds a Mongo filter and pagination window for admin company listings.
    const { status, page = 1, limit = 20, search } = options;
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    // Fetches the current page and total count together so pagination metadata stays consistent.
    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "firstName lastName email phoneNumber"),
      Company.countDocuments(filter),
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Approve a company — sets status to ACTIVE, isVerified to true.
   */
  async approve(companyId: string): Promise<CompanyDocument> {
    // Approves a pending company and marks its verification metadata in the same write flow.
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
   * Admin: Suspend a company with a reason.
   */
  async suspend(
    companyId: string,
    reason: string,
  ): Promise<CompanyDocument> {
    // Suspends the company and records the reason that explains the administrative action.
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
}

export const companyService = new CompanyService();
