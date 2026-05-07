import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";

const API_BASE_URL = resolveApiBaseUrl();

type ApiUserMePayload = {
  data?: {
    user?: {
      id?: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      image?: string;
      verificationLevel?: string;
      status?: string;
    };
  };
  error?: { message?: string };
};

export type RenterDashboardUser = {
  id: string;
  name: string | null;
  image: string | null;
  verificationLevel: string | null;
  status: string | null;
};

export type RenterDashboardBooking = {
  id: string;
  bookingId: string;
  status: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  startTime: string | null;
  endTime: string | null;
  createdAt: string | null;
  pricing: {
    totalAmount: number;
    currency: string;
  };
  payment: {
    status: "PENDING" | "PAID" | "FAILED" | null;
    checkoutUrl: string | null;
    paidAt: string | null;
  };
  vehicle: {
    make: string | null;
    model: string | null;
    year: number | null;
    plate: string | null;
    imageUrl: string | null;
  } | null;
};

export type RenterRecommendedVehicle = {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  imageUrl: string | null;
  ownerName: string | null;
};

export type RenterDashboardSnapshot = {
  user: RenterDashboardUser;
  bookings: RenterDashboardBooking[];
  recommended: RenterRecommendedVehicle[];
};

function safeParseIsoDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function monthRangeLocal(now = new Date()) {
  const start = new Date(now);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const endExclusive = new Date(start);
  endExclusive.setMonth(endExclusive.getMonth() + 1);
  return { start, endExclusive };
}

export function derivePaidThisMonthTotal(bookings: RenterDashboardBooking[], now = new Date()) {
  const { start, endExclusive } = monthRangeLocal(now);
  let total = 0;
  let currency = "ETB";

  for (const b of bookings) {
    const paid = b.payment?.status === "PAID";
    if (!paid) continue;

    // Prefer paidAt when available; fallback to createdAt.
    const t = safeParseIsoDate(b.payment?.paidAt) ?? safeParseIsoDate(b.createdAt);
    if (!t) continue;
    if (t < start || t >= endExclusive) continue;

    total += Number(b.pricing?.totalAmount || 0);
    if (b.pricing?.currency) currency = b.pricing.currency;
  }

  return { total, currency };
}

export function deriveNextRelevantBooking(bookings: RenterDashboardBooking[], now = new Date()) {
  const active = bookings.find((b) => b.status === "ACTIVE");
  if (active) return active;

  const upcoming = bookings
    .map((b) => ({ b, start: safeParseIsoDate(b.startTime) }))
    .filter((row) => row.start && row.start > now)
    .sort((a, c) => (a.start!.getTime() - c.start!.getTime()));
  if (upcoming[0]?.b) return upcoming[0].b;

  return bookings[0] || null; // bookings are usually returned in desc order
}

export async function fetchRenterDashboardSnapshot(): Promise<RenterDashboardSnapshot> {
  const [meRes, bookingsRes, recommendedRes] = await Promise.all([
    fetch(`${API_BASE_URL}/users/me`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    }),
    fetch(`${API_BASE_URL}/bookings?limit=50&page=1`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    }),
    fetch(`${API_BASE_URL}/vehicles/marketplace`, {
      cache: "no-store",
    }).catch(() => null),
  ]);

  if (!meRes.ok) {
    const payload = (await meRes.json().catch(() => null)) as ApiUserMePayload | null;
    throw new Error(payload?.error?.message || `Failed to load profile (HTTP ${meRes.status})`);
  }
  if (!bookingsRes.ok) {
    const payload = (await bookingsRes.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message || `Failed to load bookings (HTTP ${bookingsRes.status})`);
  }

  const mePayload = (await meRes.json()) as ApiUserMePayload;
  const bookingsPayload = (await bookingsRes.json()) as {
    data?: { bookings?: any[] };
  };

  const rawUser = mePayload.data?.user;
  const user: RenterDashboardUser = {
    id: String(rawUser?.id || ""),
    name: (rawUser?.name || [rawUser?.firstName, rawUser?.lastName].filter(Boolean).join(" ") || null) as string | null,
    image: (rawUser?.image as string | undefined) || null,
    verificationLevel: (rawUser?.verificationLevel as string | undefined) || null,
    status: (rawUser?.status as string | undefined) || null,
  };

  const bookings: RenterDashboardBooking[] = Array.isArray(bookingsPayload.data?.bookings)
    ? bookingsPayload.data!.bookings.map((b: any) => ({
        id: String(b.id || b._id || ""),
        bookingId: String(b.bookingId || ""),
        status: String(b.status || "PENDING") as any,
        startTime: b.startTime ?? null,
        endTime: b.endTime ?? null,
        createdAt: b.createdAt ?? null,
        pricing: {
          totalAmount: Number(b.pricing?.totalAmount ?? 0),
          currency: String(b.pricing?.currency || "ETB"),
        },
        payment: {
          status: (b.payment?.status as any) ?? null,
          checkoutUrl: b.payment?.checkoutUrl ?? null,
          paidAt: b.payment?.paidAt ?? null,
        },
        vehicle: b.vehicle
          ? {
              make: b.vehicle.make ?? null,
              model: b.vehicle.model ?? null,
              year: typeof b.vehicle.year === "number" ? b.vehicle.year : null,
              plate: b.vehicle.plate ?? null,
              imageUrl: b.vehicle.imageUrl ?? null,
            }
          : null,
      }))
    : [];

  const recommended: RenterRecommendedVehicle[] = [];
  if (recommendedRes && recommendedRes.ok) {
    const recPayload = (await recommendedRes.json().catch(() => null)) as any;
    const rawVehicles = recPayload?.data?.vehicles;
    if (Array.isArray(rawVehicles)) {
      for (const v of rawVehicles.slice(0, 6)) {
        const id = String(v?.id || v?._id || "");
        if (!id) continue;
        recommended.push({
          id,
          title: [v?.make, v?.model].filter(Boolean).join(" ") || "Vehicle",
          price: typeof v?.price === "number" ? v.price : null,
          currency: "ETB",
          imageUrl: v?.photos?.front || v?.photos?.gallery?.[0] || null,
          ownerName: v?.owner?.name || null,
        });
      }
    }
  }

  return { user, bookings, recommended };
}
