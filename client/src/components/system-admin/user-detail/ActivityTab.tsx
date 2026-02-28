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
import { Activity, Fingerprint } from "lucide-react";
import type { UserActivity } from "./types";

interface ActivityTabProps {
  activities: UserActivity[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
        <Activity className="h-10 w-10 opacity-20 mb-3" />
        <h3 className="text-lg font-medium text-foreground">
          No Activity Recorded
        </h3>
        <p className="text-sm">
          User hasn&apos;t performed any logged actions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border/50">
        <Fingerprint className="h-5 w-5 text-primary" />
        <p className="font-medium text-foreground">Audit Log</p>
        <p className="mx-2">/</p>
        <p>Recent administrative actions executed by this user.</p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module</TableHead>
              <TableHead className="text-right">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act) => (
              <TableRow key={act.id} className="hover:bg-muted/50">
                <TableCell className="text-sm font-medium whitespace-nowrap">
                  {new Date(act.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm font-semibold max-w-[300px] truncate">
                  {act.action}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal text-xs">
                    {act.module}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {act.ipAddress}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
