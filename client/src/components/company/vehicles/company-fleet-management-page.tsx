"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CarFront,
  Plus,
  Search,
} from "lucide-react";
import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AddCompanyVehicleDialog } from "./add-company-vehicle-dialog";
import {
  persistCompanyFleetVehicles,
  readCompanyFleetVehicles,
} from "./storage";

type FleetFilter = "all" | CompanyVehicle["status"];

type CompanyFleetManagementPageProps = {
  initialVehicles: CompanyVehicle[];
};

function formatStatus(status: CompanyVehicle["status"]) {
  switch (status) {
    case "available":
      return "Available";
    case "booked":
      return "Booked";
    case "maintenance":
      return "Maintenance";
    case "pending_approval":
      return "Pending approval";
    case "retired":
      return "Retired";
  }
}

function statusPillClass(status: CompanyVehicle["status"]) {
  switch (status) {
    case "available":
      return "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-500/30 dark:bg-slate-950/70 dark:text-emerald-300";
    case "booked":
      return "border-sky-200 bg-white text-sky-700 dark:border-sky-500/30 dark:bg-slate-950/70 dark:text-sky-300";
    case "maintenance":
      return "border-amber-200 bg-white text-amber-700 dark:border-amber-500/30 dark:bg-slate-950/70 dark:text-amber-300";
    case "pending_approval":
      return "border-rose-200 bg-white text-rose-700 dark:border-rose-500/30 dark:bg-slate-950/70 dark:text-rose-300";
    case "retired":
      return "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-950/70 dark:text-slate-300";
  }
}

export function CompanyFleetManagementPage({
  initialVehicles,
}: CompanyFleetManagementPageProps) {
  const [vehicles, setVehicles] = useState<CompanyVehicle[]>(() =>
    readCompanyFleetVehicles(initialVehicles),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FleetFilter>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    persistCompanyFleetVehicles(vehicles);
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.plate.toLowerCase().includes(query) ||
        vehicle.location.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "all" ? true : vehicle.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, searchTerm, vehicles]);

  const handleAddVehicle = async (vehicle: CompanyVehicle) => {
    setVehicles((current) => [vehicle, ...current]);
  };

  return (
    <>
      <div className="space-y-8 pb-8">
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by make, model, plate, or location"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 shadow-none dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                ["all", "available", "booked", "maintenance", "pending_approval"] as FleetFilter[]
              ).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      activeFilter === filter
                        ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    {filter === "all" ? "All vehicles" : formatStatus(filter)}
                  </button>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredVehicles.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
              <CarFront className="mx-auto mb-4 h-10 w-10 text-slate-400 dark:text-slate-500" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                No matching vehicles
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Try a different search, switch the filter, or add a new car to
                expand the company fleet.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-6 rounded-2xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add car
              </Button>
            </div>
          )}

          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <Badge className={cn("border px-3 py-1 text-xs", statusPillClass(vehicle.status))}>
                    {formatStatus(vehicle.status)}
                  </Badge>
                  <Badge className="border border-white/20 bg-black/30 px-3 py-1 text-xs text-white backdrop-blur">
                    {vehicle.plate}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex items-center rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
                    ${vehicle.pricePerDay}/day
                  </div>
                </div>
              </div>

              <CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {vehicle.location}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Rating</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {vehicle.ratingAvg?.toFixed(1) ?? "0.0"} ({vehicle.ratingCount ?? 0})
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      Last service
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                      {vehicle.lastMaintenance}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      Next service
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                      {vehicle.nextMaintenance}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-11 flex-1 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                  >
                    <Link href={`/company/fleetmangment/${vehicle.id}`}>
                      View details
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-11 flex-1 rounded-2xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                  >
                    Add another
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      <AddCompanyVehicleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddVehicle={handleAddVehicle}
      />
    </>
  );
}
