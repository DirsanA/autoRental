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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  UserCheck,
  ShieldCheck,
  Archive,
  ArrowUpCircle,
} from "lucide-react";
import { DisputeStatusBadge, DisputePriorityBadge, categoryLabel } from "./DisputeBadges";
import type { Dispute } from "./types";

interface DisputeTableProps {
  disputes: Dispute[];
  onView: (d: Dispute) => void;
  onAssign: (d: Dispute) => void;
  onResolve: (d: Dispute) => void;
  onEscalate: (d: Dispute) => void;
  onClose: (d: Dispute) => void;
}

const partyColors: Record<string, string> = {
  renter: "bg-blue-500",
  company: "bg-purple-500",
  p2p_host: "bg-teal-500",
  platform: "bg-gray-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DisputeTable({
  disputes,
  onView,
  onAssign,
  onResolve,
  onEscalate,
  onClose,
}: DisputeTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[140px]">Case #</TableHead>
            <TableHead>Title / Parties</TableHead>
            <TableHead className="w-[130px]">Category</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Priority</TableHead>
            <TableHead className="w-[130px]">Filed</TableHead>
            <TableHead className="w-[130px]">Assigned To</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-14 text-muted-foreground"
              >
                No disputes found matching the current filters.
              </TableCell>
            </TableRow>
          ) : (
            disputes.map((d) => (
              <TableRow
                key={d.id}
                className="group hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onView(d)}
              >
                {/* Case number */}
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">
                    {d.caseNumber}
                  </span>
                </TableCell>

                {/* Title + parties */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm leading-snug line-clamp-1">
                      {d.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback
                          className={`${partyColors[d.claimant.role]} text-white text-[9px]`}
                        >
                          {d.claimant.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{d.claimant.name}</span>
                      <span className="text-muted-foreground/40">vs</span>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback
                          className={`${partyColors[d.respondent.role]} text-white text-[9px]`}
                        >
                          {d.respondent.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{d.respondent.name}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <span className="text-xs text-muted-foreground font-medium bg-muted/60 rounded px-2 py-0.5 whitespace-nowrap">
                    {categoryLabel(d.category)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DisputeStatusBadge status={d.status} />
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <DisputePriorityBadge priority={d.priority} />
                </TableCell>

                {/* Filed date */}
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(d.createdAt)}
                </TableCell>

                {/* Assigned */}
                <TableCell className="text-sm text-muted-foreground">
                  {d.assignedTo ?? (
                    <span className="italic text-xs">Unassigned</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(d)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssign(d)}>
                        <UserCheck className="mr-2 h-4 w-4" /> Assign / Reassign
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {d.status !== "resolved" && d.status !== "closed" && (
                        <DropdownMenuItem onClick={() => onEscalate(d)}>
                          <ArrowUpCircle className="mr-2 h-4 w-4" /> Escalate
                        </DropdownMenuItem>
                      )}
                      {d.status !== "resolved" && d.status !== "closed" && (
                        <DropdownMenuItem
                          onClick={() => onResolve(d)}
                          className="text-green-600 focus:text-green-700"
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" /> Mark Resolved
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onClose(d)}
                        className="text-muted-foreground"
                      >
                        <Archive className="mr-2 h-4 w-4" /> Close Case
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
