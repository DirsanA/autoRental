"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  DollarSign,
  Car,
  Ban,
  CheckCircle2,
  Clock,
  User,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HostInfo, HostStatus } from "./types";

interface HostSidebarProps {
  host: HostInfo;
  onStatusChange: (status: HostStatus) => void;
  onDelete: () => void;
}

const statusConfig: Record<
  HostStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    color:
      "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color:
      "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
  },
  suspended: {
    label: "Suspended",
    icon: Ban,
    color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  },
  rejected: {
    label: "Rejected",
    icon: Ban,
    color: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
  },
};

export function HostSidebar({
  host,
  onStatusChange,
  onDelete,
}: HostSidebarProps) {
  const status = statusConfig[host.status];
  const StatusIcon = status.icon;

  const initials = host.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="shadow-sm sticky top-24 overflow-hidden border-t-4 border-t-primary">
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onStatusChange("active")}>
              Mark as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("suspended")}>
              Suspend Host
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("rejected")}>
              Reject Application
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              Delete Host Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center shadow-lg mb-4 text-white text-3xl font-semibold">
          {initials}
        </div>

        {/* Identity */}
        <h2 className="text-xl font-bold tracking-tight mb-1">{host.name}</h2>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={cn("mt-2 border-0 gap-1", status.color)}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </Badge>

        <div className="w-full border-t border-muted my-6" />

        {/* Contact Info */}
        <div className="flex flex-col gap-3 w-full text-left">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{host.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{host.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{host.address}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Joined {new Date(host.joinDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="w-full border-t border-muted my-6" />

        {/* Host Stats */}
        <div className="grid grid-cols-2 gap-4 w-full text-left">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Rating
            </span>
            <span className="text-lg font-bold">
              {host.rating.toFixed(1)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({host.reviewCount})
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-emerald-500" /> Earnings
            </span>
            <span className="text-lg font-bold">
              ${host.totalEarnings.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Car className="h-3 w-3 text-blue-500" /> Trips
            </span>
            <span className="text-lg font-bold">{host.totalTrips}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3 text-purple-500" /> Status
            </span>
            <span className="text-lg font-bold truncate capitalize">
              {host.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
