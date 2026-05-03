import { PeerHostVehiclesPage } from "@/components/peer-host/vehicles/vehicles-page";
import type { VehicleFilterStatus } from "@/components/peer-host/vehicles/types";

export default async function PeerHostVehiclesRoute({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const filterRaw = params.filter;
  const filter = (Array.isArray(filterRaw) ? filterRaw[0] : filterRaw) as
    | VehicleFilterStatus
    | undefined;

  const allowed: VehicleFilterStatus[] = ["available", "rented", "maintenance"];
  const safeFilter = filter && allowed.includes(filter) ? filter : undefined;

  return <PeerHostVehiclesPage filter={safeFilter} />;
}
