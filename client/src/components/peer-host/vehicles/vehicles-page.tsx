"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchPeerHostVehicles } from "./api";
import { VehiclesPageSkeleton } from "./vehicles-skeleton";
import type { Vehicle, VehicleFilterStatus, VehicleStatus } from "./types";

type VehicleStatusFilter = "all" | VehicleStatus;

function formatStatus(status: VehicleStatus) {
  switch (status) {
    case "available":
      return "Available";
    case "rented":
      return "Rented out";
    case "maintenance":
      return "Maintenance";
    case "pending_approval":
      return "Pending approval";
    case "retired":
      return "Retired";
  }
}

function statusBadgeClass(status: VehicleStatus) {
  switch (status) {
    case "available":
      return "border-emerald-500 text-emerald-600 dark:text-emerald-400";
    case "rented":
      return "border-blue-500 text-blue-600 dark:text-blue-400";
    case "maintenance":
      return "border-amber-500 text-amber-600 dark:text-amber-400";
    case "pending_approval":
      return "border-red-500 text-red-600 dark:text-red-400";
    case "retired":
      return "border-slate-500 text-slate-600 dark:text-slate-400";
  }
}

type PeerHostVehiclesPageProps = {
  filter?: VehicleFilterStatus;
  vehicles?: Vehicle[];
  loadError?: string | null;
  title?: string;
  description?: string;
  detailHrefBase?: string;
  showHeader?: boolean;
};

export function PeerHostVehiclesPage({
  filter,
  vehicles: providedVehicles,
  loadError: providedLoadError,
  title: providedTitle,
  description = "Manage listings, pricing, and availability for your cars.",
  detailHrefBase = "/peerhost/vehicles",
  showHeader = true,
}: PeerHostVehiclesPageProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(providedVehicles ?? []);
  const [loadError, setLoadError] = useState<string | null>(
    providedLoadError ?? null,
  );
  const [isLoading, setIsLoading] = useState(
    !providedVehicles && !providedLoadError,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<VehicleStatusFilter>(
    filter ?? "all",
  );

  useEffect(() => {
    if (providedVehicles || providedLoadError) {
      return;
    }

    let cancelled = false;

    fetchPeerHostVehicles()
      .then((nextVehicles) => {
        if (cancelled) return;
        setVehicles(nextVehicles);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load vehicles from server.",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [providedLoadError, providedVehicles]);

  const filteredVehicles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        query.length === 0 ||
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.location.toLowerCase().includes(query) ||
        vehicle.vin?.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "all" ? true : vehicle.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, searchTerm, vehicles]);

  if (isLoading) {
    const loadingContent = <VehiclesPageSkeleton />;
    if (!showHeader) {
      return <div className="space-y-0">{loadingContent}</div>;
    }
    return (
      <div className="flex flex-1 flex-col overflow-hidden dark:bg-slate-950">
        <Header />
        <Main>{loadingContent}</Main>
      </div>
    );
  }

  const title = providedTitle ?? "My Vehicles";

  const content = (
    <div className="space-y-6">
      {loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
            {description}
          </p>
        </div>
        <Button
          asChild
          className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Link href="/peerhost/add-vehicle">
            <Plus className="mr-2 h-4 w-4" />
            Add vehicle
          </Link>
        </Button>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by make, model, location, or VIN..."
                className="h-10 rounded-2xl border-border/70 bg-background/70 pl-10"
              />
            </div>

            <Select
              value={activeFilter}
              onValueChange={(value) =>
                setActiveFilter(value as VehicleStatusFilter)
              }
            >
              <SelectTrigger className="h-10 w-full rounded-2xl border-border/70 bg-background/70 sm:w-[200px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented out</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="pending_approval">Pending approval</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            {`${filteredVehicles.length} matching vehicles`}
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-2">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-lg text-muted-foreground dark:text-slate-400">
              No vehicles matched the current filters.
            </p>
            <Button
              asChild
              className="mt-6 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Link href="/peerhost/add-vehicle">Add your first vehicle</Link>
            </Button>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="group overflow-hidden border-border/40 transition-all duration-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-2xl dark:hover:shadow-slate-900/50"
            >
              <div className="relative h-52 w-full overflow-hidden bg-muted dark:bg-slate-800">
                {vehicle.imageUrl ? (
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 dark:brightness-90"
                    loading="lazy"
                  />
                ) : null}

                <div className="absolute right-3 top-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border bg-white text-slate-950 dark:bg-white dark:text-slate-950",
                      statusBadgeClass(vehicle.status),
                    )}
                  >
                    {formatStatus(vehicle.status)}
                  </Badge>
                </div>

                <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white backdrop-blur-sm dark:bg-black/80">
                  ${vehicle.dailyRate}/day
                </div>
              </div>

              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-semibold leading-tight text-foreground dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                    {vehicle.location}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground dark:text-slate-400">
                    <span className="font-medium text-foreground dark:text-white">
                      {vehicle.ratingAvg.toFixed(1)}
                    </span>{" "}
                    <span>({vehicle.ratingCount})</span>
                  </div>

                  <Button
                    asChild
                    variant="secondary"
                    className="bg-muted/50 transition-colors hover:bg-muted dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Link href={`${detailHrefBase}/${vehicle.id}`}>
                      View details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  if (!showHeader) {
    return <div className="space-y-0">{content}</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden dark:bg-slate-950">
      <Header />
      <Main>{content}</Main>
    </div>
  );
}
