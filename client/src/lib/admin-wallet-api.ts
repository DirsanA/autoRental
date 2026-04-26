import { buildAuthHeader } from "@/lib/auth-token";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = resolveApiBaseUrl();

export type PlatformLedger = {
  currency: string;
  totalCollected: number;
  totalCommission: number;
  totalPaidOut: number;
};

export type PayoutRequest = {
  id: string;
  ownerId: string;
  ownerType: "User" | "Company";
  amount: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  processedAt?: string;
  processedByAuthUserId?: string;
  rejectionReason?: string;
};

export async function getPlatformLedger(currency = "ETB") {
  const params = new URLSearchParams({ currency });
  const response = await fetch(`${API_BASE_URL}/admin/ledger?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) throw new Error("Failed to load platform ledger");
  const payload = (await response.json()) as { data?: { ledger?: PlatformLedger } };
  return payload.data?.ledger;
}

export async function listPayoutRequests(status?: "PENDING" | "APPROVED" | "REJECTED") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);

  const response = await fetch(`${API_BASE_URL}/admin/payout/requests?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) throw new Error("Failed to load payout requests");
  const payload = (await response.json()) as { data?: { payoutRequests?: PayoutRequest[] } };
  return payload.data?.payoutRequests ?? [];
}

export async function approvePayout(payoutRequestId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/payout/approve`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    body: JSON.stringify({ payoutRequestId }),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(msg || "Failed to approve payout");
  }

  const payload = (await response.json()) as { data?: { payoutRequest?: PayoutRequest } };
  return payload.data?.payoutRequest;
}

