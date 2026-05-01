import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";

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
export async function fetchCompanyBookings(): Promise<CompanyBooking[]> {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: "GET",
    credentials: "include",
    headers: buildAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to load bookings");
  }

  const json = await res.json();

  const bookings = json.data?.bookings || [];

  return bookings.map((b: any) => ({
    id: b.id,
    customerName: b.renter.name || "Unknown Customer",
    vehicleName: b.vehicle
      ? `${b.vehicle.make} ${b.vehicle.model}`
      : "Unknown Vehicle",
    bookingId: b.bookingId,
    startDate: b.startTime,
    endDate: b.endTime,
    createdAt: b.createdAt,

    pickupLocation: b.pickupAddress || "Not provided",
    totalAmount: b.pricing?.totalAmount || 0,

    status: normalizeStatus(b.status),
  }));
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