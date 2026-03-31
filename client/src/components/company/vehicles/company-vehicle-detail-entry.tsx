"use client";

import dynamic from "next/dynamic";
import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";

const CompanyVehicleDetailRouteClientNoSSR = dynamic(
  async () =>
    import("./company-vehicle-detail-route-client").then(
      (module) => module.CompanyVehicleDetailRouteClient,
    ),
  { ssr: false },
);

export function CompanyVehicleDetailEntry({
  id,
  initialVehicles,
}: {
  id: string;
  initialVehicles: CompanyVehicle[];
}) {
  return (
    <CompanyVehicleDetailRouteClientNoSSR
      id={id}
      initialVehicles={initialVehicles}
    />
  );
}
