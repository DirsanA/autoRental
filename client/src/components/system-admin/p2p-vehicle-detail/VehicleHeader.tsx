"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Ban,
  Car,
  Edit,
  AlertTriangle,
} from "lucide-react";
import type { VehicleFullDetail, VehicleStatus } from "./types";
import { cn } from "@/lib/utils";

interface VehicleHeaderProps {
  vehicle: VehicleFullDetail;
  onStatusChange: (status: VehicleStatus) => void;
}

const statusConfig: Record<
  VehicleStatus,
  { label: string; icon: React.ElementType; cls: string }
> = {
  active: {
    label: "Active Listing",
    icon: CheckCircle2,
    cls: "text-green-600 bg-green-100",
  },
  pending: {
    label: "Pending Review",
    icon: Clock,
    cls: "text-blue-600 bg-blue-100",
  },
  suspended: {
    label: "Suspended",
    icon: AlertTriangle,
    cls: "text-red-600 bg-red-100",
  },
  maintenance: {
    label: "Under Maintenance",
    icon: Car,
    cls: "text-yellow-600 bg-yellow-100",
  },
  unlisted: {
    label: "Unlisted",
    icon: Ban,
    cls: "text-gray-600 bg-gray-100",
  },
};

export function VehicleHeader({ vehicle, onStatusChange }: VehicleHeaderProps) {
  const currentStatus = statusConfig[vehicle.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6 border-b">
      <div className="flex items-center gap-4">
        {/* Placeholder for Vehicle Image / Avatar */}
        <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-indigo-100 to-primary/20 flex flex-col items-center justify-center text-primary border border-primary/10 shadow-sm shrink-0">
          <Car className="h-8 w-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {vehicle.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-sm uppercase text-muted-foreground tracking-wider">
              {vehicle.plateNumber}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-sm text-muted-foreground">
              {vehicle.category}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <Badge
              variant="outline"
              className={cn(
                "border-0 gap-1 rounded-sm px-1.5 py-0",
                currentStatus.cls,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {currentStatus.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" /> Edit Listing
        </Button>

        {vehicle.status === "pending" && (
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onStatusChange("active")}
          >
            <CheckCircle2 className="h-4 w-4" /> Approve
          </Button>
        )}

        {vehicle.status === "active" && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => onStatusChange("suspended")}
          >
            <AlertTriangle className="h-4 w-4" /> Suspend
          </Button>
        )}

        {vehicle.status === "suspended" && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onStatusChange("active")}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> Reactivate
          </Button>
        )}
      </div>
    </div>
  );
}
