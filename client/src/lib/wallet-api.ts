import { buildAuthHeader } from "@/lib/auth-token";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = resolveApiBaseUrl();

export type Wallet = {
  id: string;
  ownerId: string;
  ownerType: "User" | "Company";
  availableBalance: number;
  pendingBalance: number;
  currency: string;
};

export type WalletTransaction = {
  id: string;
  ownerId: string;
  ownerType: "User" | "Company";
  bookingId?: string;
  amount: number;
  currency: string;
  type: "CREDIT_PENDING" | "CREDIT_AVAILABLE" | "DEBIT_PAYOUT" | "REFUND";
  status: "PENDING" | "COMPLETED";
  description?: string;
  createdAt?: string;
};

export async function getMyWallet() {
  const response = await fetch(`${API_BASE_URL}/wallet/me`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load wallet");
  }

  const payload = (await response.json()) as { data?: { wallet?: Wallet } };
  if (!payload.data?.wallet) throw new Error("Wallet response was empty");
  return payload.data.wallet;
}

export async function listMyWalletTransactions() {
  const response = await fetch(`${API_BASE_URL}/wallet/transactions`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load wallet transactions");
  }

  const payload = (await response.json()) as {
    data?: { transactions?: WalletTransaction[] };
  };
  return payload.data?.transactions ?? [];
}

export async function requestPayout(amount: number) {
  const response = await fetch(`${API_BASE_URL}/wallet/payout-request`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(msg || "Failed to request payout");
  }

  const payload = (await response.json()) as { data?: { payoutRequest?: any } };
  return payload.data?.payoutRequest;
}

