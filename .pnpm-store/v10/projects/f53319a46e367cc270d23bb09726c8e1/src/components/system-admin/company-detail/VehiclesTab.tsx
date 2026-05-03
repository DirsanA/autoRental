"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Eye,
  Pause,
  Trash2,
  Car,
  Fuel,
  Gauge,
} from "lucide-react";
import type { Vehicle, VehicleStatus } from "./types";

// ─── Vehicle status badge config ─────────────────────────────────────────────

const vehicleStatusConfig: Record<
  VehicleStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  rented: {
    label: "Rented",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  maintenance: {
    label: "Maintenance",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

// ─── Vehicles Tab ────────────────────────────────────────────────────────────

interface VehiclesTabProps {
  vehicles: Vehicle[];
  onView: (vehicle: Vehicle) => void;
  onSuspend: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function VehiclesTab({
  vehicles,
  onView,
  onSuspend,
  onDelete,
}: VehiclesTabProps) {
  // Empty state when the company has no vehicles
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Car className="h-12 w-12 opacity-20 mb-3" />
        <p className="text-lg font-medium">No vehicles registered</p>
        <p className="text-sm">
          This company has not added any vehicles to the fleet yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats summary strip */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Available: {vehicles.filter((v) => v.status === "available").length}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Rented: {vehicles.filter((v) => v.status === "rented").length}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          Maintenance:{" "}
          {vehicles.filter((v) => v.status === "maintenance").length}
        </span>
      </div>

      {/* Vehicle table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[240px]">Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rate / Day</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Fuel / Trans.</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {vehicles.map((vehicle) => {
              const sts = vehicleStatusConfig[vehicle.status];
              return (
                <TableRow
                  key={vehicle.id}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  {/* Vehicle identity */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Car className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium leading-tight">
                          {vehicle.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {vehicle.model} · {vehicle.year}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 font-normal border-0",
                        sts.className,
                      )}
                    >
                      {sts.label}
                    </Badge>
                  </TableCell>

                  {/* Rental rate */}
                  <TableCell className="font-medium">
                    ${vehicle.rentalRate}
                  </TableCell>

                  {/* Mileage */}
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5" />
                      {vehicle.mileage.toLocaleString()} km
                    </span>
                  </TableCell>

                  {/* Fuel & Transmission */}
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Fuel className="h-3.5 w-3.5" />
                      {vehicle.fuelType} · {vehicle.transmission}
                    </span>
                  </TableCell>

                  {/* Plate number */}
                  <TableCell>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {vehicle.plateNumber}
                    </span>
                  </TableCell>

                  {/* Row actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(vehicle)}>
                          <Eye className="mr-2 h-4 w-4" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSuspend(vehicle)}>
                          <Pause className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(vehicle)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
