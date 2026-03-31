"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";
import type { Vehicle as DashboardVehicle } from "@/components/peer-host/vehicles/types";
import { Button } from "@/components/ui/button";
import { CompanyVehicleDetailPage } from "./company-vehicle-detail-page";
import { mapCompanyVehicleToDashboardVehicle } from "./adapters";
import { readCompanyFleetVehicles } from "./storage";

type CompanyVehicleDetailRouteClientProps = {
  id: string;
  initialVehicles: CompanyVehicle[];
};

export function CompanyVehicleDetailRouteClient({
  id,
  initialVehicles,
}: CompanyVehicleDetailRouteClientProps) {
  const vehicle = useMemo<DashboardVehicle | null>(() => {
    const vehicles = readCompanyFleetVehicles(initialVehicles);
    const foundVehicle = vehicles.find((item) => item.id === id) ?? null;
    return foundVehicle ? mapCompanyVehicleToDashboardVehicle(foundVehicle) : null;
  }, [id, initialVehicles]);

  if (!vehicle) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Vehicle not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          This car may have been removed from the company fleet.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/company/fleetmangment">Back to fleet</Link>
        </Button>
      </div>
    );
  }

  return <CompanyVehicleDetailPage vehicle={vehicle} />;
}
