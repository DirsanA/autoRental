import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

export type AdminUserUiStatus = "active" | "inactive" | "invited" | "suspended";
export type AdminUserApiStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
export type AdminUserAccountType = "USER" | "COMPANY" | "ADMIN";
export type AdminUserDirectoryScope = "ALL" | "PEOPLE";

export type AdminUserSummary = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: AdminUserUiStatus;
  joined: string;
  accountType: AdminUserAccountType | null;
};

export type AdminUserDetail = AdminUserSummary & {
  firstName: string | null;
  lastName: string | null;
  lastLogin: string | null;
  accountType: AdminUserAccountType | null;
  emailVerified: boolean;
  verificationLevel: string | null;
  image: string | null;
  phoneNumber: string | null;
  walletBalance: number | null;
  idNumber: string | null;
  idImageUrl: string | null;
  address: string | null;
  roles: string[];
  createdAt: string | null;
  updatedAt: string | null;
  company: AdminUserCompanySummary | null;
  metrics: AdminUserMetrics;
  verifications: AdminUserVerificationRecord[];
  ownedVehicles: AdminUserOwnedVehicle[];
  recentBookings: AdminUserRecentBooking[];
  recentReviews: AdminUserRecentReview[];
  recentDisputes: AdminUserRecentDispute[];
  recentTransactions: AdminUserRecentTransaction[];
};

export type AdminUserCompanySummary = {
  id: string;
  name: string;
  status: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  tinNumber: string | null;
  createdAt: string | null;
};

export type AdminUserMetrics = {
  bookingsAsRenter: number;
  activeBookingsAsRenter: number;
  bookingsOnOwnedVehicles: number;
  vehiclesOwned: number;
  verificationRequests: number;
  reviewsWritten: number;
  reviewsReceived: number;
  disputesRaised: number;
  disputesAgainst: number;
  totalPaid: number;
  totalReceived: number;
};

export type AdminUserVerificationRecord = {
  id: string;
  documentType: string | null;
  status: string | null;
  reviewTargetLevel: string | null;
  documentNumber: string | null;
  dateOfBirth: string | null;
  documentExpiry: string | null;
  submittedAddress: string | null;
  adminComment: string | null;
  verifiedAt: string | null;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
  createdAt: string | null;
};

export type AdminUserOwnedVehicle = {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  plate: string | null;
  mileage: number | null;
  fuel: string | null;
  transmission: string | null;
  seats: number | null;
  features: string[];
  condition: string | null;
  price: number | null;
  availability: string | null;
  delivery: string | null;
  status: string | null;
  verifiedAt: string | null;
  createdAt: string | null;
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
};

export type AdminUserRecentBooking = {
  id: string;
  bookingId: string | null;
  status: string | null;
  relation: "RENTER" | "HOST";
  vehicleId: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string | null;
};

export type AdminUserRecentReview = {
  id: string;
  targetType: string | null;
  relation: "AUTHORED" | "RECEIVED";
  rating: number | null;
  comment: string | null;
  createdAt: string | null;
};

export type AdminUserRecentDispute = {
  id: string;
  subjectModel: string | null;
  issueCategory: string | null;
  status: string | null;
  relation: "RAISED" | "RESPONDENT";
  createdAt: string | null;
};

export type AdminUserRecentTransaction = {
  id: string;
  type: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  direction: "OUTGOING" | "INCOMING";
  receiverModel: string | null;
  createdAt: string | null;
};

export type AdminUsersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminUserListResult = {
  users: AdminUserSummary[];
  pagination: AdminUsersPagination;
};

export type AdminUserListFilters = {
  search?: string;
  status?: AdminUserApiStatus;
  accountType?: AdminUserAccountType;
  scope?: AdminUserDirectoryScope;
  page?: number;
  limit?: number;
};

type ApiUser = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  joined?: string;
  firstName?: string;
  lastName?: string;
  lastLogin?: string | null;
  accountType?: string;
  emailVerified?: boolean;
  verificationLevel?: string;
  image?: string;
  phoneNumber?: string;
  walletBalance?: number;
  idNumber?: string;
  idImageUrl?: string;
  address?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type ApiCompany = {
  id: string;
  name?: string;
  status?: string;
  isVerified?: boolean;
  verifiedAt?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  tinNumber?: string | null;
  createdAt?: string | null;
};

