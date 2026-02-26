import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { cn } from "@/lib/utils";
import { sampleVehicles } from "./data";
import type { VehicleStatus } from "./types";

function statusBadgeVariant(status: VehicleStatus): "default" | "secondary" | "destructive" | "outline" {
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

export function PeerHostVehiclesPage({ filter }: { filter?: VehicleStatus }) {
  // "Smart structure": keep filtering logic close to data usage.
  // When you switch to real backend data, move this into a server action or route handler.
  const vehicles = filter
    ? sampleVehicles.filter((v) => v.status === filter)
    : sampleVehicles;

  const title = filter ? `My Vehicles · ${formatStatus(filter)}` : "My Vehicles";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Manage listings, pricing, and availability for your cars.
            </p>
          </div>

          <Button className="bg-black text-white hover:opacity-90 dark:bg-white dark:text-black">
            Add vehicle
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v.id} className="overflow-hidden border-border/50">
              <div className="relative h-44 w-full bg-muted">
                {v.imageUrl ? (
                  // Using a plain <img> avoids Next Image domain configuration
                  // while you’re still on mocked/remote image URLs.
                  <img
                    src={v.imageUrl}
                    alt={`${v.make} ${v.model}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>

              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">
                    {v.year} {v.make} {v.model}
                  </CardTitle>
                  <Badge variant={statusBadgeVariant(v.status)}>
                    {formatStatus(v.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{v.location}</span>
                  <span className={cn("font-medium text-foreground")}>
                    ${v.dailyRate}/day
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  Rating{" "}
                  <span className="font-medium text-foreground">
                    {v.ratingAvg.toFixed(1)}
                  </span>{" "}
                  ({v.ratingCount})
                </div>
                <Button variant="secondary" className="bg-muted/40">
                  View details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </div>
  );
}

