"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, LockKeyhole, Laptop } from "lucide-react";
import type { SecurityEvent } from "./types";
import { cn } from "@/lib/utils";

interface SecurityTabProps {
  events: SecurityEvent[];
}

export function SecurityTab({ events }: SecurityTabProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
        <Shield className="h-10 w-10 opacity-20 mb-3" />
        <h3 className="text-lg font-medium text-foreground">
          No Security Events Found
        </h3>
        <p className="text-sm">
          This account has no logged security incidents.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border/50">
        <LockKeyhole className="h-5 w-5 text-amber-500" />
        <p className="font-medium text-foreground">Security Log</p>
        <p className="mx-2">/</p>
        <p>
          Login events, authentications, and sensitive account modifications.
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((evt) => (
              <TableRow key={evt.id} className="hover:bg-muted/50">
                <TableCell className="text-sm font-medium whitespace-nowrap">
                  {new Date(evt.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm font-semibold max-w-[300px] truncate">
                  {evt.event}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {evt.location}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground flex items-center gap-1.5 min-w-[200px]">
                  <Laptop className="h-3 w-3" />
                  {evt.device}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal border-0 capitalize px-2 py-0.5",
                      evt.status === "success" && "bg-green-100 text-green-800",
                      evt.status === "failed" && "bg-red-100 text-red-800",
                      evt.status === "warning" && "bg-amber-100 text-amber-800",
                    )}
                  >
                    {evt.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
