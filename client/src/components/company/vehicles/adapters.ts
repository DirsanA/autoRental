import {
  MOCK_VEHICLES,
  type Vehicle as CompanyVehicle,
} from "@/app/(dashboard)/company/types";
import type {
  Vehicle as DashboardVehicle,
  VehicleStatus,
} from "@/components/peer-host/vehicles/types";
import { patchCompanyFleetVehicleStatus } from "./storage";

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

  await new Promise((resolve) => globalThis.setTimeout(resolve, 250));

  const nextStatus: VehicleStatus = acceptingBookings
    ? vehicle.status === "rented"
      ? "rented"
      : "available"
    : "maintenance";

  patchCompanyFleetVehicleStatus(
    vehicle.id,
    mapDashboardStatus(nextStatus),
    MOCK_VEHICLES,
  );

  return {
    ...vehicle,
    acceptingBookings,
    status: nextStatus,
  };
}