type ApiMetrics = Partial<AdminUserMetrics>;

type ApiVerificationRecord = {
  id: string;
  documentType?: string;
  status?: string;
  reviewTargetLevel?: string | null;
  documentNumber?: string | null;
  dateOfBirth?: string | null;
  documentExpiry?: string | null;
  submittedAddress?: string | null;
  adminComment?: string | null;
  verifiedAt?: string | null;
  documentFrontUrl?: string | null;
  documentBackUrl?: string | null;
  createdAt?: string | null;
};

type ApiOwnedVehicle = {
  id: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  vin?: string | null;
  plate?: string | null;
  mileage?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  seats?: number | null;
  features?: string[];
  condition?: string | null;
  price?: number | null;
  availability?: string | null;
  delivery?: string | null;
  status?: string | null;
  verifiedAt?: string | null;
  createdAt?: string | null;
  photos?: {
    front?: string | null;
    back?: string | null;
    side?: string | null;
    interior?: string | null;
    gallery?: string[];
  };
  documents?: {
    ownership?: string | null;
    insurance?: string | null;
  };
};

type ApiRecentBooking = {
  id: string;
  bookingId?: string;
  status?: string;
  relation?: "RENTER" | "HOST";
  vehicleId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  createdAt?: string | null;
};

type ApiRecentReview = {
  id: string;
  targetType?: string;
  relation?: "AUTHORED" | "RECEIVED";
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | null;
};

type ApiRecentDispute = {
  id: string;
  subjectModel?: string;
  issueCategory?: string;
  status?: string;
  relation?: "RAISED" | "RESPONDENT";
  createdAt?: string | null;
};

type ApiRecentTransaction = {
  id: string;
  type?: string;
  status?: string;
  amount?: number | null;
  currency?: string | null;
  direction?: "OUTGOING" | "INCOMING";
  receiverModel?: string | null;
  createdAt?: string | null;
};

type ApiPagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Parses an API error into a user-facing message.
 */
async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;

  return payload?.error?.message || `Request failed (HTTP ${response.status})`;
}

/**
 * Maps an API status string into the UI status model.
 */
export function mapApiStatus(status?: string): AdminUserUiStatus {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "active") return "active";
  if (normalized === "suspended") return "suspended";
  if (normalized === "invited") return "invited";
  return "inactive";
}

/**
 * Maps a UI status into the closest supported API status.
 */
export function mapUiStatusToApi(
  status: AdminUserUiStatus,
): AdminUserApiStatus {
  if (status === "active") return "ACTIVE";
  if (status === "suspended") return "SUSPENDED";
  return "PENDING";
}

/**
 * Derives a username when the API omits one.
 */
function deriveUsername(email?: string, name?: string) {
  const safeEmail = (email || "").trim();
  if (safeEmail.includes("@")) return safeEmail.split("@")[0];

  const safeName = (name || "").trim().toLowerCase();
  if (!safeName) return "user";

  return safeName.replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");
}

/**
 * Maps raw API data into the shared admin user summary shape.
 */
function mapApiUserToSummary(user: ApiUser): AdminUserSummary {
  const email = user.email || "";

  return {
    id: user.id,
    name: user.name || email || "Unknown",
    username: user.username || deriveUsername(user.email, user.name),
    email,
    role: user.role || user.roles?.[0] || "User",
    status: mapApiStatus(user.status),
    joined: user.joined || user.createdAt || "",
    accountType:
      user.accountType === "USER" ||
      user.accountType === "COMPANY" ||
      user.accountType === "ADMIN"
        ? user.accountType
        : null,
  };
}

/**
 * Maps raw API data into the shared admin user detail shape.
 */
