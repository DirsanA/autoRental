"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { fetchPeerHostVehicleById } from "./api";
import { PeerHostVehicleDetailPage } from "./vehicle-detail-page";
import type { Vehicle } from "./types";

export function PeerHostVehicleDetailRouteClient({ id }: { id: string }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicle() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const nextVehicle = await fetchPeerHostVehicleById(id);

        if (cancelled) return;

        if (!nextVehicle) {
          setLoadError("Vehicle was not found or you do not have access to it.");
          setVehicle(null);
          return;
        }

        setVehicle(nextVehicle);
      } catch (error) {
        if (cancelled) return;
        setVehicle(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load vehicle details.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadVehicle();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Main>
      </div>
    );
  }

  if (loadError || !vehicle) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="items-center justify-center">
          <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Unable to load vehicle details</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {loadError || "Vehicle details are unavailable."}
            </p>
            <div className="mt-5 flex justify-center">
              <Button asChild variant="outline">
                <Link href="/peerhost/vehicles">Back to vehicles</Link>
              </Button>
            </div>
          </div>
        </Main>
      </div>
    );
  }

  return <PeerHostVehicleDetailPage vehicle={vehicle} />;
}
