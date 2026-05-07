import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

export type AdminCompanyUiStatus =
  | "active"
  | "pending"
  | "suspended"
  | "rejected";

export type AdminCompanyApiStatus =
  | "ACTIVE"
  | "PENDING_APPROVAL"
  | "SUSPENDED"
  | "REJECTED_TEMPORARY"
  | "REJECTED_PERMANENT";

export type AdminCompanySummary = {
  id: string;
  name: string;
  status: AdminCompanyUiStatus;
  statusValue: AdminCompanyApiStatus;
  isVerified: boolean;
  verifiedAt: string | null;
  tinNumber: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  authAccount: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    idImageUrl: string | null;
    status: string | null;
    accountType: string | null;
  } | null;
};

export type AdminCompanyDetail = AdminCompanySummary & {
  bio: string | null;
  logoUrl: string | null;
  licenseDocumentUrl: string | null;
  walletBalance: number | null;
  rejectionReason: string | null;
  address: string | null;
  authDocuments: {
    verifications: Array<{
      id: string;
      documentType:
        | "NATIONAL_ID"
        | "PASSPORT"
        | "DRIVER_LICENSE"
        | "BUSINESS_LICENSE";
      documentFrontUrl: string;
      documentBackUrl: string | null;
      status: "PENDING" | "APPROVED" | "REJECTED";
      createdAt: string | null;
      updatedAt: string | null;
    }>;
  } | null;
  socialLinks: {
    linkedin: string | null;
    facebook: string | null;
    x: string | null;
  } | null;
  location: {
    type: string | null;
    coordinates: number[];
  } | null;
  pendingChanges: Record<string, any> | null;
  pendingChangesRequestedAt: string | null;
};

export type AdminCompaniesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminCompanyListResult = {
  companies: AdminCompanySummary[];
  pagination: AdminCompaniesPagination;
};

export type AdminCompanyListFilters = {
  search?: string;
  status?: AdminCompanyApiStatus;
  page?: number;
  limit?: number;
};

type ApiCompany = {
  _id?: string;
  id?: string;
  name?: string;
  status?: string;
  isVerified?: boolean;
  verifiedAt?: string | null;
  tinNumber?: string | null;
  website?: string | null;
  bio?: string | null;
  logoUrl?: string | null;
  licenseDocumentUrl?: string | null;
  walletBalance?: number | null;
  rejectionReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  authDocuments?: AdminCompanyDetail["authDocuments"];
  contactInfo?: {
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
  } | null;
  socialLinks?: {
    linkedin?: string | null;
    facebook?: string | null;
    x?: string | null;
  } | null;
  location?: {
    type?: string | null;
    coordinates?: number[] | null;
  } | null;
  authAccount?: {
    _id?: string;
    id?: string;
    name?: string | null;
    email?: string | null;
    status?: string | null;
    accountType?: string | null;
    image?: string | null;
    idImageUrl?: string | null;
  } | null;
  pendingChanges?: Record<string, any> | null;
  pendingChangesRequestedAt?: string | null;
};

type ApiPagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Parses API failures into concise admin-facing messages.
 */
async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;

  return payload?.error?.message || `Request failed (HTTP ${response.status})`;
}

/**
 * Maps company status values into the admin UI status model.
 */
export function mapCompanyStatus(status?: string): AdminCompanyUiStatus {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "SUSPENDED":
      return "suspended";
    case "REJECTED_TEMPORARY":
    case "REJECTED_PERMANENT":
      return "rejected";
    default:
      return "pending";
  }
}

/**
 * Builds authenticated request settings for admin company calls.
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
 * Maps raw company payloads into the shared admin company summary shape.
 */
function mapApiCompanyToSummary(company: ApiCompany): AdminCompanySummary {
  const id = company.id || company._id || "";

  return {
    id,
    name: company.name || "Unnamed company",
    status: mapCompanyStatus(company.status),
    statusValue: ((company.status || "PENDING_APPROVAL").toUpperCase() ||
      "PENDING_APPROVAL") as AdminCompanyApiStatus,
    isVerified: !!company.isVerified,
    verifiedAt: company.verifiedAt || null,
    tinNumber: company.tinNumber || null,
    website: company.website || null,
    contactEmail: company.contactInfo?.email || null,
    contactPhone: company.contactInfo?.phoneNumber || null,
    createdAt: company.createdAt || null,
    updatedAt: company.updatedAt || null,
    authAccount: company.authAccount
      ? {
          id: company.authAccount.id || company.authAccount._id || "",
          name: company.authAccount.name || null,
          email: company.authAccount.email || null,
          image: company.authAccount.image || null,
          idImageUrl: company.authAccount.idImageUrl || null,
          status: company.authAccount.status || null,
          accountType: company.authAccount.accountType || null,
        }
      : null,
  };
}

/**
 * Maps a raw company payload into the richer company detail model.
 */