function mapApiUserToDetail(user: ApiUser): AdminUserDetail {
  const summary = mapApiUserToSummary(user);

  return {
    ...summary,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    lastLogin: user.lastLogin || null,
    emailVerified: !!user.emailVerified,
    verificationLevel: user.verificationLevel || null,
    image: user.image || null,
    phoneNumber: user.phoneNumber || null,
    walletBalance:
      typeof user.walletBalance === "number" ? user.walletBalance : null,
    idNumber: user.idNumber || null,
    idImageUrl: user.idImageUrl || null,
    address: user.address || null,
    roles: user.roles || [],
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    company: null,
    metrics: createEmptyMetrics(),
    verifications: [],
    ownedVehicles: [],
    recentBookings: [],
    recentReviews: [],
    recentDisputes: [],
    recentTransactions: [],
  };
}

/**
 * Builds the empty metrics state used when the API omits aggregates.
 */
function createEmptyMetrics(): AdminUserMetrics {
  return {
    bookingsAsRenter: 0,
    activeBookingsAsRenter: 0,
    bookingsOnOwnedVehicles: 0,
    vehiclesOwned: 0,
    verificationRequests: 0,
    reviewsWritten: 0,
    reviewsReceived: 0,
    disputesRaised: 0,
    disputesAgainst: 0,
    totalPaid: 0,
    totalReceived: 0,
  };
}

/**
 * Maps an optional company payload into the admin detail shape.
 */
function mapApiCompany(
  company?: ApiCompany | null,
): AdminUserCompanySummary | null {
  if (!company) {
    return null;
  }

  return {
    id: company.id,
    name: company.name || "Unnamed company",
    status: company.status || null,
    isVerified: !!company.isVerified,
    verifiedAt: company.verifiedAt || null,
    contactEmail: company.contactEmail || null,
    contactPhone: company.contactPhone || null,
    website: company.website || null,
    tinNumber: company.tinNumber || null,
    createdAt: company.createdAt || null,
  };
}

/**
 * Maps aggregate metrics into a stable frontend-friendly shape.
 */
function mapApiMetrics(metrics?: ApiMetrics | null): AdminUserMetrics {
  const fallback = createEmptyMetrics();

  return {
    bookingsAsRenter: metrics?.bookingsAsRenter ?? fallback.bookingsAsRenter,
    activeBookingsAsRenter:
      metrics?.activeBookingsAsRenter ?? fallback.activeBookingsAsRenter,
    bookingsOnOwnedVehicles:
      metrics?.bookingsOnOwnedVehicles ?? fallback.bookingsOnOwnedVehicles,
    vehiclesOwned: metrics?.vehiclesOwned ?? fallback.vehiclesOwned,
    verificationRequests:
      metrics?.verificationRequests ?? fallback.verificationRequests,
    reviewsWritten: metrics?.reviewsWritten ?? fallback.reviewsWritten,
    reviewsReceived: metrics?.reviewsReceived ?? fallback.reviewsReceived,
    disputesRaised: metrics?.disputesRaised ?? fallback.disputesRaised,
    disputesAgainst: metrics?.disputesAgainst ?? fallback.disputesAgainst,
    totalPaid: metrics?.totalPaid ?? fallback.totalPaid,
    totalReceived: metrics?.totalReceived ?? fallback.totalReceived,
  };
}

/**
 * Maps the full admin detail response into the client detail model.
 */
