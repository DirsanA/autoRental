import type {
  Vehicle,
  VehicleAvailabilityBlock,
  VehicleFilterStatus,
  VehicleStatus,
} from "./types";
import { buildAuthHeader } from "@/lib/auth-token";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { coalesceRequest } from "@/lib/api-coalesce";

type ApiVehicle = {
  id: string;
  ownerType?: "User" | "Company";
  owner?: {
    id?: string;
    name?: string;
    image?: string;
    type?: "peerhost" | "company";
  };
  pickupAddress?: string;
  returnAddress?: string;
  pickupGeo?: { lat?: number; lng?: number; precision?: "exact" | "approx" };
  returnGeo?: { lat?: number; lng?: number; precision?: "exact" | "approx" };
  companyLocation?: { lat?: number; lng?: number; address?: string | null };
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
    owner: vehicle.owner?.name
      ? {
          id: vehicle.owner.id,
          name: vehicle.owner.name,
          image: vehicle.owner.image,
          type: vehicle.owner.type,
        }
      : undefined,
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
    pickupAddress: vehicle.pickupAddress,
    returnAddress: vehicle.returnAddress,
    pickupGeo:
      typeof vehicle.pickupGeo?.lat === "number" &&
      typeof vehicle.pickupGeo?.lng === "number"
        ? {
            lat: vehicle.pickupGeo.lat,
            lng: vehicle.pickupGeo.lng,
            precision: vehicle.pickupGeo.precision,
          }
        : undefined,
    returnGeo:
      typeof vehicle.returnGeo?.lat === "number" &&
      typeof vehicle.returnGeo?.lng === "number"
        ? {
            lat: vehicle.returnGeo.lat,
            lng: vehicle.returnGeo.lng,
            precision: vehicle.returnGeo.precision,
          }
        : undefined,
    companyLocation:
      typeof vehicle.companyLocation?.lat === "number" &&
      typeof vehicle.companyLocation?.lng === "number"
        ? {
            lat: vehicle.companyLocation.lat,
            lng: vehicle.companyLocation.lng,
            address: vehicle.companyLocation.address ?? null,
          }
        : undefined,
  };
}

function mapApiVehicleToMarketplaceDetail(vehicle: ApiVehicle): Vehicle {
  const mapped = mapApiVehicleToCard(vehicle);

  // Marketplace endpoints can return `owner` summary. Preserve it whenever present.
  if (vehicle.owner) {
    const name = vehicle.owner.name?.trim();
    mapped.owner = name
      ? {
          id: vehicle.owner.id,
          name,
          image: vehicle.owner.image,
          type: vehicle.owner.type,
        }
      : mapped.owner;
  }

  return mapped;
}

const API_BASE_URL = resolveApiBaseUrl();

export async function fetchPeerHostVehicles(filter?: VehicleFilterStatus) {
  const query = filter ? `?filter=${encodeURIComponent(filter)}` : "";
  const cacheKey = `peer-host-vehicles-${filter || "all"}`;

  return coalesceRequest(cacheKey, async () => {
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
  });
}

export async function fetchMarketplaceVehicleById(id: string) {
  return coalesceRequest(`marketplace-vehicle-${id}`, async () => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/vehicles/marketplace/${id}`, {
        cache: "no-store",
      });
    } catch {
      throw new Error("Could not reach backend API");
    }

    if (response.status === 404) return null;

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      throw new Error(payload?.error?.message || "Failed to load vehicle");
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { vehicle?: ApiVehicle };
    };

    const vehicle = payload.data?.vehicle;
    if (!vehicle) return null;

    return mapApiVehicleToCard(vehicle);
  });
}

export async function fetchMarketplaceVehicleByIdWithOwner(id: string) {
  return coalesceRequest(`marketplace-vehicle-with-owner-${id}`, async () => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/vehicles/marketplace/${id}`, {
        cache: "no-store",
      });
    } catch {
      throw new Error("Could not reach backend API");
    }

    if (response.status === 404) return null;

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      throw new Error(payload?.error?.message || "Failed to load vehicle");
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { vehicle?: ApiVehicle };
    };

    const vehicle = payload.data?.vehicle;
    if (!vehicle) return null;

    const mapped = mapApiVehicleToMarketplaceDetail(vehicle);

    // Safety net: if detail endpoint ever returns a placeholder owner but the listing
    // endpoint has the real owner summary, hydrate owner from the listing payload.
    const looksLikePlaceholderOwner =
      mapped.owner?.name &&
      (mapped.owner.name === "Peer Host" || mapped.owner.name === "Rental Company") &&
      !mapped.owner.image;

    if (looksLikePlaceholderOwner) {
      try {
        const listResponse = await fetch(`${API_BASE_URL}/vehicles/marketplace`, {
          cache: "no-store",
        });
        if (listResponse.ok) {
          const listPayload = (await listResponse.json()) as {
            data?: { vehicles?: ApiVehicle[] };
          };
          const match = listPayload.data?.vehicles?.find(
            (item) => item?.id === vehicle.id,
          );
          if (match?.owner?.name) {
            mapped.owner = {
              id: match.owner.id,
              name: match.owner.name,
              image: match.owner.image,
              type: match.owner.type,
            };
          }
        }
      } catch {
        // Ignore secondary owner hydration failures.
      }
    }

    return mapped;
  });
}

export async function fetchPeerHostVehicleById(id: string) {
  return coalesceRequest(`vehicle-${id}`, async () => {
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
  });
}

export async function fetchVehicleAvailability(
  id: string,
): Promise<VehicleAvailabilityBlock[]> {
  return coalesceRequest(`availability-${id}`, async () => {
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

    return payload.data?.availability || [];
  });
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
export async function fetchVehicleReviews(vehicleId: string) {
  const res = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}/reviews`,
    {
      cache: "no-store",
      headers: {
        ...buildAuthHeader(),
      },
    }
  );

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(
      payload?.error?.message ||
        `Failed to fetch reviews (HTTP ${res.status})`
    );
  }

  const payload = await res.json();

  return {
    reviews: payload.data?.reviews || [],
    ratingStats: payload.data?.ratingStats || {
      avg: 0,
      count: 0,
      breakdown: {},
    },
  };
}
