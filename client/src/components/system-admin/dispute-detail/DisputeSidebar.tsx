"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  MoreVertical,
  UserCheck,
  ArrowUpCircle,
  ShieldCheck,
  Archive,
  DollarSign,
  FileText,
  Tag,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DisputeStatusBadge,
  DisputePriorityBadge,
  categoryLabel,
} from "@/components/system-admin/dispute-management/DisputeBadges";
import type { Dispute } from "@/components/system-admin/dispute-management/types";

interface DisputeSidebarProps {
  dispute: Dispute;
  onAssign: () => void;
  onResolve: () => void;
  onEscalate: () => void;
  onClose: () => void;
}

const roleColors: Record<string, string> = {
  renter: "bg-blue-500",
  company: "bg-purple-500",
  p2p_host: "bg-teal-500",
  platform: "bg-gray-500",
};

const roleLabels: Record<string, string> = {
  renter: "Renter",
  company: "Company",
  p2p_host: "P2P Host",
  platform: "Platform",
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

export function DisputeSidebar({
  dispute,
  onAssign,
  onResolve,
  onEscalate,
  onClose,
}: DisputeSidebarProps) {
  const isActionable =
    dispute.status !== "resolved" && dispute.status !== "closed";

  return (
    <Card className="shadow-sm sticky top-24 overflow-hidden border-t-4 border-t-orange-500">
      {/* Action Menu */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onAssign}>
              <UserCheck className="mr-2 h-4 w-4" /> Assign / Reassign
            </DropdownMenuItem>
            {isActionable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEscalate}>
                  <ArrowUpCircle className="mr-2 h-4 w-4" /> Escalate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onResolve}
                  className="text-green-600 focus:text-green-700"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Mark Resolved
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onClose}
              className="text-muted-foreground"
            >
              <Archive className="mr-2 h-4 w-4" /> Close Case
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="pt-8 pb-6 flex flex-col gap-5">
        {/* Case number + status */}
        <div className="flex flex-col items-center text-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {dispute.caseNumber}
          </span>
          <DisputeStatusBadge status={dispute.status} />
          <div className="mt-1">
            <DisputePriorityBadge priority={dispute.priority} />
          </div>
        </div>

        <div className="w-full border-t border-muted" />

        {/* Parties */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Parties
          </span>
          {[
            { party: dispute.claimant, label: "Claimant" },
            { party: dispute.respondent, label: "Respondent" },
          ].map(({ party, label }) => (
            <div key={party.id} className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-white text-xs",
                    roleColors[party.role] ?? "bg-gray-400"
                  )}
                >
                  {party.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{party.name}</span>
                <span className="text-xs text-muted-foreground flex gap-1 items-center">
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 h-4 font-normal"
                  >
                    {roleLabels[party.role]}
                  </Badge>
                  <span className="truncate">{label}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full border-t border-muted" />

        {/* Case details */}
        <div className="flex flex-col gap-3.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Case Details
          </span>
          <InfoRow icon={Tag} label="Category" value={categoryLabel(dispute.category)} />
          {dispute.bookingRef && (
            <InfoRow icon={FileText} label="Booking Ref" value={dispute.bookingRef} />
          )}
          {dispute.amountClaimed !== undefined && (
            <InfoRow
              icon={DollarSign}
              label="Amount Claimed"
              value={`${dispute.currency ?? "USD"} ${dispute.amountClaimed.toLocaleString()}`}
            />
          )}
          <InfoRow
            icon={Calendar}
            label="Filed On"
            value={new Date(dispute.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          />
          <InfoRow
            icon={User}
            label="Assigned To"
            value={dispute.assignedTo ?? <span className="italic text-muted-foreground">Unassigned</span>}
          />
          {dispute.resolvedAt && (
            <InfoRow
              icon={ShieldCheck}
              label="Resolved On"
              value={new Date(dispute.resolvedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            />
          )}
        </div>

        {/* Quick action buttons */}
        {isActionable && (
          <>
            <div className="w-full border-t border-muted" />
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30"
                onClick={onResolve}
              >
                <ShieldCheck className="h-4 w-4" /> Mark Resolved
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                onClick={onEscalate}
              >
                <ArrowUpCircle className="h-4 w-4" /> Escalate
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
