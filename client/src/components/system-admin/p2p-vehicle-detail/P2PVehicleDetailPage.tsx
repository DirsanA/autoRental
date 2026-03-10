"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CarFront, Map } from "lucide-react";

import { VehicleHeader } from "./VehicleHeader";
import { VehicleOverview } from "./VehicleOverview";
import { VehicleTrips } from "./VehicleTrips";
import { ToastContainer } from "./ToastContainer";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./useToast";

import { getVehicleData } from "./data";
import type { ConfirmationConfig, VehicleStatus } from "./types";

export function P2PVehicleDetailPage({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const initialData = useMemo(() => getVehicleData(vehicleId), [vehicleId]);

  const [vehicle, setVehicle] = useState(initialData.vehicle);
  const [trips] = useState(initialData.trips);

  const { toasts, addToast, removeToast } = useToast();
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(
    null,
  );

  const wait = () => new Promise((resolve) => setTimeout(resolve, 800));
  const showSuccess = (title: string, msg: string) =>
    addToast("success", title, msg);

  const handleStatusChange = (newStatus: VehicleStatus) => {
    let title = "Update Status";
    let desc = `Set status to ${newStatus}?`;
    let variant: "default" | "destructive" = "default";

    if (newStatus === "suspended") {
      title = "Suspend Vehicle";
      desc = "Are you sure? It will immediately be hidden from renters.";
      variant = "destructive";
    }

    setModalConfig({
      title,
      description: desc,
      confirmLabel: "Confirm",
      variant,
      onConfirm: async () => {
        await wait();
        setVehicle((prev) => ({ ...prev, status: newStatus }));
        showSuccess("Vehicle Updated", `Vehicle is now ${newStatus}.`);
      },
    });
  };

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl">
            {/* Context Back Button */}
            <button
              onClick={() => router.push(`/sysadmin/p2p/${vehicle.hostId}`)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Host Details
            </button>

            {/* Header Identity & Quick Actions */}
            <VehicleHeader
              vehicle={vehicle}
              onStatusChange={handleStatusChange}
            />

            <div className="mt-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:w-[300px] p-1 mb-6 bg-muted/60">
                  <TabsTrigger value="overview" className="gap-2">
                    <CarFront className="h-4 w-4" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="trips" className="gap-2">
                    <Map className="h-4 w-4" /> Trip History
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="overview"
                  className="mt-0 focus-visible:ring-0"
                >
                  <VehicleOverview vehicle={vehicle} />
                </TabsContent>

                <TabsContent
                  value="trips"
                  className="mt-0 focus-visible:ring-0"
                >
                  <VehicleTrips trips={trips} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <ConfirmationModal
        config={modalConfig}
        onClose={() => setModalConfig(null)}
      />
    </div>
  );
}
