"use client";

import dynamic from "next/dynamic";
import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";

const CompanyFleetManagementPageNoSSR = dynamic(
  async () =>
    import("./company-fleet-management-page").then(
      (module) => module.CompanyFleetManagementPage,
    ),
  { ssr: false },
);

export function CompanyFleetManagementEntry({
  initialVehicles,
}: {
  initialVehicles: CompanyVehicle[];
}) {
  return <CompanyFleetManagementPageNoSSR initialVehicles={initialVehicles} />;
}
