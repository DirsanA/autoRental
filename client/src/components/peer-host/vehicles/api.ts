import type { Vehicle, VehicleStatus } from "./types";

type ApiVehicle = {
  id: string;
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
  switch (status) {
    case "AVAILABLE":
      return "available";
    case "BOOKED":
      return "rented";
    case "MAINTENANCE":
      return "maintenance";
    default:
      return "maintenance";
  }
}

function mapApiVehicleToCard(vehicle: ApiVehicle): Vehicle {
  const imageFromGallery = Array.isArray(vehicle.photos?.gallery)
    ? vehicle.photos?.gallery[0]
    : undefined;
  const galleryImages = Array.isArray(vehicle.photos?.gallery)
    ? vehicle.photos?.gallery.filter(Boolean)
    : [];

  return {
    id: vehicle.id,
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
    status: mapStatus(vehicle.status),
    acceptingBookings: vehicle.status === "AVAILABLE",
    location: vehicle.delivery || vehicle.availability || "Ethiopia",
    imageUrl: vehicle.photos?.front || imageFromGallery,
    galleryImages,
    ratingAvg: 0,
    ratingCount: 0,
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function fetchPeerHostVehicles(filter?: VehicleStatus) {
  const query = filter ? `?filter=${encodeURIComponent(filter)}` : "";
  const response = await fetch(`${API_BASE_URL}/vehicles${query}`, {
    cache: "no-store",
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
  if (!vehicle) return null;

  return mapApiVehicleToCard(vehicle);
}
