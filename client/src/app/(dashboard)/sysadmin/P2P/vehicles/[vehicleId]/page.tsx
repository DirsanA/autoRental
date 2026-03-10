import { P2PVehicleDetailPage } from "@/components/system-admin/p2p-vehicle-detail/P2PVehicleDetailPage";

export const metadata = {
  title: "P2P Vehicle Details | System Admin",
  description: "Review specific peer-to-peer vehicle status and operations.",
};

interface PageProps {
  params: Promise<{
    vehicleId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <P2PVehicleDetailPage vehicleId={resolvedParams.vehicleId} />;
}
