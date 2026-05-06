import Link from "next/link";
import { notFound } from "next/navigation";
import { PeerHostVehicleDetailPage } from "@/components/peer-host/vehicles/vehicle-detail-page";
import { fetchPeerHostVehicleById } from "@/components/peer-host/vehicles/api";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PeerHostVehicleDetailRoute({ params }: PageProps) {
  const { id } = await params;
  let vehicle = null;
  let loadError: string | null = null;

  try {
    vehicle = await fetchPeerHostVehicleById(id);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Failed to load vehicle details";
  }

  if (loadError) {
    return (
      <div className="mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white dark:bg-slate-900 shadow-sm p-6 border border-border dark:border-slate-800 rounded-2xl text-center">
          <h1 className="font-semibold text-xl">Unable to load vehicle details</h1>
          <p className="mt-2 text-muted-foreground text-sm">{loadError}</p>
          <div className="flex justify-center mt-5">
            <Button asChild variant="outline">
              <Link href="/peerhost/vehicles">Back to vehicles</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    notFound();
  }

  return <PeerHostVehicleDetailPage vehicle={vehicle} />;
}
