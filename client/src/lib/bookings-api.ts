import { buildAuthHeader } from "@/lib/auth-token";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = resolveApiBaseUrl();

type ApiErrorPayload = {
  error?: {
    message?: string;
    details?: Array<{ field?: string; message?: string }>;
  };
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
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

  const message = payload?.error?.message || `Request failed (HTTP ${response.status})`;
  const composed = details ? `${message} - ${details}` : message;

  console.error(
    "Booking checkout error",
    JSON.stringify(
      {
        status: response.status,
        payload,
      },
      null,
      2,
    ),
  );

  return composed;
}

export type ChapaCheckoutInput = {
  vehicleId: string;
  startTime: string;
  endTime: string;
  withDriver: boolean;
  pickupAddress?: string;
  returnAddress?: string;
  contactPhone?: string;
};

export type BookingPaymentStatus = {
  booking: {
    id: string;
    bookingId: string;
    status: string;
    paymentState: "pending" | "paid" | "failed";
    startTime: string;
    endTime: string;
    pricing: {
      totalAmount: number;
      systemCommission: number;
      totalHours: number;
      currency: string;
    };
    payment: {
      status: string;
      txRef: string | null;
      paidAt: string | null;
      checkoutExpiresAt: string | null;
      lastVerifiedAt: string | null;
    };
  };
  verificationStatus: string;
};

export async function initializeChapaCheckout(input: ChapaCheckoutInput) {
  const response = await fetch(`${API_BASE_URL}/bookings/checkout/chapa`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as {
    data?: {
      booking?: {
        id: string;
        bookingId: string;
      };
      payment?: {
        checkoutUrl?: string;
        txRef?: string;
      };
    };
  };

  const checkoutUrl = payload.data?.payment?.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("Chapa checkout URL was missing from the response.");
  }

  return payload.data;
}

export async function verifyChapaBookingPayment(input: {
  bookingId?: string | null;
  txRef?: string | null;
}) {
  const params = new URLSearchParams();

  if (input.bookingId) params.set("bookingId", input.bookingId);
  if (input.txRef) params.set("tx_ref", input.txRef);

  const response = await fetch(
    `${API_BASE_URL}/bookings/payments/chapa/verify?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as {
    data?: BookingPaymentStatus;
  };

  if (!payload.data) {
    throw new Error("Payment verification response was empty.");
  }

  return payload.data;
}
