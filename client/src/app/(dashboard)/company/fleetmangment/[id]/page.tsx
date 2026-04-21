import { CompanyVehicleDetailEntry } from "@/components/company/vehicles/company-vehicle-detail-entry";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyFleetVehicleDetailRoute({
  params,
}: PageProps) {
  const { id } = await params;
  return <CompanyVehicleDetailEntry id={id} />;
}
