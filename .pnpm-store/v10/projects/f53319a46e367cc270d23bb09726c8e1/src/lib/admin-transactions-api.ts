import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

const API_BASE_URL = resolveApiBaseUrl();

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

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | null;
  return payload?.error?.message || `Request failed (HTTP ${response.status})`;
}

export type AdminTransactionStatus =
  | "PENDING"
  | "HELD_IN_ESCROW"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type AdminTransactionType =
  | "RENTAL_FEE"
  | "COLLATERAL_DEPOSIT"
  | "REFUND"
  | "PAYOUT"
  | "COMMISSION"
  | "ESCROW_HOLD"
  | "ESCROW_RELEASE"
  | "REFUND_REVERSAL";

export type AdminTransaction = {
  id: string;
  bookingId: string;
  payerId: string;
  receiverId: string | null;
  receiverModel: "User" | "Company" | "System" | null;
  amount: number;
  currency: string;
  type: AdminTransactionType | string | null;
  status: AdminTransactionStatus | string | null;
  paymentGatewayId: string | null;
  invoiceUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
};

export type AdminTransactionListFilters = {
  page?: number;
  limit?: number;
  status?: AdminTransactionStatus;
  type?: AdminTransactionType;
  receiverModel?: "User" | "Company" | "System";
  q?: string;
  from?: string; // ISO datetime
  to?: string; // ISO datetime
};

export type AdminTransactionListResult = {
  transactions: AdminTransaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export async function fetchAdminTransactions(
  filters: AdminTransactionListFilters = {},
): Promise<AdminTransactionListResult> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.receiverModel) params.set("receiverModel", filters.receiverModel);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const response = await fetch(
    `${API_BASE_URL}/transactions/admin${params.toString() ? `?${params.toString()}` : ""}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as { data?: AdminTransactionListResult };
  if (!payload.data) {
    throw new Error("Transactions response was empty.");
  }
  return payload.data;
}

