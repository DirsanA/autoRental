import { ENV } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

type ChapaInitializePayload = {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  customization?: {
    title?: string;
    description?: string;
  };
  meta?: Record<string, unknown>;
};

type ChapaApiEnvelope<T> = {
  status?: string;
  message?: string;
  data?: T;
  errors?: unknown;
  error?: unknown;
  detail?: unknown;
};

type ChapaInitializeResponse = {
  checkout_url?: string;
  reference?: string;
  ref_id?: string;
};

type ChapaVerifyResponse = {
  status?: string;
  tx_ref?: string;
  trx_ref?: string;
  amount?: number | string;
  currency?: string;
  reference?: string;
  ref_id?: string;
};

type ChapaTransferPayload = {
  account_name: string;
  account_number: string;
  amount: string;
  currency?: string;
  reference: string;
  bank_code: string;
};

type ChapaTransferResponse = {
  reference?: string;
  status?: string;
};

type ChapaBankItem = {
  id?: string;
  name?: string;
  slug?: string;
  country_id?: number;
  acct_length?: number;
  currency?: string;
};

function ensureChapaConfigured() {
  if (!ENV.CHAPA_SECRET_KEY) {
    throw ApiError.internal("Chapa secret key is missing from server configuration");
  }
}

function describeChapaValue(value: unknown): string {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => describeChapaValue(entry))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if ("message" in record) {
      const nested = describeChapaValue(record.message);
      if (nested) return nested;
    }

    if ("error" in record) {
      const nested = describeChapaValue(record.error);
      if (nested) return nested;
    }

    const parts = Object.entries(record)
      .map(([key, entry]) => {
        const nested = describeChapaValue(entry);
        return nested ? `${key}: ${nested}` : "";
      })
      .filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" | ");
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
}

async function parseChapaResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as ChapaApiEnvelope<T> | null;

  if (!response.ok || payload?.status !== "success") {
    const baseMessage = describeChapaValue(payload?.message);
    const extraMessage = describeChapaValue(
      payload?.errors ??
      payload?.error ??
      payload?.detail ??
      payload?.data,
    );
    const fallbackMessage = `Chapa request failed with HTTP ${response.status}`;
    const messageParts = [baseMessage || fallbackMessage];

    if (extraMessage && extraMessage !== baseMessage) {
      messageParts.push(extraMessage);
    }

    throw ApiError.unprocessable(
      messageParts.join(" - "),
    );
  }

  return payload;
}

export class ChapaService {
  private get headers() {
    ensureChapaConfigured();

    return {
      Authorization: `Bearer ${ENV.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
  }

  private get baseUrl() {
    return ENV.CHAPA_BASE_URL.replace(/\/+$/, "");
  }

  async initializeTransaction(payload: ChapaInitializePayload) {
    const response = await fetch(`${this.baseUrl}/v1/transaction/initialize`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const parsed = await parseChapaResponse<ChapaInitializeResponse>(response);
    const checkoutUrl = parsed.data?.checkout_url;

    if (!checkoutUrl) {
      throw ApiError.internal("Chapa did not return a checkout URL");
    }

    return {
      checkoutUrl,
      referenceId: parsed.data?.reference || parsed.data?.ref_id || null,
      raw: parsed,
    };
  }

  async verifyTransaction(txRef: string) {
    const response = await fetch(
      `${this.baseUrl}/v1/transaction/verify/${encodeURIComponent(txRef)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ENV.CHAPA_SECRET_KEY}`,
        },
      },
    );

    const parsed = await parseChapaResponse<ChapaVerifyResponse>(response);
    return {
      verificationStatus: parsed.data?.status?.toLowerCase() || "unknown",
      txRef: parsed.data?.tx_ref || parsed.data?.trx_ref || txRef,
      amount: parsed.data?.amount,
      currency: parsed.data?.currency,
      referenceId: parsed.data?.reference || parsed.data?.ref_id || null,
      raw: parsed,
    };
  }

  async createTransfer(payload: ChapaTransferPayload) {
    const response = await fetch(`${this.baseUrl}/v1/transfers`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const parsed = await parseChapaResponse<ChapaTransferResponse>(response);

    return {
      reference: parsed.data?.reference || payload.reference,
      status: parsed.data?.status || "pending",
      raw: parsed,
    };
  }

  async getBanks(): Promise<ChapaBankItem[]> {
    ensureChapaConfigured();

    const response = await fetch(`${this.baseUrl}/v1/banks`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ENV.CHAPA_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw ApiError.internal(`Failed to fetch banks from Chapa (HTTP ${response.status})`);
    }

    const payload = (await response.json().catch(() => null)) as
      | { data?: ChapaBankItem[]; message?: string }
      | ChapaBankItem[]
      | null;

    // Chapa may return { data: [...] } or just [...]
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }

    return [];
  }
}

export const chapaService = new ChapaService();
