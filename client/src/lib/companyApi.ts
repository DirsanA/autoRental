import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";

const API_BASE_URL = resolveApiBaseUrl();

function dataUrlToBlob(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const mimeMatch = meta?.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

export const createCompany = async (data: any) => {
  const formData = new FormData();
  const normalizedPhone = String(data.phone || "").trim();
  const normalizedEmail = String(data.email || "").trim().toLowerCase();
  const normalizedAddress = String(data.address || "").trim();

  formData.append("name", data.companyName || "");
  formData.append("tinNumber", data.tin || "");

  // Send both flat and bracketed keys so Express/multer can read them reliably.
  formData.append("email", normalizedEmail);
  formData.append("phone", normalizedPhone);
  formData.append("phoneNumber", normalizedPhone);
  formData.append("address", normalizedAddress);
  formData.append("contactInfo[email]", normalizedEmail);
  formData.append("contactInfo[phoneNumber]", normalizedPhone);
  formData.append("contactInfo[address]", normalizedAddress);

  if (data.website) {
    formData.append("website", String(data.website).trim());
  }

  formData.append(
    "fullAddress",
    `${data.address || ""}, ${data.city || ""}, ${data.region || ""}, Ethiopia`,
  );

  if (data.licenseFile?.dataUrl) {
    const blob = dataUrlToBlob(data.licenseFile.dataUrl);
    formData.append(
      "licenseDocument",
      blob,
      data.licenseFile.name || "license-document",
    );
  }

  const res = await fetch(`${API_BASE_URL}/companies`, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error?.message || "Failed to create company");
  }

  return res.json();
};

export type CompanyDashboardData = {
  totalFleet: number;
  fleetStatus: {
    available: number;
    booked: number;
    maintenance: number;
    retired: number;
    pendingApproval: number;
  };
  activeBookings: number;
  completedBookings: number;
  earnings: number;
  revenueTrend: {
    weekly: Array<{ day: string; revenue: number; bookings: number }>;
    monthly: Array<{ period: string; revenue: number; bookings: number }>;
  };
};

export const fetchCompanyDashboard = async (): Promise<CompanyDashboardData> => {
  const res = await fetch(`${API_BASE_URL}/companies/me/dashboard`, {
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error?.message || "Failed to load company dashboard");
  }

  const payload = await res.json();
  return payload.data.dashboard;
};

export type CompanyReview = {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  comment: string;
  date: string;
  vehicle: string;
  targetType: "Vehicle" | "Company";
};

export type CompanyReviewsResponse = {
  reviews: CompanyReview[];
  stats: {
    avg: number;
    count: number;
    breakdown: Record<number, number>;
  };
};

export const fetchCompanyReviews = async (): Promise<CompanyReviewsResponse> => {
  const res = await fetch(`${API_BASE_URL}/companies/me/reviews`, {
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error?.message || "Failed to load company reviews");
  }

  const payload = await res.json();
  return payload.data;
};
