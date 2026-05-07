import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

export type AdminDashboardData = {
  totals: {
    grossRevenue: number;
    platformCommission: number;
    paidBookings: number;
    totalBookings: number;
    activeBookings: number;
  };
  counts: {
    users: number;
    companies: number;
    vehicles: number;
    pendingCompanies: number;
    pendingVehicles: number;
    pendingVerifications: number;
  };
  bookingStatus: Record<string, number>;
  revenueTrend: {
    weekly: Array<{ day: string; revenue: number; bookings: number }>;
  };
};

const API_BASE_URL = resolveApiBaseUrl();

async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  return payload?.error?.message || `Request failed (HTTP ${response.status})`;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    data?: { dashboard?: AdminDashboardData };
  };

  if (!payload.data?.dashboard) {
    throw new Error("Admin dashboard response was empty.");
  }

  return payload.data.dashboard;
}
