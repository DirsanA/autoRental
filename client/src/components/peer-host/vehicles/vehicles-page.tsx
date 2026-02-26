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
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />

      <Main>
        {/* ===== PAGE HEADER ===== */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="font-bold text-3xl tracking-tight">{title}</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Manage listings, pricing, and availability for your cars.
            </p>
          </div>

          <Button className="bg-black dark:bg-white shadow-lg text-white dark:text-black hover:scale-105 transition-transform duration-200">
            + Add Vehicle
          </Button>
        </div>

        {/* ===== MINI DASHBOARD STATS ===== */}
    {/* ===== SMART STATUS DASHBOARD ===== */}
<div className="gap-6 grid grid-cols-1 sm:grid-cols-3 mt-10">

  {/* Available Card */}
  <Card className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 shadow-lg hover:shadow-emerald-500/20 backdrop-blur-sm border-0 overflow-hidden transition-all duration-300">
    <div className="top-0 right-0 absolute bg-emerald-500/10 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
    <CardContent className="z-10 relative p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-emerald-600 text-sm">
            Available Vehicles
          </p>
          <p className="mt-2 font-bold text-emerald-700 text-3xl">
            {availableCount}
          </p>
        </div>
        <div className="opacity-20 text-4xl">🚗</div>
      </div>
    </CardContent>
  </Card>

  {/* Rented Card */}
  <Card className="group relative bg-gradient-to-br from-blue-500/10 to-blue-400/5 shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm border-0 overflow-hidden transition-all duration-300">
    <div className="top-0 right-0 absolute bg-blue-500/10 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
    <CardContent className="z-10 relative p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-blue-600 text-sm">
            Rented Vehicles
          </p>
          <p className="mt-2 font-bold text-blue-700 text-3xl">
            {rentedCount}
          </p>
        </div>
        <div className="opacity-20 text-4xl">📅</div>
      </div>
    </CardContent>
  </Card>

  {/* Maintenance Card */}
  <Card className="group relative bg-gradient-to-br from-amber-500/10 to-amber-400/5 shadow-lg hover:shadow-amber-500/20 backdrop-blur-sm border-0 overflow-hidden transition-all duration-300">
    <div className="top-0 right-0 absolute bg-amber-500/10 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
    <CardContent className="z-10 relative p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-amber-600 text-sm">
            In Maintenance
          </p>
          <p className="mt-2 font-bold text-amber-700 text-3xl">
            {maintenanceCount}
          </p>
        </div>
        <div className="opacity-20 text-4xl">🛠️</div>
      </div>
    </CardContent>
  </Card>

</div>

        {/* ===== VEHICLE GRID ===== */}
        <div className="gap-6 grid md:grid-cols-2 xl:grid-cols-3 mt-10">
          {vehicles.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground text-lg">
                No vehicles found for this filter.
              </p>
              <Button className="mt-6">Add your first vehicle</Button>
            </div>
          )}

          {vehicles.map((v) => (
            <Card
              key={v.id}
              className="group hover:shadow-2xl border-border/40 overflow-hidden transition-all duration-300"
            >
              {/* IMAGE SECTION */}
              <div className="relative bg-muted w-full h-52 overflow-hidden">
                {v.imageUrl && (
                  <img
                    src={v.imageUrl}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}

                {/* STATUS BADGE */}
                <div className="top-3 right-3 absolute">
                  <Badge variant={statusBadgeVariant(v.status)}>
                    {formatStatus(v.status)}
                  </Badge>
                </div>

                {/* PRICE OVERLAY */}
                <div className="bottom-3 left-3 absolute bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                  ${v.dailyRate}/day
                </div>
              </div>

              {/* CONTENT SECTION */}
              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {v.year} {v.make} {v.model}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {v.location}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-muted-foreground text-sm">
                    ⭐{" "}
                    <span className="font-medium text-foreground">
                      {v.ratingAvg.toFixed(1)}
                    </span>{" "}
                    ({v.ratingCount})
                  </div>

                  <Button
                    variant="secondary"
                    className={cn(
                      "bg-muted/50 hover:bg-muted transition-colors"
                    )}
                  >
                    View details
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