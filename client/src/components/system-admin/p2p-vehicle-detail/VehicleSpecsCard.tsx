"use client";

import { CheckCircle2, Info, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { P2PVehicleDetail } from "@/lib/admin-p2p-api";

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-row justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export function VehicleSpecsCard({ vehicle }: { vehicle: P2PVehicleDetail }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Pricing Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Pricing</h2>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">${vehicle.price}</span>
          <span className="text-sm text-muted-foreground">/ day</span>
        </div>
        
        {(vehicle.weeklyDiscount || vehicle.monthlyDiscount) ? (
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex flex-col gap-1.5">
              {vehicle.weeklyDiscount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly Discount</span>
                  <span className="font-medium text-green-600">-{vehicle.weeklyDiscount}%</span>
                </div>
              )}
              {vehicle.monthlyDiscount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Discount</span>
                  <span className="font-medium text-green-600">-{vehicle.monthlyDiscount}%</span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Specifications Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Specifications</h2>
        </div>
        
        <div className="divide-y border-y">
          <SpecRow label="Make" value={vehicle.make} />
          <SpecRow label="Model" value={vehicle.model} />
          <SpecRow label="Year" value={vehicle.year} />
          <SpecRow label="License Plate" value={vehicle.plate} />
          <SpecRow label="VIN" value={<span className="font-mono text-xs">{vehicle.vin}</span>} />
          <SpecRow label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : null} />
          <SpecRow label="Fuel Type" value={<span className="capitalize">{vehicle.fuel}</span>} />
          <SpecRow label="Transmission" value={<span className="capitalize">{vehicle.transmission}</span>} />
          <SpecRow label="Seats" value={vehicle.seats} />
          <SpecRow label="Condition" value={<span className="capitalize">{vehicle.condition}</span>} />
        </div>
      </div>

      {/* Features Card */}
      {vehicle.features.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Features</h2>
          <div className="flex flex-wrap gap-2">
            {vehicle.features.map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="font-normal gap-1 bg-muted/60 text-muted-foreground"
              >
                <CheckCircle2 className="h-3 w-3" /> {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info Card */}
      {(vehicle.availability || vehicle.delivery) && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold tracking-tight">Additional Info</h2>
          </div>
          
          <div className="flex flex-col gap-4 text-sm">
            {vehicle.availability && (
              <div>
                <span className="font-medium text-foreground block mb-1">Availability</span>
                <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.availability}</p>
              </div>
            )}
            {vehicle.delivery && (
              <div>
                <span className="font-medium text-foreground block mb-1">Delivery Notes</span>
                <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.delivery}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
