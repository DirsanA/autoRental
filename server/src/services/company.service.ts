import mongoose from "mongoose";
import { Company, type CompanyDocument } from "../models/Company.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
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

  async getDashboardForAuthUser(authUserId: string) {
    const company = await Company.findOne({ authUserId }).select("_id").lean();
    if (!company) {
      throw ApiError.notFound("You don't have a registered company account");
    }

    const companyVehicles = await Vehicle.find({
      ownerType: "Company",
      ownerId: company._id,
    })
      .select("_id status")
      .lean();

    const totalFleet = companyVehicles.length;
    const fleetStatus = companyVehicles.reduce(
      (acc, vehicle) => {
        switch (vehicle.status) {
          case "AVAILABLE":
            acc.available += 1;
            break;
          case "BOOKED":
            acc.booked += 1;
            break;
          case "MAINTENANCE":
            acc.maintenance += 1;
            break;
          case "RETIRED":
            acc.retired += 1;
            break;
          case "PENDING_APPROVAL":
            acc.pendingApproval += 1;
            break;
        }

        return acc;
      },
      {
        available: 0,
        booked: 0,
        maintenance: 0,
        retired: 0,
        pendingApproval: 0,
      },
    );

    const vehicleIds = companyVehicles.map((vehicle) => vehicle._id);

    if (vehicleIds.length === 0) {
      return {
        totalFleet: 0,
        fleetStatus,
        activeBookings: 0,
        completedBookings: 0,
        earnings: 0,
        revenueTrend: {
          weekly: Array.from({ length: 7 }, (_, index) => ({
            day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
            revenue: 0,
            bookings: 0,
          })),
          monthly: Array.from({ length: 4 }, (_, index) => ({
            period: `W${index + 1}`,
            revenue: 0,
            bookings: 0,
          })),
        },
      };
    }

    const [activeBookings, completedBookings, earningsResult] = await Promise.all([
      Booking.countDocuments({
        vehicleId: { $in: vehicleIds },
        status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      }),
      Booking.countDocuments({
        vehicleId: { $in: vehicleIds },
        status: "COMPLETED",
      }),
      Booking.aggregate([
        {
          $match: {
            vehicleId: { $in: vehicleIds },
            "payment.status": "PAID",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$priceSnapshot.totalAmount" },
          },
        },
      ]),
    ]);

    const earnings = earningsResult?.[0]?.total ?? 0;

    const now = new Date();
    const weeklyStart = new Date(now);
    weeklyStart.setHours(0, 0, 0, 0);
    weeklyStart.setDate(weeklyStart.getDate() - 6);

    const monthlyStart = new Date(now);
    monthlyStart.setHours(0, 0, 0, 0);
    monthlyStart.setDate(monthlyStart.getDate() - 27);

    const recentBookings = await Booking.find({
      vehicleId: { $in: vehicleIds },
      "payment.status": "PAID",
      createdAt: { $gte: monthlyStart },
    })
      .select("createdAt priceSnapshot.totalAmount")
      .lean();

    const weeklyMap = new Map<string, { revenue: number; bookings: number }>();
    const monthMap = new Map<number, { revenue: number; bookings: number }>();

    recentBookings.forEach((booking) => {
      const createdAt = new Date(booking.createdAt);
      const dateKey = createdAt.toISOString().slice(0, 10);
      const revenue = booking.priceSnapshot?.totalAmount ?? 0;

      if (createdAt >= weeklyStart) {
        const existing = weeklyMap.get(dateKey) ?? { revenue: 0, bookings: 0 };
        existing.revenue += revenue;
        existing.bookings += 1;
        weeklyMap.set(dateKey, existing);
      }

      const daysSinceStart = Math.max(
        0,
        Math.floor((createdAt.getTime() - monthlyStart.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const monthIndex = Math.min(3, Math.floor(daysSinceStart / 7));
      const existingMonth = monthMap.get(monthIndex) ?? { revenue: 0, bookings: 0 };
      existingMonth.revenue += revenue;
      existingMonth.bookings += 1;
      monthMap.set(monthIndex, existingMonth);
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weeklyStart);
      day.setDate(day.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      const stats = weeklyMap.get(key) ?? { revenue: 0, bookings: 0 };
      return {
        day: dayNames[day.getDay()],
        revenue: stats.revenue,
        bookings: stats.bookings,
      };
    });

    const monthly = Array.from({ length: 4 }, (_, index) => {
      const stats = monthMap.get(index) ?? { revenue: 0, bookings: 0 };
      return {
        period: `W${index + 1}`,
        revenue: stats.revenue,
        bookings: stats.bookings,
      };
    });

    return {
      totalFleet,
      fleetStatus,
      activeBookings,
      completedBookings,
      earnings,
      revenueTrend: {
        weekly,
        monthly,
      },
    };
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
        .select("name tinNumber website status isVerified verifiedAt contactInfo createdAt updatedAt authUserId")
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
