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
    details?: Array<{ field?: string; message?: string }>;
  };
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | null;
  const details = Array.isArray(payload?.error?.details)
    ? payload?.error?.details
        ?.map((detail) =>
          detail?.field && detail?.message
            ? `${detail.field}: ${detail.message}`
            : detail?.message || detail?.field || "",
        )
        .filter(Boolean)
        .join(" | ")
    : "";

  const message =
    payload?.error?.message || `Request failed (HTTP ${response.status})`;
  return details ? `${message} - ${details}` : message;
}

export type WalletSnapshot = {
  ownerType: "User" | "Company";
  currency: string;
  pendingBalance: number;
  availableBalance: number;
  lifetimeEarned: number;
  lifetimePaidOut: number;
  lifetimeRefunded: number;
};

export type WalletOwnerType = WalletSnapshot["ownerType"];

export type WalletEntry = {
  id?: string;
  _id?: string;
  walletId: string;
  ownerId: string;
  ownerType: "User" | "Company";
  bookingId?: string;
  transactionId?: string;
  payoutId?: string;
  entryType: string;
  currency: string;
  amount: number;
  balanceField: "pendingBalance" | "availableBalance";
  before: number;
  after: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
};

export type PayoutMethod = "BANK_TRANSFER" | "TELEBIRR" | "CHAPA" | "MANUAL";

export type PayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export type CreatePayoutInput = {
  bookingId?: string;
  amount: number;
  payoutMethod?: PayoutMethod;
  metadata?: Record<string, unknown>;
  ownerType?: WalletOwnerType;
};

export type BankItem = {
  id?: string;
  name?: string;
  slug?: string;
  country_id?: number;
  acct_length?: number;
  currency?: string;
};

export type Payout = {
  id?: string;
  _id?: string;
  ownerId: string;
  ownerType: "User" | "Company";
  amount: number;
  currency: string;
  transactionIds: string[];
  status: PayoutStatus;
  payoutMethod?: PayoutMethod;
  gatewayReference?: string | null;
  checkoutUrl?: string | null;
  failureReason?: string | null;
  processedAt?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
};

export type PayoutListFilters = {
  status?: PayoutStatus;
  page?: number;
  limit?: number;
  ownerType?: WalletOwnerType;
};

export type PayoutListResult = {
  payouts: Payout[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export async function fetchMyWallet(input?: { ownerType?: WalletOwnerType }): Promise<WalletSnapshot> {
  const params = new URLSearchParams();
  if (input?.ownerType) params.set("ownerType", input.ownerType);

  const response = await fetch(
    `${API_BASE_URL}/wallet/me${params.toString() ? `?${params.toString()}` : ""}`,
    buildRequestInit(),
  );
  if (!response.ok) throw new Error(await parseApiError(response));

  const payload = (await response.json()) as { data?: WalletSnapshot };
  if (!payload.data) throw new Error("Wallet response was empty.");
  return payload.data;
}

export async function fetchMyWalletLedger(input?: { ownerType?: WalletOwnerType }): Promise<WalletEntry[]> {
  const params = new URLSearchParams();
  if (input?.ownerType) params.set("ownerType", input.ownerType);

  const response = await fetch(
    `${API_BASE_URL}/wallet/me/ledger${params.toString() ? `?${params.toString()}` : ""}`,
    buildRequestInit(),
  );
  if (!response.ok) throw new Error(await parseApiError(response));

  const payload = (await response.json()) as { data?: WalletEntry[] };
  return payload.data || [];
}

export async function createPayoutRequest(input: CreatePayoutInput): Promise<Payout> {
  const response = await fetch(`${API_BASE_URL}/payouts`, {
    method: "POST",
    ...buildRequestInit({
      headers: { "Content-Type": "application/json" },
    }),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseApiError(response));

  const payload = (await response.json()) as { data?: Payout };
  if (!payload.data) throw new Error("Payout response was empty.");
  return payload.data;
}

export async function fetchMyPayouts(
  filters: PayoutListFilters = {},
): Promise<PayoutListResult> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.ownerType) params.set("ownerType", filters.ownerType);

  const response = await fetch(
    `${API_BASE_URL}/payouts/me${params.toString() ? `?${params.toString()}` : ""}`,
    buildRequestInit(),
  );
  if (!response.ok) throw new Error(await parseApiError(response));

  const payload = (await response.json()) as { data?: PayoutListResult };
  if (!payload.data) {
    return {
      payouts: [],
      pagination: { page: filters.page || 1, limit: filters.limit || 20, total: 0, totalPages: 1 },
    };
  }
  return payload.data;
}

export async function fetchBanks(): Promise<BankItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/payouts/banks`,
    buildRequestInit(),
  );
  if (!response.ok) throw new Error(await parseApiError(response));

  const payload = (await response.json()) as { data?: BankItem[] };
  return payload.data || [];
}

