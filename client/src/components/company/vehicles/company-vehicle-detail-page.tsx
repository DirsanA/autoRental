"use client";

import { useRouter } from "next/navigation";
import type { Vehicle } from "@/components/peer-host/vehicles/types";
import { PeerHostVehicleDetailPage } from "@/components/peer-host/vehicles/vehicle-detail-page";
import { updateCompanyVehicleAvailability } from "./adapters";
import {
  deleteCompanyVehicleById,
  updateCompanyVehicleById,
} from "./api";
import { mapCompanyVehicleToDashboardVehicle } from "./adapters";
import type { EditableVehicleDetails } from "@/components/peer-host/vehicles/edit-vehicle-types";
import {
  removeCompanyFleetVehicle,
  upsertCompanyFleetVehicle,
} from "./storage";

export function CompanyVehicleDetailPage({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();

  const handleSaveDetails = async (
    vehicleId: string,
    details: EditableVehicleDetails,
  ): Promise<Vehicle> => {
    const updated = await updateCompanyVehicleById(vehicleId, {
      make: details.make,
      model: details.model,
      year: details.year,
      mileage: Number.parseInt(details.specifications.mileage.replace(/[^\d]/g, ""), 10) || undefined,
      fuel:
        details.specifications.fuelType.toLowerCase() === "diesel" ||
        details.specifications.fuelType.toLowerCase() === "hybrid" ||
        details.specifications.fuelType.toLowerCase() === "electric"
          ? (details.specifications.fuelType.toLowerCase() as "diesel" | "hybrid" | "electric")
          : "petrol",
      transmission:
        details.specifications.transmission.toLowerCase() === "manual" ||
        details.specifications.transmission.toLowerCase() === "cvt"
          ? (details.specifications.transmission.toLowerCase() as "manual" | "cvt")
          : "automatic",
      seats: details.specifications.seats,
      features: details.features,
      condition: details.description,
      price: details.dailyRate,
      allowSelfDrive: details.allowSelfDrive,
      securityDepositAmount: details.allowSelfDrive
        ? details.securityDepositAmount
        : 0,
      delivery: details.location,
    });
    upsertCompanyFleetVehicle(updated);

    return mapCompanyVehicleToDashboardVehicle(updated);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    await deleteCompanyVehicleById(vehicleId);
    removeCompanyFleetVehicle(vehicleId);
    router.push("/company/fleetmangment");
  };

  return (
    <PeerHostVehicleDetailPage
      vehicle={vehicle}
      showHeader={false}
      backHref="/company/fleetmangment"
      controlsTitle="Fleet controls"
      removeActionLabel="Remove vehicle"
      onUpdateAvailability={updateCompanyVehicleAvailability}
      onSaveDetails={handleSaveDetails}
      onRemoveVehicle={handleDeleteVehicle}
    />
  );
}
