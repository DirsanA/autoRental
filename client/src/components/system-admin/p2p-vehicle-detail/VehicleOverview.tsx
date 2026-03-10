"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, PenTool, CheckCircle2 } from "lucide-react";
import type { VehicleFullDetail } from "./types";

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

interface VehicleOverviewProps {
  vehicle: VehicleFullDetail;
}

export function VehicleOverview({ vehicle }: VehicleOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* High level metrics / facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Daily Rate
            </span>
            <span className="text-2xl font-bold">${vehicle.dailyRate}</span>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Mileage
            </span>
            <span className="text-2xl font-bold">
              {vehicle.mileage.toLocaleString()} mi
            </span>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Transmission
            </span>
            <span className="text-2xl font-bold capitalize">
              {vehicle.transmission}
            </span>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Fuel
            </span>
            <span className="text-2xl font-bold capitalize">
              {vehicle.fuelType}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Vehicle Specifications */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <PenTool className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border divide-y bg-card/50">
              <SpecRow
                label="VIN"
                value={<span className="font-mono text-xs">{vehicle.vin}</span>}
              />
              <SpecRow label="Make" value={vehicle.make} />
              <SpecRow label="Model" value={vehicle.model} />
              <SpecRow label="Year" value={vehicle.year} />
              <SpecRow label="Color" value={vehicle.color} />
              <SpecRow label="Seats" value={vehicle.seats} />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-sm font-medium text-foreground">
                Features
              </span>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <Badge
                    key={f}
                    variant="secondary"
                    className="font-normal gap-1 bg-muted/60 text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3 w-3" /> {f}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal & About */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Compliance & Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border divide-y bg-card/50">
                <SpecRow
                  label="Insurance Expiry"
                  value={new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                />
                <SpecRow
                  label="Last Serviced"
                  value={new Date(vehicle.lastServiced).toLocaleDateString()}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm flex-1">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {vehicle.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
