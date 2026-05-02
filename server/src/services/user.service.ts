import mongoose from "mongoose";
import type { Auth } from "../config/auth.js";
import { Booking } from "../models/Booking.js";
import { Company } from "../models/Company.js";
import { Dispute } from "../models/Dispute.js";
import { Role } from "../models/Role.js";
import { Review } from "../models/Review.js";
import { Transaction } from "../models/Transaction.js";
import { User, VerificationLevel } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Verification } from "../models/Verification.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary, resolveUploadValue } from "../utils/cloudinary.js";
import { userPersistenceService } from "./user.persistence.service.js";
import type { RequestUser } from "../utils/requestContext.js";
import type { UpdateProfileInput } from "../validators/user.validator.js";
import type {
  AdminUserListQueryInput,
  AdminUserStatusInput,
  AdminUserVerificationLevelInput,
} from "../validators/user.admin.validator.js";

type UserViewSource = Record<string, any>;

/**
 * Derives a username-like label from the best available identity fields.
 */
function deriveUsername(email?: string, name?: string): string {
  const normalizedEmail = (email ?? "").trim();
  const atIndex = normalizedEmail.indexOf("@");
  if (atIndex > 0) {
    return normalizedEmail.slice(0, atIndex);
  }

  const fallbackName = (name ?? "").trim().toLowerCase();
  if (!fallbackName) {
    return "user";
  }

  return fallbackName.replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");
}

/**
 * Maps stored user status into the admin UI label expected by clients.
 */
function mapStatus(status?: string, emailVerified?: boolean) {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "active" as const;
    case "SUSPENDED":
      return "suspended" as const;
    case "PENDING":
      return emailVerified ? ("inactive" as const) : ("invited" as const);
    default:
      return "inactive" as const;
  }
}

/**
 * Escapes user search input before building a regular expression.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a stable YYYY-MM-DD date string for API responses.
 */
function formatJoinedDate(value: unknown): string {
  const date = value ? new Date(value as string | number | Date) : new Date();
  return date.toISOString().slice(0, 10);
}

/**
 * Extracts role names from a populated or plain user document.
 */
function extractRoleNames(user: UserViewSource): string[] {
  return Array.isArray(user.roles)
    ? user.roles
        .map((role: { name?: string }) => role?.name)
        .filter((name): name is string => Boolean(name))
    : [];
}

/**
 * Builds the display name used by admin user responses.
 */
function buildDisplayName(user: UserViewSource): string {
  return (
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email
  );
}

/**
 * Maps a user document into the lightweight admin-facing response shape.
 */
function toAdminUserSummary(user: UserViewSource) {
  const roleNames = extractRoleNames(user);
  const displayName = buildDisplayName(user);

  return {
    id: user._id?.toString?.() ?? String(user._id),
    name: displayName,
    username: deriveUsername(user.email, displayName),
    email: user.email,
    role: roleNames[0] || user.accountType || "User",
    status: mapStatus(user.status, user.emailVerified),
    joined: formatJoinedDate(user.createdAt),
    verificationLevel: user.verificationLevel ?? null,
  };
}

/**
 * Builds candidate auth identifiers that may link a user to a company record.
 */