function mapApiUserDetailResponse(payload: {
  user?: ApiUser;
  company?: ApiCompany | null;
  metrics?: ApiMetrics | null;
  verifications?: ApiVerificationRecord[];
  ownedVehicles?: ApiOwnedVehicle[];
  recentBookings?: ApiRecentBooking[];
  recentReviews?: ApiRecentReview[];
  recentDisputes?: ApiRecentDispute[];
  recentTransactions?: ApiRecentTransaction[];
}): AdminUserDetail {
  if (!payload.user) {
    throw new Error("User not found");
  }

  const detail = mapApiUserToDetail(payload.user);

  return {
    ...detail,
    company: mapApiCompany(payload.company),
    metrics: mapApiMetrics(payload.metrics),
    verifications: (payload.verifications || []).map((verification) => ({
      id: verification.id,
      documentType: verification.documentType || null,
      status: verification.status || null,
      reviewTargetLevel: verification.reviewTargetLevel || null,
      documentNumber: verification.documentNumber || null,
      dateOfBirth: verification.dateOfBirth || null,
      documentExpiry: verification.documentExpiry || null,
      submittedAddress: verification.submittedAddress || null,
      adminComment: verification.adminComment || null,
      verifiedAt: verification.verifiedAt || null,
      documentFrontUrl: verification.documentFrontUrl || null,
      documentBackUrl: verification.documentBackUrl || null,
      createdAt: verification.createdAt || null,
    })),
    ownedVehicles: (payload.ownedVehicles || []).map((vehicle) => ({
      id: vehicle.id,
      make: vehicle.make || null,
      model: vehicle.model || null,
      year: typeof vehicle.year === "number" ? vehicle.year : null,
      vin: vehicle.vin || null,
      plate: vehicle.plate || null,
      mileage: typeof vehicle.mileage === "number" ? vehicle.mileage : null,
      fuel: vehicle.fuel || null,
      transmission: vehicle.transmission || null,
      seats: typeof vehicle.seats === "number" ? vehicle.seats : null,
      features: Array.isArray(vehicle.features) ? vehicle.features : [],
      condition: vehicle.condition || null,
      price: typeof vehicle.price === "number" ? vehicle.price : null,
      availability: vehicle.availability || null,
      delivery: vehicle.delivery || null,
      status: vehicle.status || null,
      verifiedAt: vehicle.verifiedAt || null,
      createdAt: vehicle.createdAt || null,
      photos: {
        front: vehicle.photos?.front || null,
        back: vehicle.photos?.back || null,
        side: vehicle.photos?.side || null,
        interior: vehicle.photos?.interior || null,
        gallery: Array.isArray(vehicle.photos?.gallery)
          ? vehicle.photos.gallery.filter(Boolean)
          : [],
      },
      documents: {
        ownership: vehicle.documents?.ownership || null,
        insurance: vehicle.documents?.insurance || null,
      },
    })),
    recentBookings: (payload.recentBookings || []).map((booking) => ({
      id: booking.id,
      bookingId: booking.bookingId || null,
      status: booking.status || null,
      relation: booking.relation || "RENTER",
      vehicleId: booking.vehicleId || null,
      startTime: booking.startTime || null,
      endTime: booking.endTime || null,
      createdAt: booking.createdAt || null,
    })),
    recentReviews: (payload.recentReviews || []).map((review) => ({
      id: review.id,
      targetType: review.targetType || null,
      relation: review.relation || "AUTHORED",
      rating: typeof review.rating === "number" ? review.rating : null,
      comment: review.comment || null,
      createdAt: review.createdAt || null,
    })),
    recentDisputes: (payload.recentDisputes || []).map((dispute) => ({
      id: dispute.id,
      subjectModel: dispute.subjectModel || null,
      issueCategory: dispute.issueCategory || null,
      status: dispute.status || null,
      relation: dispute.relation || "RAISED",
      createdAt: dispute.createdAt || null,
    })),
    recentTransactions: (payload.recentTransactions || []).map(
      (transaction) => ({
        id: transaction.id,
        type: transaction.type || null,
        status: transaction.status || null,
        amount:
          typeof transaction.amount === "number" ? transaction.amount : null,
        currency: transaction.currency || null,
        direction: transaction.direction || "OUTGOING",
        receiverModel: transaction.receiverModel || null,
        createdAt: transaction.createdAt || null,
      }),
    ),
  };
}

/**
 * Builds the common authenticated fetch init for admin user requests.
 */
function buildRequestInit(init?: RequestInit): RequestInit {
  return {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      ...buildAuthHeader(),
      ...(init?.headers || {}),
    },
  };
}

/**
 * Fetches the admin user list with server-side filters and pagination.
 */
