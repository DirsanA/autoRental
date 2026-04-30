import type {
  Vehicle,
  VehicleAvailabilityBlock,
  VehicleFilterStatus,
  VehicleStatus,
} from "./types";
import { buildAuthHeader } from "@/lib/auth-token";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

type ApiVehicle = {
  id: string;
  ownerType?: "User" | "Company";
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
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
  photos?: {
    front?: string;
    gallery?: string[];
  };
};

function mapStatus(status?: string): VehicleStatus {
  const normalized = status?.trim().toUpperCase();

  switch (normalized) {
    case "AVAILABLE":
      return "available";
    case "BOOKED":
    case "RENTED":
      return "rented";
    case "MAINTENANCE":
      return "maintenance";
    case "PENDING_APPROVAL":
    case "PENDING":
      return "pending_approval";
    case "RETIRED":
    case "INACTIVE":
      return "retired";
    default:
      return "maintenance";
  }
}

function mapApiVehicleToCard(vehicle: ApiVehicle): Vehicle {
  const mappedStatus = mapStatus(vehicle.status);
  const imageFromGallery = Array.isArray(vehicle.photos?.gallery)
    ? vehicle.photos?.gallery[0]
    : undefined;
  const galleryImages = Array.isArray(vehicle.photos?.gallery)
    ? vehicle.photos?.gallery.filter(Boolean)
    : [];

  return {
    id: vehicle.id,
    ownerType: vehicle.ownerType,
    make: vehicle.make || "Unknown",
    model: vehicle.model || "Vehicle",
    year: vehicle.year || new Date().getFullYear(),
    vin: vehicle.vin,
    mileage: vehicle.mileage,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    seats: vehicle.seats,
    features: Array.isArray(vehicle.features) ? vehicle.features : [],
    description: vehicle.condition,
    dailyRate: typeof vehicle.price === "number" ? vehicle.price : 0,
    status: mappedStatus,
    location: vehicle.delivery || vehicle.availability || "Ethiopia",
    imageUrl: vehicle.photos?.front || imageFromGallery,
    galleryImages,
    ratingAvg: 0,
    ratingCount: 0,
  };
}

const API_BASE_URL = resolveApiBaseUrl();

export async function fetchPeerHostVehicles(filter?: VehicleFilterStatus) {
  const query = filter ? `?filter=${encodeURIComponent(filter)}` : "";
  const response = await fetch(`${API_BASE_URL}/vehicles/mine${query}`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load vehicles");
  }

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { vehicles?: ApiVehicle[] };
  };

  const vehicles = payload.data?.vehicles || [];
  return vehicles.map(mapApiVehicleToCard);
}

export async function fetchPeerHostVehicleById(id: string) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach backend API at http://localhost:5000");
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
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
  if (!vehicle) return null;

  return mapApiVehicleToCard(vehicle);
}

export async function fetchVehicleAvailability(
  id: string,
): Promise<VehicleAvailabilityBlock[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/vehicles/${id}/availability`, {
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach backend API at http://localhost:5000");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      payload?.error?.message ||
        `Failed to load vehicle availability (HTTP ${response.status})`,
    );
  }

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { availability?: VehicleAvailabilityBlock[] };
  };

  return Array.isArray(payload.data?.availability)
    ? payload.data.availability
    : [];
}

export async function updatePeerHostVehicleAvailability(
  id: string,
  acceptingBookings: boolean,
) {
  const status = acceptingBookings ? "AVAILABLE" : "MAINTENANCE";

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/vehicles/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
  } catch {
    throw new Error("Could not reach backend API at http://localhost:5000");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;

    throw new Error(
      payload?.error?.message ||
        `Failed to update vehicle availability (HTTP ${response.status})`,
    );
  }

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { vehicle?: ApiVehicle };
  };

  const vehicle = payload.data?.vehicle;
  if (!vehicle) {
    throw new Error("Vehicle status updated but response was empty.");
  }

  return mapApiVehicleToCard(vehicle);
}
