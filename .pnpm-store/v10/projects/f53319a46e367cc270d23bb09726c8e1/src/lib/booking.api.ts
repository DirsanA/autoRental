import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import { coalesceRequest } from "@/lib/api-coalesce";

const API_BASE_URL = resolveApiBaseUrl();

/* =========================
   TYPES (Frontend UI Shape)
========================= */
export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export type CompanyBooking = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  vehicleName: string;
  bookingId: string;
  startDate: string;
  endDate: string;
  createdAt: string;

  pickupLocation: string;
  totalAmount: number;

  status: BookingStatus;

  review?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
};

/* =========================
   MAP BACKEND → FRONTEND
========================= */
export const normalizeStatus = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "approved";
    case "PENDING":
      return "pending";
    case "REJECTED":
      return "rejected";
    case "COMPLETED":
      return "completed";
    default:
      return "pending";
  }
};

/* =========================
   FETCH COMPANY BOOKINGS
   (MAIN API FOR YOUR UI)
========================= */
export async function fetchCompanyBookings(options?: {
  cacheKey?: string;
}): Promise<CompanyBooking[]> {
  return coalesceRequest(options?.cacheKey || "company-bookings", async () => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: "GET",
      credentials: "include",
      headers: buildAuthHeader(),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      throw new Error(err?.error?.message || "Failed to load bookings");
    }

    const json = (await res.json()) as {
      data?: {
        bookings?: Array<{
          id?: string;
          bookingId?: string;
          startTime?: string;
          endTime?: string;
          createdAt?: string;
          pickupAddress?: string | null;
          status?: string;
          pricing?: { totalAmount?: number };
          renter?: {
            name?: string | null;
            phone?: string | null;
            email?: string | null;
          } | null;
          vehicle?: {
            make?: string | null;
            model?: string | null;
          } | null;
        }>;
      };
    };

    const bookings = json.data?.bookings || [];

    return bookings.map((booking) => ({
      id: booking.id || "",
      customerName: booking.renter?.name || "Unknown Customer",
      customerPhone: booking.renter?.phone || null,
      customerEmail: booking.renter?.email || null,
      vehicleName: booking.vehicle
        ? [booking.vehicle.make, booking.vehicle.model].filter(Boolean).join(" ")
        : "Unknown Vehicle",
      bookingId: booking.bookingId || "",
      startDate: booking.startTime || "",
      endDate: booking.endTime || "",
      createdAt: booking.createdAt || "",
      pickupLocation: booking.pickupAddress || "Not provided",
      totalAmount: booking.pricing?.totalAmount || 0,
      status: normalizeStatus(booking.status || "PENDING"),
    }));
  });
}
/* =========================
   APPROVE BOOKING (ADMIN/COMPANY)
========================= */
export async function approveBooking(bookingId: string) {
  const res = await fetch(
    `${API_BASE_URL}/bookings/${bookingId}/approve`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to approve booking");
  }

  return true;
}

/* =========================
   REJECT BOOKING
========================= */
export async function rejectBooking(
  bookingId: string,
  reason?: string,
) {
  const res = await fetch(
    `${API_BASE_URL}/bookings/${bookingId}/cancel-refund`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to reject booking");
  }

  return true;
}

/* =========================
   COMPLETE BOOKING (ADMIN)
========================= */
export async function completeBooking(bookingId: string) {
  const res = await fetch(
    `${API_BASE_URL}/bookings/${bookingId}/complete`,
    {
      method: "PATCH",
      credentials: "include",
      headers: buildAuthHeader(),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to complete booking");
  }

  return true;
}
