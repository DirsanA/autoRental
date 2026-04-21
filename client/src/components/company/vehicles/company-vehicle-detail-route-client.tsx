"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Vehicle as DashboardVehicle } from "@/components/peer-host/vehicles/types";
import { Button } from "@/components/ui/button";
import { CompanyVehicleDetailPage } from "./company-vehicle-detail-page";
import { mapCompanyVehicleToDashboardVehicle } from "./adapters";
import { fetchCompanyVehicleById } from "./api";
import { removeCompanyFleetVehicle } from "./storage";

type CompanyVehicleDetailRouteClientProps = {
  id: string;
};

export function CompanyVehicleDetailRouteClient({
  id,
}: CompanyVehicleDetailRouteClientProps) {
  const [vehicle, setVehicle] = useState<DashboardVehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removedStaleVehicle, setRemovedStaleVehicle] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicle() {
      setIsLoading(true);
      setError(null);
      setRemovedStaleVehicle(false);
      try {
        const foundVehicle = await fetchCompanyVehicleById(id);
        if (cancelled) return;
        if (!foundVehicle) {
          setRemovedStaleVehicle(removeCompanyFleetVehicle(id));
        }
        setVehicle(foundVehicle ? mapCompanyVehicleToDashboardVehicle(foundVehicle) : null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load vehicle");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadVehicle();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const message = useMemo(() => {
    if (isLoading) return "Loading vehicle details...";
    if (error) return error;
    if (removedStaleVehicle) {
      return "This vehicle was already deleted, and the stale fleet card has now been removed.";
    }
    return "This car may have been removed from the company fleet.";
  }, [error, isLoading, removedStaleVehicle]);

  if (isLoading || !vehicle) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          {isLoading ? "Loading..." : "Vehicle not found"}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>
        {!isLoading && (
          <Button asChild variant="outline" className="mt-5">
            <Link href="/company/fleetmangment">Back to fleet</Link>
          </Button>
        )}
      </div>
    );
  }

  return <CompanyVehicleDetailPage vehicle={vehicle} />;
}
