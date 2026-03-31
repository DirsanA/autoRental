"use client";

import type { Vehicle } from "@/components/peer-host/vehicles/types";
import { PeerHostVehicleDetailPage } from "@/components/peer-host/vehicles/vehicle-detail-page";
import { updateCompanyVehicleAvailability } from "./adapters";

export function CompanyVehicleDetailPage({ vehicle }: { vehicle: Vehicle }) {
  return (
    <PeerHostVehicleDetailPage
      vehicle={vehicle}
      showHeader={false}
      backHref="/company/fleetmangment"
      controlsTitle="Fleet controls"
      removeActionLabel="Remove vehicle"
      onUpdateAvailability={updateCompanyVehicleAvailability}
    />
  );
}