export async function fetchAdminUsers(
  filters: AdminUserListFilters = {},
): Promise<AdminUserListResult> {
  const query = new URLSearchParams();

  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.status) query.set("status", filters.status);
  if (filters.accountType) query.set("accountType", filters.accountType);
  if (filters.scope) query.set("scope", filters.scope);
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/users${qs ? `?${qs}` : ""}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { users?: ApiUser[]; pagination?: ApiPagination };
  };

  return {
    users: (payload.data?.users || []).map(mapApiUserToSummary),
    pagination: {
      page: payload.data?.pagination?.page || filters.page || 1,
      limit: payload.data?.pagination?.limit || filters.limit || 20,
      total: payload.data?.pagination?.total || 0,
      totalPages: payload.data?.pagination?.totalPages || 1,
    },
  };
}

/**
 * Fetches the full admin user detail payload.
 */
export async function fetchAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail> {
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: {
      user?: ApiUser;
      company?: ApiCompany | null;
      metrics?: ApiMetrics | null;
      verifications?: ApiVerificationRecord[];
      ownedVehicles?: ApiOwnedVehicle[];
      recentBookings?: ApiRecentBooking[];
      recentReviews?: ApiRecentReview[];
      recentDisputes?: ApiRecentDispute[];
      recentTransactions?: ApiRecentTransaction[];
    };
  };

  return mapApiUserDetailResponse(payload.data || {});
}

/**
 * Updates a user's status through the admin API.
 */
export async function updateAdminUserStatus(
  userId: string,
  status: AdminUserApiStatus,
): Promise<AdminUserSummary> {
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/status`,
    buildRequestInit({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { user?: ApiUser };
  };

  if (!payload.data?.user) {
    throw new Error("User updated but response was empty.");
  }

  return mapApiUserToSummary(payload.data.user);
}

/**
 * Deletes a user through the admin API.
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}`,
    buildRequestInit({
      method: "DELETE",
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

/**
 * Updates a verification record through the admin API.
 */
export async function updateAdminUserVerification(
  userId: string,
  verificationId: string,
  status: "APPROVED" | "REJECTED",
  adminComment?: string,
): Promise<AdminUserVerificationRecord> {
  const response = await fetch(
    `${API_BASE_URL}/verifications/${encodeURIComponent(verificationId)}`,
    buildRequestInit({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        adminComment: adminComment || undefined,
      }),
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { verification?: ApiVerificationRecord };
  };

  if (!payload.data?.verification) {
    throw new Error("Verification updated but response was empty.");
  }

  const verification = payload.data.verification;
  return {
    id: verification.id,
    documentType: verification.documentType || null,
    status: verification.status || null,
    reviewTargetLevel: verification.reviewTargetLevel || null,
    documentNumber: verification.documentNumber || null,
    dateOfBirth: verification.dateOfBirth || null,
    documentExpiry: verification.documentExpiry || null,
    submittedAddress: verification.submittedAddress || null,
    adminComment: verification.adminComment || null,
    verifiedAt: verification.verifiedAt || null,
    documentFrontUrl: verification.documentFrontUrl || null,
    documentBackUrl: verification.documentBackUrl || null,
    createdAt: verification.createdAt || null,
  };
}

/**
 * Updates a user's verification level through the admin API.
 */
export async function updateAdminUserVerificationLevel(
  userId: string,
  verificationLevel: "ID_VERIFIED" | "LICENSE_VERIFIED" | "PEER_HOST",
): Promise<AdminUserDetail> {
  // For now, only PEER_HOST is supported by the server schema
  // TODO: Update server schema to support ID_VERIFIED and LICENSE_VERIFIED
  const supportedLevel =
    verificationLevel === "PEER_HOST" ? verificationLevel : "PEER_HOST";

  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/verification-level`,
    buildRequestInit({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        verificationLevel: supportedLevel,
      }),
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: {
      user?: ApiUser;
      company?: ApiCompany | null;
      metrics?: ApiMetrics | null;
      verifications?: ApiVerificationRecord[];
      ownedVehicles?: ApiOwnedVehicle[];
      recentBookings?: ApiRecentBooking[];
      recentReviews?: ApiRecentReview[];
      recentDisputes?: ApiRecentDispute[];
      recentTransactions?: ApiRecentTransaction[];
    };
  };

  if (!payload.data) {
    throw new Error("Verification level updated but response was empty.");
  }

  return mapApiUserDetailResponse(payload.data);
}
