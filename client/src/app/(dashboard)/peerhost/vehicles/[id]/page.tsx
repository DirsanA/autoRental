import { PeerHostVehicleDetailRouteClient } from "@/components/peer-host/vehicles/vehicle-detail-route-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PeerHostVehicleDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <PeerHostVehicleDetailRouteClient id={id} />;
}
