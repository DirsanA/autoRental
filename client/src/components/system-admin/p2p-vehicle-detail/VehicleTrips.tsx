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
import { Button } from "@/components/ui/button";
import { Eye, Map, Star } from "lucide-react";
import type { VehicleTrip } from "./types";
import { cn } from "@/lib/utils";

interface VehicleTripsProps {
  trips: VehicleTrip[];
}

export function VehicleTrips({ trips }: VehicleTripsProps) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
        <Map className="h-10 w-10 opacity-20 mb-3" />
        <h3 className="text-lg font-medium text-foreground">No Trips Found</h3>
        <p className="text-sm">This vehicle has not been booked yet.</p>
      </div>
    );
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead>Renter</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((t) => (
            <TableRow key={t.id} className="hover:bg-muted/50 group">
              <TableCell className="font-medium">{t.renterName}</TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {fmtDate(t.startDate)} - {fmtDate(t.endDate)}
              </TableCell>
              <TableCell className="font-semibold tabular-nums">
                ${t.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                {t.rating ? (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {t.rating}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground uppercase opacity-50">
                    N/A
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-normal border-0 capitalize",
                    t.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : t.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : t.status === "upcoming"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-red-100 text-red-800",
                  )}
                >
                  {t.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-60 group-hover:opacity-100"
                  title="View Trip Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
