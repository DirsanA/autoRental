import mongoose from "mongoose";
import { User, VerificationLevel } from "../models/User.js";
import { Verification } from "../models/Verification.js";
import { Vehicle } from "../models/Vehicle.js";
import { Role } from "../models/Role.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { ApiError } from "../utils/ApiError.js";
import { userPersistenceService } from "./user.persistence.service.js";
import type { RequestUser } from "../utils/requestContext.js";
import type {
  AdminP2PListQueryInput,
  AdminP2PDecisionInput,
} from "../validators/p2p.admin.validator.js";

type P2PApplicationStatus = "pending" | "approved" | "rejected" | "flagged";

type VehicleStats = {
  totalVehicles: number;
  pendingVehicles: number;
  approvedVehicles: number;
  rejectedVehicles: number;
  latestVehicleSubmission: Date | null;
};

type HostReviewReadiness = {
  canPromote: boolean;
  blockers: string[];
  approvedVerificationCount: number;
  pendingVerificationCount: number;
  rejectedVerificationCount: number;
  totalVehicleCount: number;
  pendingVehicleCount: number;
  approvedVehicleCount: number;
  rejectedVehicleCount: number;
};

const HOST_DOCUMENT_TYPES = new Set([
  "NATIONAL_ID",
  "PASSPORT",
  "DRIVER_LICENSE",
]);

function isHostVerificationDocumentType(documentType: string) {
  return HOST_DOCUMENT_TYPES.has(documentType);
}

function hasApprovedHostVerificationEvidence(input: {
  verificationLevel: VerificationLevel;
  approvedVerificationCount: number;
}) {
  return (
    input.approvedVerificationCount > 0 ||
    input.verificationLevel === VerificationLevel.ID_VERIFIED ||
    input.verificationLevel === VerificationLevel.LICENSE_VERIFIED ||
    input.verificationLevel === VerificationLevel.PEER_HOST
  );
}

function buildHostReviewReadiness(input: {
  verificationLevel: VerificationLevel;
  accountStatus: "PENDING" | "ACTIVE" | "SUSPENDED";
  approvedVerificationCount: number;
  pendingVerificationCount: number;
  rejectedVerificationCount: number;
  totalVehicleCount: number;
  pendingVehicleCount: number;
  approvedVehicleCount: number;
  rejectedVehicleCount: number;
}): HostReviewReadiness {
  const blockers: string[] = [];
  const hasApprovedVerification = hasApprovedHostVerificationEvidence({
    verificationLevel: input.verificationLevel,
    approvedVerificationCount: input.approvedVerificationCount,
  });

  if (input.accountStatus !== "ACTIVE") {
    blockers.push("The account must be active before promotion.");
  }

  if (!hasApprovedVerification) {
    if (input.pendingVerificationCount > 0) {
      blockers.push(
        "A host verification document is still pending admin review.",
      );
    } else {
      blockers.push(
        "At least one approved ID or driver's license verification is required.",
      );
    }
  }

  if (input.totalVehicleCount === 0) {
    blockers.push(
      "At least one vehicle submission is required before promotion.",
    );
  }

  if (
    input.totalVehicleCount > 0 &&
    input.pendingVehicleCount === 0 &&
    input.approvedVehicleCount === 0 &&
    input.rejectedVehicleCount > 0
  ) {
    blockers.push(
      "All submitted vehicles have been rejected. Review a new vehicle submission before promotion.",
    );
  }

  return {
    canPromote: blockers.length === 0,
    blockers,
    approvedVerificationCount: input.approvedVerificationCount,
    pendingVerificationCount: input.pendingVerificationCount,
    rejectedVerificationCount: input.rejectedVerificationCount,
    totalVehicleCount: input.totalVehicleCount,
    pendingVehicleCount: input.pendingVehicleCount,
    approvedVehicleCount: input.approvedVehicleCount,
    rejectedVehicleCount: input.rejectedVehicleCount,
  };
}

/**
 * P2P Host applicant summary for admin listing.
 */