function buildAuthUserIdentifiers(userId: string, user: UserViewSource): string[] {
  return Array.from(
    new Set(
      [userId, String(user.id ?? ""), String(user._id ?? "")]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

/**
 * User service for profile and admin user-management workflows.
 */
export class UserService {
  constructor(private readonly auth: Auth) {}

  /**
   * Loads the peer host role id when admin promotion requires it.
   */
  private async getPeerHostRoleId() {
    const role = await Role.findOne({ name: SYSTEM_ROLES.PEERHOST })
      .select("_id")
      .lean();

    return role?._id ?? null;
  }

  /**
   * Validates and returns a Mongo user id.
   */
  private requireUserId(id: string): string {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid user id");
    }

    return id;
  }

  /**
   * Builds the Mongo filter and pagination options for admin user listings.
   */
  private buildListQuery(query: AdminUserListQueryInput) {
    const filter: Record<string, any> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.accountType) {
      filter.accountType = query.accountType;
    } else if (query.scope === "PEOPLE") {
      filter.accountType = { $in: ["USER", "ADMIN"] };
    }

    if (query.search?.trim()) {
      const regex = new RegExp(escapeRegExp(query.search.trim()), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return {
      filter,
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  /**
   * Returns the current authenticated user profile.
   */
  getMe(user: RequestUser): { user: RequestUser } {
    return { user };
  }

  /**
   * Updates the authenticated user's editable profile fields.
   */
  async updateMe(
    user: RequestUser,
    data: UpdateProfileInput,
    headers: Headers,
  ): Promise<{ user: unknown }> {
    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;

    if (data.firstName !== undefined || data.lastName !== undefined) {
      updateData.name = `${data.firstName ?? user.firstName} ${data.lastName ?? user.lastName}`;
    }

    if (data.image !== undefined) {
      updateData.image = await resolveUploadValue(
        data.image,
        `auto-rental/users/${user.id}`,
        "avatar",
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }

    return { user: updatedUser };
  }

  /**
   * Lists users for the admin experience.
   */
  async listUsers(query: AdminUserListQueryInput) {
    const { filter, page, limit, skip } = this.buildListQuery(query);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "roles", select: "name" })
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map((user) => toAdminUserSummary(user as UserViewSource)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Returns a single user by id for admins.
   */
  async getById(id: string) {
    const userId = this.requireUserId(id);
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userId)
      .populate({ path: "roles", select: "name" })
      .lean();

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const baseUser = toAdminUserSummary(user as UserViewSource);
    const roleNames = extractRoleNames(user as UserViewSource);
    const authUserIdentifiers = buildAuthUserIdentifiers(
      userId,
      user as UserViewSource,
    );

    const company = await Company.findOne({
      authUserId: { $in: authUserIdentifiers },
    })
      .select(
        "name status isVerified verifiedAt contactInfo website tinNumber createdAt",
      )
      .lean();

    const ownedVehiclesFilter = company
      ? { ownerId: company._id, ownerType: "Company" as const }
      : { ownerId: mongoUserId, ownerType: "User" as const };

    const ownedVehicleIds = await Vehicle.find(ownedVehiclesFilter)
      .select("_id")
      .lean();
    const vehicleIds = ownedVehicleIds.map((vehicle) => vehicle._id);
    const bookingOrFilters: Array<Record<string, unknown>> = [
      { renterId: mongoUserId },
    ];

    if (vehicleIds.length > 0) {
      bookingOrFilters.push({ vehicleId: { $in: vehicleIds } });
    }

    const reviewTargetFilters: Array<Record<string, unknown>> = [
      { targetId: mongoUserId, targetType: "User" },
    ];

    if (company?._id) {
      reviewTargetFilters.push({ targetId: company._id, targetType: "Company" });
    }

    const renterBookingsFilter = { renterId: mongoUserId } as Record<string, unknown>;
    const activeRenterBookingsFilter = {
      renterId: mongoUserId,
      status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
    } as Record<string, unknown>;
    const ownedVehicleBookingsFilter = vehicleIds.length > 0
      ? ({ vehicleId: { $in: vehicleIds } } as Record<string, unknown>)
      : null;
    const bookingsFeedFilter = { $or: bookingOrFilters } as Record<string, unknown>;
    const authoredOrReceivedReviewsFilter = {
      $or: [{ reviewerId: mongoUserId }, ...reviewTargetFilters],
    } as Record<string, unknown>;
    const raisedOrReceivedDisputesFilter = {
      $or: [{ raisedBy: mongoUserId }, { respondentId: mongoUserId }],
    } as Record<string, unknown>;
    const transactionFeedFilter = {
      $or: company?._id
        ? [
            { payerId: mongoUserId },
            { receiverId: company._id, receiverModel: "Company" },
          ]
        : [
            { payerId: mongoUserId },
            { receiverId: mongoUserId, receiverModel: "User" },
          ],
    } as Record<string, unknown>;

    const [
      verificationCount,
      verifications,
      ownedVehicles,
      bookingMetrics,
      recentBookings,
      reviewMetrics,
      recentReviews,
      disputeMetrics,
      recentDisputes,
      transactionMetrics,
      recentTransactions,
    ] =
      await Promise.all([
        Verification.countDocuments({ userId: mongoUserId }),
        Verification.find({ userId: mongoUserId })
          .sort({ createdAt: -1 })
          .select(
            "documentType status adminComment verifiedAt documentFrontUrl documentBackUrl createdAt extractedData",
          )
          .lean(),
        Vehicle.find({ ownerId: mongoUserId, ownerType: "User" })
          .sort({ createdAt: -1 })
          .select(
            "make model year vin plate mileage fuel transmission seats features condition price availability delivery status photos documents createdAt verifiedAt",
          )
          .lean(),
        Promise.all([
          Booking.countDocuments(renterBookingsFilter as any),
          Booking.countDocuments(activeRenterBookingsFilter as any),
          ownedVehicleBookingsFilter
            ? Booking.countDocuments(ownedVehicleBookingsFilter as any)
            : Promise.resolve(0),
        ]),
        Booking.find(bookingsFeedFilter as any)
          .sort({ createdAt: -1 })
          .limit(5)
          .select("bookingId renterId vehicleId status startTime endTime createdAt")
          .lean(),
        Promise.all([
          Review.countDocuments({ reviewerId: mongoUserId } as any),
          Review.countDocuments({ $or: reviewTargetFilters } as any),
        ]),
        Review.find(authoredOrReceivedReviewsFilter as any)
          .sort({ createdAt: -1 })
          .limit(5)
          .select("reviewerId targetId targetType rating comment createdAt")
          .lean(),
        Promise.all([
          Dispute.countDocuments({ raisedBy: mongoUserId } as any),
          Dispute.countDocuments({ respondentId: mongoUserId } as any),
        ]),
        Dispute.find(raisedOrReceivedDisputesFilter as any)
          .sort({ createdAt: -1 })
          .limit(5)
          .select("raisedBy subjectModel issueCategory status createdAt")
          .lean(),
        Promise.all([
          Transaction.aggregate<{ total: number }>([
            {
              $match: {
                payerId: mongoUserId,
                status: "COMPLETED",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ]),
          Transaction.aggregate<{ total: number }>([
            {
              $match: company?._id
                ? {
                    receiverId: company._id,
                    receiverModel: "Company",
                    status: "COMPLETED",
                  }
                : {
                    receiverId: mongoUserId,
                    receiverModel: "User",
                    status: "COMPLETED",
                  },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ]),
        ]),
        Transaction.find(transactionFeedFilter as any)
          .sort({ createdAt: -1 })
          .limit(5)
          .select("payerId type status amount currency receiverModel createdAt")
          .lean(),
      ]);

    return {
      user: {
        ...baseUser,
        firstName: (user as UserViewSource).firstName,
        lastName: (user as UserViewSource).lastName,
        accountType: (user as UserViewSource).accountType,
        emailVerified: !!(user as UserViewSource).emailVerified,
        verificationLevel: (user as UserViewSource).verificationLevel,
        image: (user as UserViewSource).image,
        phoneNumber: (user as UserViewSource).phoneNumber,
        walletBalance: (user as UserViewSource).walletBalance,
        idNumber: (user as UserViewSource).idNumber,
        idImageUrl: (user as UserViewSource).idImageUrl,
        address: (user as UserViewSource).address,
        lastLogin: (user as UserViewSource).lastLogin,
        createdAt: (user as UserViewSource).createdAt,
        updatedAt: (user as UserViewSource).updatedAt,
        roles: roleNames,
      },
      company: company
        ? {
            id: company._id?.toString?.() ?? String(company._id),
            name: company.name,
            status: company.status,
            isVerified: company.isVerified,
            verifiedAt: company.verifiedAt,
            contactEmail: company.contactInfo?.email ?? null,
            contactPhone: company.contactInfo?.phoneNumber ?? null,
            website: company.website ?? null,
            tinNumber: company.tinNumber,
            createdAt: company.createdAt ?? null,
          }
        : null,
      metrics: {
        bookingsAsRenter: bookingMetrics[0],
        activeBookingsAsRenter: bookingMetrics[1],
        bookingsOnOwnedVehicles: bookingMetrics[2],
        vehiclesOwned: vehicleIds.length,
        verificationRequests: verificationCount,
        reviewsWritten: reviewMetrics[0],
        reviewsReceived: reviewMetrics[1],
        disputesRaised: disputeMetrics[0],
        disputesAgainst: disputeMetrics[1],
        totalPaid: transactionMetrics[0][0]?.total ?? 0,
        totalReceived: transactionMetrics[1][0]?.total ?? 0,
      },
      verifications: verifications.map((verification) => ({
        id: verification._id?.toString?.() ?? String(verification._id),
        documentType: verification.documentType,
        status: verification.status,
        reviewTargetLevel:
          (verification.extractedData as { targetVerificationLevel?: string } | undefined)
            ?.targetVerificationLevel ?? null,
        documentNumber:
          (verification.extractedData as { documentNumber?: string } | undefined)
            ?.documentNumber ?? null,
        dateOfBirth:
          (verification.extractedData as { dateOfBirth?: string } | undefined)
            ?.dateOfBirth ?? null,
        documentExpiry:
          (verification.extractedData as { documentExpiry?: string } | undefined)
            ?.documentExpiry ?? null,
        submittedAddress:
          (verification.extractedData as { address?: string } | undefined)
            ?.address ?? null,
        adminComment: verification.adminComment ?? null,
        verifiedAt: verification.verifiedAt ?? null,
        documentFrontUrl: verification.documentFrontUrl,
        documentBackUrl: verification.documentBackUrl ?? null,
        createdAt: verification.createdAt ?? null,
      })),
      ownedVehicles: ownedVehicles.map((vehicle) => ({
        id: vehicle._id?.toString?.() ?? String(vehicle._id),
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin ?? null,
        plate: vehicle.plate,
        mileage: vehicle.mileage ?? null,
        fuel: vehicle.fuel ?? null,
        transmission: vehicle.transmission ?? null,
        seats: vehicle.seats ?? null,
        features: Array.isArray(vehicle.features) ? vehicle.features : [],
        condition: vehicle.condition ?? null,
        price: vehicle.price ?? null,
        availability: vehicle.availability ?? null,
        delivery: vehicle.delivery ?? null,
        status: vehicle.status ?? null,
        verifiedAt: vehicle.verifiedAt ?? null,
        createdAt: vehicle.createdAt ?? null,
        photos: {
          front: vehicle.photos?.front ?? null,
          back: vehicle.photos?.back ?? null,
          side: vehicle.photos?.side ?? null,
          interior: vehicle.photos?.interior ?? null,
          gallery: Array.isArray(vehicle.photos?.gallery)
            ? vehicle?.photos?.gallery.filter(Boolean)
            : [],
        },
        documents: {
          ownership: vehicle.documents?.ownership ?? null,
          insurance: vehicle.documents?.insurance ?? null,
        },
      })),
      recentBookings: recentBookings.map((booking) => ({
        id: booking._id?.toString?.() ?? String(booking._id),
        bookingId: booking.bookingId,
        status: booking.status,
        relation:
          String(booking.renterId) === String(mongoUserId) ? "RENTER" : "HOST",
        vehicleId: booking.vehicleId?.toString?.() ?? String(booking.vehicleId),
        startTime: booking.startTime,
        endTime: booking.endTime,
        createdAt: booking.createdAt ?? null,
      })),
      recentReviews: recentReviews.map((review) => ({
        id: review._id?.toString?.() ?? String(review._id),
        targetType: review.targetType,
        relation:
          String(review.reviewerId) === String(mongoUserId) ? "AUTHORED" : "RECEIVED",
        rating: review.rating,
        comment: review.comment ?? null,
        createdAt: review.createdAt ?? null,
      })),
      recentDisputes: recentDisputes.map((dispute) => ({
        id: dispute._id?.toString?.() ?? String(dispute._id),
        subjectModel: dispute.subjectModel,
        issueCategory: dispute.issueCategory,
        status: dispute.status,
        relation:
          String((dispute as { raisedBy?: unknown }).raisedBy) === String(mongoUserId)
            ? "RAISED"
            : "RESPONDENT",
        createdAt: dispute.createdAt ?? null,
      })),
      recentTransactions: recentTransactions.map((transaction) => ({
        id: transaction._id?.toString?.() ?? String(transaction._id),
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        direction:
          String((transaction as { payerId?: unknown }).payerId) === String(mongoUserId)
            ? "OUTGOING"
            : "INCOMING",
        receiverModel: transaction.receiverModel ?? null,
        createdAt: transaction.createdAt ?? null,
      })),
    };
  }

  /**
   * Updates a user's status while preventing self-updates.
   */
  async updateStatus(
    caller: RequestUser,
    id: string,
    data: AdminUserStatusInput,
  ) {
    const userId = this.requireUserId(id);

    if (userId === caller.id) {
      throw ApiError.badRequest("You cannot change your own status");
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { status: data.status } },
      { new: true },
    )
      .populate({ path: "roles", select: "name" })
      .lean();

    if (!updated) {
      throw ApiError.notFound("User not found");
    }

    return {
      user: toAdminUserSummary(updated as UserViewSource),
    };
  }

  /**
   * Promotes a user to PEER_HOST after vehicle review.
   */
  async updateVerificationLevel(
    caller: RequestUser,
    id: string,
    data: AdminUserVerificationLevelInput,
  ) {
    const userId = this.requireUserId(id);

    if (userId === caller.id) {
      throw ApiError.badRequest("You cannot change your own verification level");
    }

    if (data.verificationLevel !== VerificationLevel.PEER_HOST) {
      throw ApiError.badRequest("Unsupported verification level change");
    }

    const user = await User.findById(userId)
      .populate({ path: "roles", select: "name" });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (
      ![
        VerificationLevel.ID_VERIFIED,
        VerificationLevel.LICENSE_VERIFIED,
        VerificationLevel.PEER_HOST,
      ].includes(user.verificationLevel)
    ) {
      throw ApiError.unprocessable(
        "User must be ID verified or license verified before becoming a peer host",
      );
    }

    const ownedVehicleCount = await Vehicle.countDocuments({
      ownerId: user._id,
      ownerType: "User",
    });

    if (ownedVehicleCount === 0) {
      throw ApiError.unprocessable(
        "User must upload at least one vehicle with its images and details before peer-host promotion",
      );
    }

    user.verificationLevel = VerificationLevel.PEER_HOST;
    await user.save();

    const peerHostRoleId = await this.getPeerHostRoleId();
    if (!peerHostRoleId) {
      throw ApiError.internal('Role "peerhost" is not available');
    }

    await userPersistenceService.addRoleByMongoId(user._id, peerHostRoleId);

    const refreshed = await User.findById(userId)
      .populate({ path: "roles", select: "name" })
      .lean();

    if (!refreshed) {
      throw ApiError.notFound("User not found after update");
    }

    return {
      user: toAdminUserSummary(refreshed as UserViewSource),
    };
  }

  /**
   * Deletes a user and their auth artifacts while preventing self-deletion.
   */
  async deleteUser(caller: RequestUser, id: string): Promise<{ message: string }> {
    const userId = this.requireUserId(id);

    if (userId === caller.id) {
      throw ApiError.badRequest("You cannot delete your own account");
    }

    const existing = await User.findById(userId).select("email").lean<{ email?: string }>();
    if (!existing) {
      throw ApiError.notFound("User not found");
    }

    await userPersistenceService.cleanupAuthArtifacts(userId, existing.email);

    return { message: "User deleted" };
  }
}

/**
 * Factory for the user service.
 */
export function createUserService(auth: Auth): UserService {
  return new UserService(auth);
}
