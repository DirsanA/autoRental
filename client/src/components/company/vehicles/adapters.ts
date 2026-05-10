import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";
import type {
  Vehicle as DashboardVehicle,
  VehicleStatus,
} from "@/components/peer-host/vehicles/types";
import { updateCompanyVehicleById } from "./api";
import { upsertCompanyFleetVehicle } from "./storage";

function mapCompanyStatus(status: CompanyVehicle["status"]): VehicleStatus {
  switch (status) {
    case "available":
      return "available";
    case "booked":
      return "rented";
    case "maintenance":
      return "maintenance";
    case "pending_approval":
      return "pending_approval";
    case "retired":
      return "retired";
  }
}

function mapDashboardStatus(status: VehicleStatus): CompanyVehicle["status"] {
  switch (status) {
    case "available":
      return "available";
    case "rented":
      return "booked";
    case "maintenance":
      return "maintenance";
    case "pending_approval":
      return "pending_approval";
    case "retired":
      return "retired";
  }
}

function toApiStatus(
  status: CompanyVehicle["status"],
): "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "RETIRED" | "PENDING_APPROVAL" {
  switch (status) {
    case "available":
      return "AVAILABLE";
    case "booked":
      return "BOOKED";
    case "maintenance":
      return "MAINTENANCE";
    case "pending_approval":
      return "PENDING_APPROVAL";
    case "retired":
      return "RETIRED";
  }
}

export function mapCompanyVehicleToDashboardVehicle(
  vehicle: CompanyVehicle,
): DashboardVehicle {
  const status = mapCompanyStatus(vehicle.status);

  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    vin: vehicle.vin,
    dailyRate: vehicle.pricePerDay,
    status,
    acceptingBookings: status === "available" || status === "rented",
    location: vehicle.location,
    imageUrl: vehicle.image,
    galleryImages: vehicle.galleryImages,
    mileage: vehicle.mileage,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    seats: vehicle.seats,
    features: vehicle.features,
    description: vehicle.description,
    allowSelfDrive: vehicle.allowSelfDrive,
    securityDepositAmount: vehicle.securityDepositAmount,
    ratingAvg: vehicle.ratingAvg ?? 0,
    ratingCount: vehicle.ratingCount ?? 0,
  };
}

export async function updateCompanyVehicleAvailability(
  vehicle: DashboardVehicle,
  acceptingBookings: boolean,
): Promise<DashboardVehicle> {
  if (vehicle.status === "pending_approval") {
    throw new Error("This vehicle is still pending approval.");
  }

  if (vehicle.status === "retired") {
    throw new Error("Retired vehicles cannot accept bookings.");
  }

  const nextStatus: VehicleStatus = acceptingBookings
    ? vehicle.status === "rented"
      ? "rented"
      : "available"
    : "maintenance";
  const updated = await updateCompanyVehicleById(vehicle.id, {
    status: toApiStatus(mapDashboardStatus(nextStatus)),
  });
  upsertCompanyFleetVehicle(updated);

  return mapCompanyVehicleToDashboardVehicle(updated);
}
