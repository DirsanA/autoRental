import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

const API_BASE_URL = resolveApiBaseUrl();

async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  return payload?.error?.message || `Request failed (HTTP ${response.status})`;
}

export type MonthlyExecutiveReport = {
  period: {
    year: number;
    month: number;
    startUtc: string;
    endUtcExclusive: string;
  };
  generatedAt: string;
  overview: {
    grossRevenue: number;
    platformCommission: number;
    paidBookings: number;
    totalBookings: number;
    activeBookings: number;
  };
  users: {
    total: number;
    newThisMonth: number;
    active: number;
    suspended: number;
    peerHosts: number;
    newPeerHostsThisMonth: number;
  };
  companies: {
    total: number;
    newThisMonth: number;
    active: number;
    pendingApproval: number;
    suspended: number;
    verified: number;
    newlyVerifiedThisMonth: number;
  };
  supply: {
    vehiclesTotal: number;
    vehiclesNewThisMonth: number;
    vehiclesAvailable: number;
    vehiclesPendingApproval: number;
    vehiclesSuspended: number;
  };
  trustAndSafety: {
    verificationsSubmittedThisMonth: number;
    verificationsPending: number;
    verificationsApprovedThisMonth: number;
    verificationsRejectedThisMonth: number;
    reportsOpenedThisMonth: number;
    reportsOpenNow: number;
    reportsResolvedThisMonth: number;
  };
};

export async function fetchMonthlyExecutiveReport(year: number, month: number) {
  const response = await fetch(
    `${API_BASE_URL}/admin/reports/monthly?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(String(month))}`,
    {
      cache: "no-store",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    },
  );

  if (!response.ok) throw new Error(await parseError(response));
  const payload = (await response.json()) as { data?: { report?: MonthlyExecutiveReport } };
  if (!payload.data?.report) throw new Error("Monthly report response was empty.");
  return payload.data.report;
}

export function monthlyExecutiveReportCsvUrl(year: number, month: number) {
  return `${API_BASE_URL}/admin/reports/monthly?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(String(month))}&format=csv`;
}

export function monthlyExecutiveReportHtmlUrl(year: number, month: number) {
  return `${API_BASE_URL}/admin/reports/monthly?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(String(month))}&format=html`;
}

export function monthlyExecutiveReportPdfUrl(year: number, month: number) {
  return `${API_BASE_URL}/admin/reports/monthly?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(String(month))}&format=pdf`;
}