export type P2PHostSummary = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  verificationLevel: VerificationLevel;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  hasDriverLicense: boolean;
  hasIdDocument: boolean;
  vehiclesOwned: number;
  vehiclesPendingApproval: number;
  vehiclesApproved: number;
  status: P2PApplicationStatus;
  submittedAt: string | null;
  lastLogin: Date | null;
  reviewReadiness: {
    canPromote: boolean;
    blockerCount: number;
    pendingVerificationCount: number;
    pendingVehicleCount: number;
  };
};

/**
 * Full P2P host detail for admin review.
 */
export type P2PHostDetail = {
  applicationStatus: P2PApplicationStatus;
  reviewReadiness: HostReviewReadiness;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    verificationLevel: VerificationLevel;
    status: "PENDING" | "ACTIVE" | "SUSPENDED";
    image: string | null;
    idNumber: string | null;
    idImageUrl: string | null;
    address: string | null;
    createdAt: Date | null;
    lastLogin: Date | null;
  };
  verifications: {
    id: string;
    documentType: string;
    status: string;
    documentFrontUrl: string | null;
    documentBackUrl: string | null;
    adminComment: string | null;
    verifiedAt: Date | null;
    createdAt: Date | null;
    extractedData: Record<string, any> | null;
  }[];
  vehicles: {
    id: string;
    make: string;
    model: string;
    year: number;
    plate: string;
    vin: string | null;
    status: string;
    price: number;
    photos: {
      front: string | null;
      back: string | null;
      side: string | null;
      interior: string | null;
      gallery: string[];
    };
    documents: {
      ownership: string | null;
      insurance: string | null;
    };
    adminComment: string | null;
    verifiedAt: Date | null;
    createdAt: Date | null;
  }[];
  metrics: {
    totalVehicles: number;
    pendingVehicles: number;
    approvedVehicles: number;
    rejectedVehicles: number;
    totalVerifications: number;
  };
};

function deriveApplicationStatus(input: {
  verificationLevel: VerificationLevel;
  readiness: HostReviewReadiness;
}): P2PApplicationStatus {
  const hasApprovedVerification = hasApprovedHostVerificationEvidence({
    verificationLevel: input.verificationLevel,
    approvedVerificationCount: input.readiness.approvedVerificationCount,
  });

  if (input.verificationLevel === VerificationLevel.PEER_HOST) {
    return "approved";
  }

  if (
    !hasApprovedVerification &&
    input.readiness.pendingVerificationCount === 0 &&
    input.readiness.rejectedVerificationCount > 0
  ) {
    return "rejected";
  }

  if (
    input.readiness.totalVehicleCount > 0 &&
    input.readiness.pendingVehicleCount === 0 &&
    input.readiness.approvedVehicleCount === 0 &&
    input.readiness.rejectedVehicleCount > 0
  ) {
    return "rejected";
  }

  if (
    input.readiness.rejectedVerificationCount > 0 ||
    input.readiness.rejectedVehicleCount > 0
  ) {
    return "flagged";
  }

  return "pending";
}

function deriveSubmittedAt(
  latestVerificationAt?: Date | null,
  latestVehicleSubmission?: Date | null,
) {
  if (latestVerificationAt && latestVehicleSubmission) {
    return latestVerificationAt > latestVehicleSubmission
      ? latestVerificationAt
      : latestVehicleSubmission;
  }

  return latestVerificationAt ?? latestVehicleSubmission ?? null;
}

function getDisplayName(user: Record<string, any>) {
  return (
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email
  );
}

function summarizeVerifications(verifications: Array<Record<string, any>>) {
  let approvedVerificationCount = 0;
  let pendingVerificationCount = 0;
  let rejectedVerificationCount = 0;

  for (const verification of verifications) {
    if (!isHostVerificationDocumentType(String(verification.documentType))) {
      continue;
    }

    if (verification.status === "APPROVED") {
      approvedVerificationCount += 1;
    } else if (verification.status === "PENDING") {
      pendingVerificationCount += 1;
    } else if (verification.status === "REJECTED") {
      rejectedVerificationCount += 1;
    }
  }

  return {
    approvedVerificationCount,
    pendingVerificationCount,
    rejectedVerificationCount,
  };
}

