import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

/**
 * P2P Host status types.
 */
export type P2PHostStatus = "pending" | "approved" | "rejected" | "flagged";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type VehicleStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "RETIRED" | "PENDING_APPROVAL";
export type VerificationLevel = "NONE" | "ID_VERIFIED" | "LICENSE_VERIFIED" | "PEER_HOST";

/**
 * P2P Host summary for listing.
 */
export type P2PHostSummary = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  verificationLevel: VerificationLevel;
  verificationStatus: VerificationStatus | null;
  hasDriverLicense: boolean;
  hasIdDocument: boolean;
  vehiclesOwned: number;
  vehiclesPendingApproval: number;
  vehiclesApproved: number;
  status: P2PHostStatus;
  submittedAt: string | null;
  lastLogin: string | null;
  reviewReadiness: {
    canPromote: boolean;
    blockerCount: number;
    pendingVerificationCount: number;
    pendingVehicleCount: number;
  };
};

/**
 * P2P Host detail for review.
 */
export type P2PHostDetail = {
  applicationStatus: P2PHostStatus;
  reviewReadiness: {
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
    createdAt: string | null;
    lastLogin: string | null;
  };
  verifications: {
    id: string;
    documentType: string;
    status: string;
    documentFrontUrl: string | null;
    documentBackUrl: string | null;
    adminComment: string | null;
    verifiedAt: string | null;
    createdAt: string | null;
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
    verifiedAt: string | null;
    createdAt: string | null;
  }[];
  metrics: {
    totalVehicles: number;
    pendingVehicles: number;
    approvedVehicles: number;
    rejectedVehicles: number;
    totalVerifications: number;
  };
};

/**
 * P2P Host list filters.
 */
export type P2PHostListFilters = {
  status?: P2PHostStatus | "all";
  search?: string;
  page?: number;
  limit?: number;
};

/**
 * P2P Host list result.
 */
export type P2PHostListResult = {
  hosts: P2PHostSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Host decision request body.
 */
export type HostDecisionBody = {
  status: "approved" | "rejected";
  adminComment?: string;
};

/**
 * Vehicle decision request body.
 */
export type VehicleDecisionBody = {
  status: "APPROVED" | "REJECTED";
  adminComment?: string;
};

export type VerificationDecisionBody = {
  status: "APPROVED" | "REJECTED";
  adminComment?: string;
};

/**
 * Full vehicle detail for admin review.
 */
export type P2PVehicleDetail = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string | null;
  status: string;
  price: number;
  mileage: number | null;
  fuel: string | null;
  transmission: string | null;
  seats: number | null;
  features: string[];
  condition: string | null;
  availability: string | null;
  delivery: string | null;
  weeklyDiscount: number | null;
  monthlyDiscount: number | null;
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
  verifiedAt: string | null;
  createdAt: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    verificationLevel: VerificationLevel;
    status: string;
    image: string | null;
  } | null;
};

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Parses an API error into a user-facing message.
 */
async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;

  return payload?.error?.message || `Request failed (HTTP ${response.status})`;
}

/**
 * Builds the common authenticated fetch init for admin P2P requests.
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
 * Fetches P2P host applicants with filters.
 */
export async function fetchP2PHosts(
  filters: P2PHostListFilters = {},
): Promise<P2PHostListResult> {
  const query = new URLSearchParams();

  if (filters.status) query.set("status", filters.status);
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/admin/p2p${qs ? `?${qs}` : ""}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { hosts?: P2PHostSummary[]; pagination?: any };
  };

  return {
    hosts: payload.data?.hosts || [],
    pagination: {
      page: payload.data?.pagination?.page || filters.page || 1,
      limit: payload.data?.pagination?.limit || filters.limit || 20,
      total: payload.data?.pagination?.total || 0,
      totalPages: payload.data?.pagination?.totalPages || 1,
    },
  };
}

/**
 * Fetches full P2P host detail.
 */
export async function fetchP2PHostDetail(hostId: string): Promise<P2PHostDetail> {
  const response = await fetch(
    `${API_BASE_URL}/admin/p2p/${encodeURIComponent(hostId)}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: P2PHostDetail;
  };

  if (!payload.data) {
    throw new Error("Host not found");
  }

  return payload.data;
}

/**
 * Fetches full vehicle detail for admin review.
 */
export async function fetchP2PVehicleDetail(vehicleId: string): Promise<P2PVehicleDetail> {
  const response = await fetch(
    `${API_BASE_URL}/admin/p2p/vehicles/${encodeURIComponent(vehicleId)}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: P2PVehicleDetail;
  };

  if (!payload.data) {
    throw new Error("Vehicle not found");
  }

  return payload.data;
}

/**
 * Approves or rejects a P2P host application.
 */
export async function reviewP2PHost(
  hostId: string,
  body: HostDecisionBody,
): Promise<{ user: { id: string; name: string; email: string; verificationLevel: string; roles: string[] } }> {
  const response = await fetch(
    `${API_BASE_URL}/admin/p2p/${encodeURIComponent(hostId)}/decision`,
    buildRequestInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { user: { id: string; name: string; email: string; verificationLevel: string; roles: string[] } };
  };

  return payload.data!;
}

/**
 * Approves or rejects a vehicle.
 */
export async function reviewVehicle(
  vehicleId: string,
  body: VehicleDecisionBody,
): Promise<{
  vehicle: {
    id: string;
    status: string;
    verifiedAt: string | null;
    adminComment: string | null;
  };
}> {
  const response = await fetch(
    `${API_BASE_URL}/admin/p2p/vehicles/${encodeURIComponent(vehicleId)}/decision`,
    buildRequestInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: {
      vehicle: {
        id: string;
        status: string;
        verifiedAt: string | null;
        adminComment: string | null;
      };
    };
  };

  return payload.data!;
}

/**
 * Approves or rejects a verification document from the admin P2P flow.
 */
export async function reviewVerification(
  verificationId: string,
  body: VerificationDecisionBody,
): Promise<{
  verification: { id: string; status: string; adminComment: string | null };
}> {
  const response = await fetch(
    `${API_BASE_URL}/verifications/${encodeURIComponent(verificationId)}`,
    buildRequestInit({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: {
      verification: { id: string; status: string; adminComment: string | null };
    };
  };

  if (!payload.data) {
    throw new Error("Verification review response was empty");
  }

  return payload.data;
}
