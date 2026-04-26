import { buildAuthHeader } from "@/lib/auth-token";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

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
  const payload = (await response
    .json()
    .catch(() => null)) as ApiErrorPayload | null;
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
  const composed = details ? `${message} - ${details}` : message;

  console.error(
    "Booking API error",
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

export type RenterBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type RenterBookingPaymentState = "pending" | "paid" | "failed";

export type RenterBookingListItem = {
  id: string;
  bookingId: string;
  status: RenterBookingStatus;
  paymentState: RenterBookingPaymentState;
  startTime: string | null;
  endTime: string | null;
  actualReturnTime: string | null;
  withDriver: boolean;
  contactPhone: string | null;
  pickupAddress: string | null;
  returnAddress: string | null;
  cancelReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  pricing: {
    pricePerHour: number;
    totalHours: number;
    systemCommission: number;
    totalAmount: number;
    currency: string;
  };
  payment: {
    method: "CHAPA" | "CASH" | "BANK_TRANSFER" | "TELEBIRR" | null;
    status: "PENDING" | "PAID" | "FAILED" | null;
    txRef: string | null;
    checkoutUrl: string | null;
    checkoutExpiresAt: string | null;
    referenceId: string | null;
    paidAt: string | null;
    lastVerifiedAt: string | null;
  };
  vehicle: {
    id: string;
    make: string | null;
    model: string | null;
    year: number | null;
    plate: string | null;
    imageUrl: string | null;
    availability: string | null;
    delivery: string | null;
  } | null;
};

export type RenterBookingsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RenterBookingListFilters = {
  search?: string;
  status?: RenterBookingStatus;
  paymentState?: RenterBookingPaymentState;
  page?: number;
  limit?: number;
};

export type RenterBookingListResult = {
  bookings: RenterBookingListItem[];
  pagination: RenterBookingsPagination;
};

export async function initializeChapaCheckout(input: ChapaCheckoutInput) {
  const response = await fetch(`${API_BASE_URL}/bookings/checkout/chapa`, {
    method: "POST",
    ...buildRequestInit({
      headers: {
        "Content-Type": "application/json",
      },
    }),
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

export async function fetchRenterBookings(
  filters: RenterBookingListFilters = {},
): Promise<RenterBookingListResult> {
  const query = new URLSearchParams();

  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.status) query.set("status", filters.status);
  if (filters.paymentState) query.set("paymentState", filters.paymentState);
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));

  const response = await fetch(
    `${API_BASE_URL}/bookings${query.toString() ? `?${query.toString()}` : ""}`,
    buildRequestInit(),
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as {
    data?: {
      bookings?: RenterBookingListItem[];
      pagination?: Partial<RenterBookingsPagination>;
    };
  };

  return {
    bookings: payload.data?.bookings || [],
    pagination: {
      page: payload.data?.pagination?.page || filters.page || 1,
      limit: payload.data?.pagination?.limit || filters.limit || 10,
      total: payload.data?.pagination?.total || 0,
      totalPages: payload.data?.pagination?.totalPages || 1,
    },
  };
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