function mapApiCompanyToDetail(company: ApiCompany): AdminCompanyDetail {
  const summary = mapApiCompanyToSummary(company);

  return {
    ...summary,
    bio: company.bio || null,
    logoUrl: company.logoUrl || null,
    licenseDocumentUrl: company.licenseDocumentUrl || null,
    walletBalance:
      typeof company.walletBalance === "number" ? company.walletBalance : null,
    rejectionReason: company.rejectionReason || null,
    address: company.contactInfo?.address || null,
    authDocuments: company.authDocuments || null,
    socialLinks: company.socialLinks
      ? {
          linkedin: company.socialLinks.linkedin || null,
          facebook: company.socialLinks.facebook || null,
          x: company.socialLinks.x || null,
        }
      : null,
    location: company.location
      ? {
          type: company.location.type || null,
          coordinates: company.location.coordinates || [],
        }
      : null,
    pendingChanges: company.pendingChanges || null,
    pendingChangesRequestedAt: company.pendingChangesRequestedAt || null,
  };
}

/**
 * Fetches the admin company directory with search and pagination.
 */
export async function fetchAdminCompanies(
  filters: AdminCompanyListFilters = {},
): Promise<AdminCompanyListResult> {
  const query = new URLSearchParams();

  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.status) query.set("status", filters.status);
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/companies${qs ? `?${qs}` : ""}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { companies?: ApiCompany[]; pagination?: ApiPagination };
  };

  return {
    companies: (payload.data?.companies || []).map(mapApiCompanyToSummary),
    pagination: {
      page: payload.data?.pagination?.page || filters.page || 1,
      limit: payload.data?.pagination?.limit || filters.limit || 20,
      total: payload.data?.pagination?.total || 0,
      totalPages: payload.data?.pagination?.totalPages || 1,
    },
  };
}

/**
 * Fetches a single company detail payload for the admin detail page.
 */
export async function fetchAdminCompanyDetail(
  companyId: string,
): Promise<AdminCompanyDetail> {
  const response = await fetch(
    `${API_BASE_URL}/companies/${encodeURIComponent(companyId)}/admin`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { company?: ApiCompany };
  };

  if (!payload.data?.company) {
    throw new Error("Company not found");
  }

  return mapApiCompanyToDetail(payload.data.company);
}

/**
 * Approves or reactivates a company through the admin API.
 */
export async function approveAdminCompany(
  companyId: string,
): Promise<AdminCompanySummary> {
  const response = await fetch(
    `${API_BASE_URL}/companies/${encodeURIComponent(companyId)}/approve`,
    buildRequestInit({
      method: "PATCH",
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { company?: ApiCompany };
  };

  if (!payload.data?.company) {
    throw new Error("Company updated but response was empty.");
  }

  return mapApiCompanyToSummary(payload.data.company);
}

/**
 * Suspends a company through the admin API.
 */
export async function suspendAdminCompany(
  companyId: string,
  reason: string,
): Promise<AdminCompanySummary> {
  const response = await fetch(
    `${API_BASE_URL}/companies/${encodeURIComponent(companyId)}/suspend`,
    buildRequestInit({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }),
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { company?: ApiCompany };
  };

  if (!payload.data?.company) {
    throw new Error("Company updated but response was empty.");
  }

  return mapApiCompanyToSummary(payload.data.company);
}

export async function fetchCompanyVehicles(companyId: string) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles?ownerId=${companyId}`,
    buildRequestInit(),
  );
  if (!response.ok) throw new Error(await parseError(response));
  const payload = await response.json();
  return payload.data?.vehicles || [];
}

export async function updateVehicleStatus(vehicleId: string, status: string) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}/status`,
    buildRequestInit({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
  if (!response.ok) throw new Error(await parseError(response));
  const payload = await response.json();
  return payload.data?.vehicle;
}

export async function fetchCompanyReports(companyId: string) {
  const response = await fetch(
    `${API_BASE_URL}/reports/admin?subjectId=${companyId}`,
    buildRequestInit(),
  );
  if (!response.ok) throw new Error(await parseError(response));
  const payload = await response.json();
  return payload.data || [];
}
 
export async function approvePendingCompany(
  companyId: string,
): Promise<AdminCompanyDetail> {
  const response = await fetch(
    `${API_BASE_URL}/companies/${encodeURIComponent(companyId)}/approve-pending`,
    buildRequestInit({
      method: "PATCH",
    }),
  );
 
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
 
  const payload = (await response.json()) as {
    data?: { company?: ApiCompany };
  };
 
  if (!payload.data?.company) {
    throw new Error("Company not found");
  }
 
  return mapApiCompanyToDetail(payload.data.company);
}
 
export async function rejectPendingCompany(
  companyId: string,
  reason: string,
): Promise<AdminCompanyDetail> {
  const response = await fetch(
    `${API_BASE_URL}/companies/${encodeURIComponent(companyId)}/reject-pending`,
    buildRequestInit({
      method: "PATCH",
      body: JSON.stringify({ reason }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );
 
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
 
  const payload = (await response.json()) as {
    data?: { company?: ApiCompany };
  };
 
  if (!payload.data?.company) {
    throw new Error("Company not found");
  }
 
  return mapApiCompanyToDetail(payload.data.company);
}
