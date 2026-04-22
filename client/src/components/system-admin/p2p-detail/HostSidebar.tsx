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
  CheckCircle2,
  Ban,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { HostStatus } from "./types";

interface HostSidebarProps {
  host: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    joinDate: string;
    status: HostStatus;
    verificationLevel: string;
    accountStatus: string;
  };
  canPromote: boolean;
  blockers: string[];
  onApprove: () => void;
  onReject: () => void;
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
  canPromote,
  blockers,
  onApprove,
  onReject,
}: HostSidebarProps) {
  const status = statusConfig[host.status];
  const StatusIcon = status.icon;

  const initials = host.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isPending = host.status === "pending";

  return (
    <Card className="shadow-sm sticky top-24 overflow-hidden border-t-4 border-t-primary">
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

        {isPending && (
          <>
            <div className="w-full border-t border-muted my-6" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={onApprove}
                disabled={!canPromote}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="h-4 w-4" />
                Promote to Peer Host
              </Button>
              <Button
                onClick={onReject}
                variant="outline"
                className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ThumbsDown className="h-4 w-4" />
                Reject Application
              </Button>
            </div>

            {blockers.length > 0 && (
              <div className="mt-4 w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                <p className="font-semibold">Promotion blockers</p>
                <div className="mt-2 space-y-1">
                  {blockers.map((blocker) => (
                    <p key={blocker}>{blocker}</p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="w-full border-t border-muted my-6" />

        {/* Host Stats */}
        <div className="grid grid-cols-2 gap-4 w-full text-left">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Verification Level
            </span>
            <span className="text-sm font-bold">
              {host.verificationLevel.replaceAll("_", " ")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Account Status
            </span>
            <span className="text-sm font-bold capitalize">
              {host.accountStatus.toLowerCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
