import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import { coalesceRequest } from "@/lib/api-coalesce";

type ApiVehicle = {
  id: string;
  ownerType?: string;
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

export type UpdateCompanyVehiclePayload = Partial<{
  make: string;
  model: string;
  year: number;
  vin: string;
  plate: string;
  mileage: number;
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  transmission: "manual" | "automatic" | "cvt";
  seats: number;
  features: string[];
  condition: string;
  price: number;
  availability: string;
  delivery: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "RETIRED" | "PENDING_APPROVAL";
}>;

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
  condition?: string;
  price: number;
  status?: "AVAILABLE" | "MAINTENANCE";
  photos: {
    front: string;
    back: string;
    side: string;
    interior: string;
  };
};

const API_BASE_URL = resolveApiBaseUrl();

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
    galleryImages:
      vehicle.photos?.gallery?.filter(Boolean).length ? (vehicle.photos.gallery.filter(Boolean) as string[]) : [mainImage],
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
        ...buildAuthHeader(),
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



export async function fetchCompanyVehicleById(id: string): Promise<CompanyVehicle | null> {
  return coalesceRequest(`vehicle-${id}`, async () => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          ...buildAuthHeader(),
        },
      });
    } catch {
      throw new Error("Could not reach backend API at http://localhost:5000");
    }

    if (response.status === 404) return null;
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      throw new Error(
        payload?.error?.message ||
          `Failed to load vehicle details (HTTP ${response.status})`,
      );
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { vehicle?: ApiVehicle };
    };
    const vehicle = payload.data?.vehicle;
    return vehicle ? mapApiVehicleToCompanyVehicle(vehicle) : null;
  });
}

export async function fetchCompanyVehicles(): Promise<CompanyVehicle[]> {
  return coalesceRequest("company-fleet", async () => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/vehicles/mine?ownerType=Company`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          ...buildAuthHeader(),
        },
      });
    } catch {
      throw new Error("Could not reach backend API at http://localhost:5000");
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      throw new Error(
        payload?.error?.message ||
          `Failed to load fleet vehicles (HTTP ${response.status})`,
      );
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { vehicles?: ApiVehicle[] };
    };

    const vehicles = payload.data?.vehicles || [];

    return vehicles
      .filter((vehicle) => vehicle.ownerType === "Company")
      .map(mapApiVehicleToCompanyVehicle);
  });
}

export async function updateCompanyVehicleById(
  id: string,
  updates: UpdateCompanyVehiclePayload,
): Promise<CompanyVehicle> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeader(),
      },
      credentials: "include",
      body: JSON.stringify(updates),
    });
  } catch {
    throw new Error("Could not reach backend API at http://localhost:5000");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(
      payload?.error?.message ||
        `Failed to update vehicle (HTTP ${response.status})`,
    );
  }

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { vehicle?: ApiVehicle };
  };
  const vehicle = payload.data?.vehicle;
  if (!vehicle) {
    throw new Error("Vehicle updated but no vehicle data was returned.");
  }
  return mapApiVehicleToCompanyVehicle(vehicle);
}

export async function deleteCompanyVehicleById(id: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    });
  } catch {
    throw new Error("Could not reach backend API at http://localhost:5000");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(
      payload?.error?.message ||
        `Failed to delete vehicle (HTTP ${response.status})`,
    );
  }
}
