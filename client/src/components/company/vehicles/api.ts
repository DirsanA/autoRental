import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";

type ApiVehicle = {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  plate?: string;
  mileage?: number;
  fuel?: string;
  transmission?: string;
  seats?: number;
  features?: string[];
  condition?: string;
  status?: string;
  price?: number;
  availability?: string;
  delivery?: string;
  createdAt?: string;
  photos?: {
    front?: string;
    gallery?: string[];
  };
};

export type CreateCompanyVehiclePayload = {
  ownerId?: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  plate: string;
  mileage?: number;
  fuel?: "petrol" | "diesel" | "hybrid" | "electric";
  transmission?: "manual" | "automatic" | "cvt";
  seats?: number;
  features: string[];
  price: number;
  status?: "AVAILABLE" | "MAINTENANCE";
  photos: {
    front: string;
    back: string;
    side: string;
    interior: string;
  };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function mapApiStatusToCompanyStatus(
  status?: string,
): CompanyVehicle["status"] {
  const normalized = status?.trim().toUpperCase();

  switch (normalized) {
    case "AVAILABLE":
      return "available";
    case "BOOKED":
    case "RENTED":
      return "booked";
    case "MAINTENANCE":
      return "maintenance";
    case "PENDING":
    case "PENDING_APPROVAL":
      return "pending_approval";
    case "RETIRED":
    case "INACTIVE":
      return "retired";
    default:
      return "maintenance";
  }
}

export function mapApiVehicleToCompanyVehicle(
  vehicle: ApiVehicle,
): CompanyVehicle {
  const createdAt = vehicle.createdAt ? new Date(vehicle.createdAt) : new Date();
  const mainImage =
    vehicle.photos?.front ||
    vehicle.photos?.gallery?.find(Boolean) ||
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

  return {
    id: vehicle.id,
    make: vehicle.make || "Unknown",
    model: vehicle.model || "Vehicle",
    year: vehicle.year || createdAt.getFullYear(),
    vin: vehicle.vin,
    plate: vehicle.plate || "PENDING",
    location: vehicle.delivery || vehicle.availability || "Company fleet",
    status: mapApiStatusToCompanyStatus(vehicle.status),
    pricePerDay: typeof vehicle.price === "number" ? vehicle.price : 0,
    image: mainImage,
    galleryImages: Array.isArray(vehicle.photos?.gallery)
      ? vehicle.photos.gallery.filter(Boolean)
      : [mainImage],
    lastMaintenance: formatDisplayDate(createdAt),
    nextMaintenance: formatDisplayDate(addDays(createdAt, 90)),
    mileage: vehicle.mileage,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    seats: vehicle.seats,
    features: Array.isArray(vehicle.features) ? vehicle.features : [],
    description: vehicle.condition,
    ratingAvg: 0,
    ratingCount: 0,
  };
}

export async function submitCompanyVehicle(
  payload: CreateCompanyVehiclePayload,
): Promise<CompanyVehicle> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...payload,
        ownerType: "Company",
      }),
    });
  } catch {
    throw new Error("Could not reach backend API at http://localhost:5000");
  }

  const result = (await response.json().catch(() => null)) as
    | {
        success?: boolean;
        data?: { vehicle?: ApiVehicle };
        error?: {
          message?: string;
          details?: Array<{ field?: string; message?: string }>;
        };
      }
    | null;

  if (!response.ok || !result?.success) {
    const detail = result?.error?.details?.[0];
    const detailMessage =
      detail && typeof detail.field === "string"
        ? `${detail.field}: ${detail.message}`
        : null;

    throw new Error(
      detailMessage || result?.error?.message || "Failed to submit company vehicle",
    );
  }

  const vehicle = result.data?.vehicle;
  if (!vehicle) {
    throw new Error("Vehicle submitted but no vehicle data was returned.");
  }

  return mapApiVehicleToCompanyVehicle(vehicle);
}
