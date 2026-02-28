import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { cn } from "@/lib/utils";
import { sampleVehicles } from "./data";
import type { VehicleStatus } from "./types";

function statusBadgeVariant(
  status: VehicleStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "available":
      return "default";
    case "rented":
      return "secondary";
    case "maintenance":
      return "outline";
  }
}

function formatStatus(status: VehicleStatus) {
  switch (status) {
    case "available":
      return "Available";
    case "rented":
      return "Rented out";
    case "maintenance":
      return "Maintenance";
  }
}

export function PeerHostVehiclesPage({
  filter,
}: {
  filter?: VehicleStatus;
}) {
  const vehicles = filter
    ? sampleVehicles.filter((v) => v.status === filter)
    : sampleVehicles;

  const title = filter ? `My Vehicles · ${formatStatus(filter)}` : "My Vehicles";

  // Smart Stats (later replace with backend aggregation)
  const availableCount = sampleVehicles.filter(
    (v) => v.status === "available"
  ).length;

  const rentedCount = sampleVehicles.filter(
    (v) => v.status === "rented"
  ).length;

  const maintenanceCount = sampleVehicles.filter(
    (v) => v.status === "maintenance"
  ).length;

  return (
    <div className="flex flex-col flex-1 dark:bg-slate-950 overflow-hidden">
      <Header />

      <Main>
        {/* ===== PAGE HEADER ===== */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="font-bold dark:text-white text-3xl tracking-tight">{title}</h2>
            <p className="mt-1 text-muted-foreground dark:text-slate-400 text-sm">
              Manage listings, pricing, and availability for your cars.
            </p>
          </div>

          <Button className="bg-black dark:bg-white shadow-lg text-white dark:text-black hover:scale-105 transition-transform duration-200">
            + Add Vehicle
          </Button>
        </div>

        {/* ===== SMART STATUS DASHBOARD ===== */}
        <div className="gap-6 grid grid-cols-1 sm:grid-cols-3 mt-10">

          {/* Available Card */}
          <Card className="group relative bg-gradient-to-br from-emerald-500/10 dark:from-emerald-500/20 to-emerald-400/5 dark:to-emerald-400/10 shadow-lg hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/30 backdrop-blur-sm border-0 overflow-hidden transition-all duration-300">
            <div className="top-0 right-0 absolute bg-emerald-500/10 dark:bg-emerald-500/20 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
            <CardContent className="z-10 relative p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">
                    Available Vehicles
                  </p>
                  <p className="mt-2 font-bold text-emerald-700 dark:text-emerald-300 text-3xl">
                    {availableCount}
                  </p>
                </div>
                <div className="opacity-20 dark:opacity-30 text-4xl">🚗</div>
              </div>
            </CardContent>
          </Card>

          {/* Rented Card */}
          <Card className="group relative bg-gradient-to-br from-blue-500/10 dark:from-blue-500/20 to-blue-400/5 dark:to-blue-400/10 shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 backdrop-blur-sm border-0 overflow-hidden transition-all duration-300">
            <div className="top-0 right-0 absolute bg-blue-500/10 dark:bg-blue-500/20 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
            <CardContent className="z-10 relative p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-blue-600 dark:text-blue-400 text-sm">
                    Rented Vehicles
                  </p>
                  <p className="mt-2 font-bold text-blue-700 dark:text-blue-300 text-3xl">
                    {rentedCount}
                  </p>
                </div>
                <div className="opacity-20 dark:opacity-30 text-4xl">📅</div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Card */}
          <Card className="group relative bg-gradient-to-br from-amber-500/10 dark:from-amber-500/20 to-amber-400/5 dark:to-amber-400/10 shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-500/30 backdrop-blur-sm border-0 overflow-hidden transition-all duration-300">
            <div className="top-0 right-0 absolute bg-amber-500/10 dark:bg-amber-500/20 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
            <CardContent className="z-10 relative p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-amber-600 dark:text-amber-400 text-sm">
                    In Maintenance
                  </p>
                  <p className="mt-2 font-bold text-amber-700 dark:text-amber-300 text-3xl">
                    {maintenanceCount}
                  </p>
                </div>
                <div className="opacity-20 dark:opacity-30 text-4xl">🛠️</div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ===== VEHICLE GRID ===== */}
        <div className="gap-6 grid md:grid-cols-2 xl:grid-cols-3 mt-10">
          {vehicles.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground dark:text-slate-400 text-lg">
                No vehicles found for this filter.
              </p>
              <Button className="dark:bg-blue-600 dark:hover:bg-blue-700 mt-6">Add your first vehicle</Button>
            </div>
          )}

          {vehicles.map((v) => (
            <Card
              key={v.id}
              className="group dark:bg-slate-900 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/50 border-border/40 dark:border-slate-800 overflow-hidden transition-all duration-300"
            >
              {/* IMAGE SECTION */}
              <div className="relative bg-muted dark:bg-slate-800 w-full h-52 overflow-hidden">
                {v.imageUrl && (
                  <img
                    src={v.imageUrl}
                    alt={`${v.make} ${v.model}`}
                    className="dark:brightness-90 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}

                {/* STATUS BADGE */}
                <div className="top-3 right-3 absolute">
                  <Badge variant={statusBadgeVariant(v.status)} className={cn(
                    v.status === "available" && "dark:bg-emerald-600 dark:text-white",
                    v.status === "rented" && "dark:bg-blue-600 dark:text-white",
                    v.status === "maintenance" && "dark:bg-amber-600 dark:text-white dark:border-amber-500"
                  )}>
                    {formatStatus(v.status)}
                  </Badge>
                </div>

                {/* PRICE OVERLAY */}
                <div className="bottom-3 left-3 absolute bg-black/70 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                  ${v.dailyRate}/day
                </div>
              </div>

              {/* CONTENT SECTION */}
              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="font-semibold dark:text-white text-lg leading-tight">
                    {v.year} {v.make} {v.model}
                  </h3>
                  <p className="mt-1 text-muted-foreground dark:text-slate-400 text-sm">
                    {v.location}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-muted-foreground dark:text-slate-400 text-sm">
                    ⭐{" "}
                    <span className="font-medium text-foreground dark:text-white">
                      {v.ratingAvg.toFixed(1)}
                    </span>{" "}
                    <span className="dark:text-slate-400">({v.ratingCount})</span>
                  </div>

                  <Button
                    asChild
                    variant="secondary"
                    className={cn(
                      "bg-muted/50 hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                    )}
                  >
                    <Link href={`/peerhost/vehicles/${v.id}`}>View details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </div>
  );
}