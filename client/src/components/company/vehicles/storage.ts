"use client";

import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";

const COMPANY_FLEET_STORAGE_KEY = "company-fleet-vehicles";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readCompanyFleetVehicles(
  fallbackVehicles: CompanyVehicle[],
): CompanyVehicle[] {
  if (!canUseStorage()) {
    return fallbackVehicles;
  }

  try {
    const raw = window.localStorage.getItem(COMPANY_FLEET_STORAGE_KEY);
    if (!raw) {
      return fallbackVehicles;
    }

    const parsed = JSON.parse(raw) as CompanyVehicle[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackVehicles;
  } catch {
    return fallbackVehicles;
  }
}

export function persistCompanyFleetVehicles(vehicles: CompanyVehicle[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    COMPANY_FLEET_STORAGE_KEY,
    JSON.stringify(vehicles),
  );
}

export function patchCompanyFleetVehicleStatus(
  id: string,
  status: CompanyVehicle["status"],
  fallbackVehicles: CompanyVehicle[],
) {
  const vehicles = readCompanyFleetVehicles(fallbackVehicles).map((vehicle) =>
    vehicle.id === id ? { ...vehicle, status } : vehicle,
  );

  persistCompanyFleetVehicles(vehicles);
}
