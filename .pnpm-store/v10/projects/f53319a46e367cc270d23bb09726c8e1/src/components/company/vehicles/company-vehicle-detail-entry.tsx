"use client";

import dynamic from "next/dynamic";

const CompanyVehicleDetailRouteClientNoSSR = dynamic(
  async () =>
    import("./company-vehicle-detail-route-client").then(
      (module) => module.CompanyVehicleDetailRouteClient,
    ),
  { ssr: false },
);

export function CompanyVehicleDetailEntry({
  id,
}: {
  id: string;
}) {
  return <CompanyVehicleDetailRouteClientNoSSR id={id} />;
}
