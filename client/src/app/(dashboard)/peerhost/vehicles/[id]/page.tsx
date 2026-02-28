import { use } from "react";
import { notFound } from "next/navigation";
import { PeerHostVehicleDetailPage } from "@/components/peer-host/vehicles/vehicle-detail-page";
import { sampleVehicles } from "@/components/peer-host/vehicles/data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PeerHostVehicleDetailRoute({ params }: PageProps) {
  // ✅ Use React.use() to unwrap the Promise
  const { id } = use(params);
  
  const vehicle = sampleVehicles.find((v) => v.id === id);

  if (!vehicle) {
    notFound();
  }

  return <PeerHostVehicleDetailPage vehicle={vehicle} />;
}