/**
 * P2P Admin Service for managing peer-host approvals.
 */
export class P2PAdminService {
  /**
   * Lists P2P host applicants with their verification and vehicle status.
   */
  async listHosts(query: AdminP2PListQueryInput) {
    const { status, search, page, limit } = query;

    const filter: Record<string, any> = {
      accountType: "USER",
      verificationLevel: {
        $in: [
          VerificationLevel.ID_VERIFIED,
          VerificationLevel.LICENSE_VERIFIED,
          VerificationLevel.PEER_HOST,
        ],
      },
    };

    const vehicleAggregations = await Vehicle.aggregate([
      {
        $match: {
          ownerType: "User",
        },
      },
      {
        $group: {
          _id: "$ownerId",
          totalVehicles: { $sum: 1 },
          pendingVehicles: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING_APPROVAL"] }, 1, 0] },
          },
          approvedVehicles: {
            $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] },
          },
          rejectedVehicles: {
            $sum: { $cond: [{ $eq: ["$status", "RETIRED"] }, 1, 0] },
          },
          latestVehicleSubmission: { $max: "$createdAt" },
        },
      },
    ]);

    const applicantUserIds = vehicleAggregations.map((vehicle) => vehicle._id);
    if (applicantUserIds.length === 0) {
      return {
        hosts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    filter._id = { $in: applicantUserIds };

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex },
      ];
    }

    const users = await User.find(filter)
      .populate({ path: "roles", select: "name" })
      .sort({ createdAt: -1 })
      .lean();

    if (users.length === 0) {
      return {
        hosts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const userIds = users.map((user) => user._id);
    const verifications = await Verification.find({ userId: { $in: userIds } })
      .select("userId status documentType createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const verificationMapByUser = new Map<string, any[]>();
    const documentPresenceMap = new Map<
      string,
      { hasDriverLicense: boolean; hasIdDocument: boolean }
    >();

    verifications.forEach((verification) => {
      const userId = verification.userId.toString();

      if (!verificationMapByUser.has(userId)) {
        verificationMapByUser.set(userId, []);
      }
      verificationMapByUser.get(userId)!.push(verification);

      const documentPresence = documentPresenceMap.get(userId) || {
        hasDriverLicense: false,
        hasIdDocument: false,
      };

      if (verification.documentType === "DRIVER_LICENSE") {
        documentPresence.hasDriverLicense = true;
      }

      if (
        verification.documentType === "NATIONAL_ID" ||
        verification.documentType === "PASSPORT"
      ) {
        documentPresence.hasIdDocument = true;
      }

      documentPresenceMap.set(userId, documentPresence);
    });

    const vehicleMap = new Map<string, VehicleStats>(
      vehicleAggregations.map((aggregation) => [
        aggregation._id.toString(),
        {
          totalVehicles: aggregation.totalVehicles || 0,
          pendingVehicles: aggregation.pendingVehicles || 0,
          approvedVehicles: aggregation.approvedVehicles || 0,
          rejectedVehicles: aggregation.rejectedVehicles || 0,
          latestVehicleSubmission: aggregation.latestVehicleSubmission || null,
        },
      ]),
    );

    let hosts: P2PHostSummary[] = users.map((user) => {
      const userId = user._id.toString();
      const userVerifications = verificationMapByUser.get(userId) || [];
      const latestVerification = userVerifications[0];
      const vehicleStats = vehicleMap.get(userId) || {
        totalVehicles: 0,
        pendingVehicles: 0,
        approvedVehicles: 0,
        rejectedVehicles: 0,
        latestVehicleSubmission: null,
      };
      const verificationSummary = summarizeVerifications(userVerifications);
      const readiness = buildHostReviewReadiness({
        verificationLevel: user.verificationLevel,
        accountStatus: user.status,
        ...verificationSummary,
        totalVehicleCount: vehicleStats.totalVehicles,
        pendingVehicleCount: vehicleStats.pendingVehicles,
        approvedVehicleCount: vehicleStats.approvedVehicles,
        rejectedVehicleCount: vehicleStats.rejectedVehicles,
      });
      const submittedAt = deriveSubmittedAt(
        latestVerification?.createdAt || null,
        vehicleStats.latestVehicleSubmission,
      );

      return {
        id: userId,
        userId,
        name: getDisplayName(user),
        email: user.email,
        phoneNumber: user.phoneNumber || null,
        verificationLevel: user.verificationLevel,
        verificationStatus: latestVerification?.status || null,
        hasDriverLicense:
          documentPresenceMap.get(userId)?.hasDriverLicense || false,
        hasIdDocument: documentPresenceMap.get(userId)?.hasIdDocument || false,
        vehiclesOwned: vehicleStats.totalVehicles,
        vehiclesPendingApproval: vehicleStats.pendingVehicles,
        vehiclesApproved: vehicleStats.approvedVehicles,
        status: deriveApplicationStatus({
          verificationLevel: user.verificationLevel,
          readiness,
        }),
        submittedAt: submittedAt?.toISOString() || null,
        lastLogin: user.lastLogin || null,
        reviewReadiness: {
          canPromote: readiness.canPromote,
          blockerCount: readiness.blockers.length,
          pendingVerificationCount: readiness.pendingVerificationCount,
          pendingVehicleCount: readiness.pendingVehicleCount,
        },
      };
    });

    if (status && status !== "all") {
      hosts = hosts.filter((host) => host.status === status);
    }

    hosts = hosts.sort((a, b) => {
      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return bTime - aTime;
    });

    const skip = (page - 1) * limit;
    const paginatedHosts = hosts.slice(skip, skip + limit);

    return {
      hosts: paginatedHosts,
      pagination: {
        page,
        limit,
        total: hosts.length,
        totalPages: Math.ceil(hosts.length / limit),
      },
    };
  }

  /**
   * Gets detailed information about a P2P host applicant.
   */
  async getHostDetail(hostId: string): Promise<P2PHostDetail> {
    const userId = hostId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw ApiError.badRequest("Invalid host ID");
    }

    const user = await User.findById(userId)
      .populate({ path: "roles", select: "name" })
      .lean();

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const [verifications, vehicles] = await Promise.all([
      Verification.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
      Vehicle.find({ ownerId: user._id, ownerType: "User" })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (verifications.length === 0 && vehicles.length === 0) {
      throw ApiError.notFound("User has not submitted a host application");
    }

    const pendingVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "PENDING_APPROVAL",
    ).length;
    const approvedVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "AVAILABLE",
    ).length;
    const rejectedVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "RETIRED",
    ).length;
    const verificationSummary = summarizeVerifications(verifications);
    const reviewReadiness = buildHostReviewReadiness({
      verificationLevel: user.verificationLevel,
      accountStatus: user.status,
      ...verificationSummary,
      totalVehicleCount: vehicles.length,
      pendingVehicleCount: pendingVehicles,
      approvedVehicleCount: approvedVehicles,
      rejectedVehicleCount: rejectedVehicles,
    });

    return {
      applicationStatus: deriveApplicationStatus({
        verificationLevel: user.verificationLevel,
        readiness: reviewReadiness,
      }),
      reviewReadiness,
      user: {
        id: user._id.toString(),
        name: getDisplayName(user),
        email: user.email,
        phoneNumber: user.phoneNumber || null,
        verificationLevel: user.verificationLevel,
        status: user.status,
        image: user.image || null,
        idNumber: user.idNumber || null,
        idImageUrl: user.idImageUrl || null,
        address: user.address || null,
        createdAt: user.createdAt || null,
        lastLogin: user.lastLogin || null,
      },
      verifications: verifications.map((verification) => ({
        id: verification._id.toString(),
        documentType: verification.documentType,
        status: verification.status,
        documentFrontUrl: verification.documentFrontUrl || null,
        documentBackUrl: verification.documentBackUrl || null,
        adminComment: verification.adminComment || null,
        verifiedAt: verification.verifiedAt || null,
        createdAt: verification.createdAt || null,
        extractedData: verification.extractedData || null,
      })),
      vehicles: vehicles.map((vehicle) => ({
        id: vehicle._id.toString(),
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        plate: vehicle.plate,
        vin: vehicle.vin || null,
        status: vehicle.status,
        price: vehicle.price,
        photos: {
          front: vehicle.photos?.front || null,
          back: vehicle.photos?.back || null,
          side: vehicle.photos?.side || null,
          interior: vehicle.photos?.interior || null,
          gallery: vehicle.photos?.gallery || [],
        },
        documents: {
          ownership: vehicle.documents?.ownership || null,
          insurance: vehicle.documents?.insurance || null,
        },
        adminComment: vehicle.adminComment || null,
        verifiedAt: vehicle.verifiedAt || null,
        createdAt: vehicle.createdAt || null,
      })),
      metrics: {
        totalVehicles: vehicles.length,
        pendingVehicles,
        approvedVehicles,
        rejectedVehicles,
        totalVerifications: verifications.length,
      },
    };
  }

  /**
   * Gets detailed information about a single vehicle for admin review.
   */
  async getVehicleDetail(vehicleId: string) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      throw ApiError.badRequest("Invalid vehicle ID");
    }

    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    const owner = await User.findById(vehicle.ownerId)
      .select(
        "name email phoneNumber verificationLevel status image firstName lastName",
      )
      .lean();

    return {
      id: vehicle._id.toString(),
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      vin: vehicle.vin || null,
      status: vehicle.status,
      price: vehicle.price,
      mileage: vehicle.mileage || null,
      fuel: vehicle.fuel || null,
      transmission: vehicle.transmission || null,
      seats: vehicle.seats || null,
      features: vehicle.features || [],
      condition: vehicle.condition || null,
      availability: vehicle.availability || null,
      delivery: vehicle.delivery || null,
      weeklyDiscount: vehicle.weeklyDiscount || null,
      monthlyDiscount: vehicle.monthlyDiscount || null,
      photos: {
        front: vehicle.photos?.front || null,
        back: vehicle.photos?.back || null,
        side: vehicle.photos?.side || null,
        interior: vehicle.photos?.interior || null,
        gallery: vehicle.photos?.gallery || [],
      },
      documents: {
        ownership: vehicle.documents?.ownership || null,
        insurance: vehicle.documents?.insurance || null,
      },
      adminComment: vehicle.adminComment || null,
      verifiedAt: vehicle.verifiedAt || null,
      createdAt: vehicle.createdAt || null,
      owner: owner
        ? {
            id: owner._id.toString(),
            name: getDisplayName(owner),
            email: owner.email,
            phoneNumber: owner.phoneNumber || null,
            verificationLevel: owner.verificationLevel,
            status: owner.status,
            image: owner.image || null,
          }
        : null,
    };
  }

  /**
   * Approves or rejects a peer-host application.
   */
  async reviewHostApplication(
    caller: RequestUser,
    hostId: string,
    data: AdminP2PDecisionInput,
  ) {
    const userId = hostId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw ApiError.badRequest("Invalid host ID");
    }

    if (userId === caller.id) {
      throw ApiError.badRequest("You cannot review your own application");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.verificationLevel === VerificationLevel.PEER_HOST) {
      throw ApiError.unprocessable(
        "This user is already a peer host. Use a dedicated suspension flow for active hosts.",
      );
    }

    const [verifications, vehicleStats] = await Promise.all([
      Verification.find({ userId: user._id })
        .select("documentType status")
        .lean(),
      Vehicle.aggregate([
        {
          $match: {
            ownerId: user._id,
            ownerType: "User",
          },
        },
        {
          $group: {
            _id: "$ownerId",
            totalVehicles: { $sum: 1 },
            pendingVehicles: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING_APPROVAL"] }, 1, 0] },
            },
            approvedVehicles: {
              $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] },
            },
            rejectedVehicles: {
              $sum: { $cond: [{ $eq: ["$status", "RETIRED"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const verificationSummary = summarizeVerifications(verifications);
    const aggregateVehicleStats = vehicleStats[0] || {
      totalVehicles: 0,
      pendingVehicles: 0,
      approvedVehicles: 0,
      rejectedVehicles: 0,
    };
    const reviewReadiness = buildHostReviewReadiness({
      verificationLevel: user.verificationLevel,
      accountStatus: user.status,
      ...verificationSummary,
      totalVehicleCount: aggregateVehicleStats.totalVehicles,
      pendingVehicleCount: aggregateVehicleStats.pendingVehicles,
      approvedVehicleCount: aggregateVehicleStats.approvedVehicles,
      rejectedVehicleCount: aggregateVehicleStats.rejectedVehicles,
    });

    if (data.status === "approved") {
      if (!reviewReadiness.canPromote) {
        throw ApiError.unprocessable(
          `Host cannot be promoted yet: ${reviewReadiness.blockers.join(" ")}`,
        );
      }

      user.verificationLevel = VerificationLevel.PEER_HOST;
      await user.save();

      const peerHostRole = await Role.findOne({ name: SYSTEM_ROLES.PEERHOST })
        .select("_id")
        .lean();
      if (!peerHostRole) {
        throw ApiError.internal('Role "peerhost" is not available');
      }

      await userPersistenceService.addRoleByMongoId(user._id, peerHostRole._id);
    } else {
      const rejectionUpdate: Record<string, unknown> = {
        status: "RETIRED",
      };
      const trimmedComment = data.adminComment?.trim();
      if (trimmedComment) {
        rejectionUpdate.adminComment = trimmedComment;
      }

      await Vehicle.updateMany(
        { ownerId: user._id, ownerType: "User", status: "PENDING_APPROVAL" },
        {
          $set: rejectionUpdate,
          $unset: { verifiedAt: "", verifiedBy: "" },
        },
      );
    }

    const refreshedUser = await User.findById(userId)
      .populate({ path: "roles", select: "name" })
      .lean();

    if (!refreshedUser) {
      throw ApiError.notFound("User not found after update");
    }

    return {
      user: {
        id: refreshedUser._id.toString(),
        name: getDisplayName(refreshedUser),
        email: refreshedUser.email,
        verificationLevel: refreshedUser.verificationLevel,
        roles: (refreshedUser.roles || []).map((role: any) => role.name),
      },
    };
  }

  /**
   * Approves or rejects a specific vehicle.
   */
  async reviewVehicle(
    caller: RequestUser,
    vehicleId: string,
    data: { status: "APPROVED" | "REJECTED"; adminComment?: string },
  ) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      throw ApiError.badRequest("Invalid vehicle ID");
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    if (vehicle.status !== "PENDING_APPROVAL") {
      throw ApiError.unprocessable("Vehicle has already been reviewed");
    }

    if (vehicle.ownerType === "User") {
      const owner = await User.findById(vehicle.ownerId)
        .select("verificationLevel")
        .lean();

      if (!owner) {
        throw ApiError.notFound("Vehicle owner not found");
      }

      if (owner.verificationLevel !== VerificationLevel.PEER_HOST) {
        throw ApiError.unprocessable(
          "Promote this applicant to peer host before approving vehicle listings.",
        );
      }
    }

    const adminPrimaryKey = await userPersistenceService.resolveUserPrimaryKey(
      caller.id,
    );

    vehicle.status = data.status === "APPROVED" ? "AVAILABLE" : "RETIRED";
    vehicle.adminComment = data.adminComment?.trim() || undefined;
    vehicle.verifiedBy =
      adminPrimaryKey && mongoose.Types.ObjectId.isValid(adminPrimaryKey)
        ? new mongoose.Types.ObjectId(adminPrimaryKey)
        : undefined;
    vehicle.verifiedAt = data.status === "APPROVED" ? new Date() : undefined;
    await vehicle.save();

    return {
      vehicle: {
        id: vehicle._id.toString(),
        status: vehicle.status,
        verifiedAt: vehicle.verifiedAt || null,
        adminComment: vehicle.adminComment || null,
      },
    };
  }
}

export const p2PAdminService = new P2PAdminService();
