"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sampleBookings } from "./data";
import type { BookingStatus } from "./types";

function formatDateRange(startIso: string, endIso: string) {
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };

  const start = new Date(startIso).toLocaleDateString("en-US", opts);
  const end = new Date(endIso).toLocaleDateString("en-US", opts);

  return `${start} → ${end}`;
}

function statusStyles(status: BookingStatus) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "cancelled":
    case "declined":
      return "bg-red-500/10 text-red-600 border-red-500/20";
  }
}

export function PeerHostBookingHistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );

  const bookings = useMemo(() => {
    return sampleBookings.filter((b) => {
      const matchesSearch =
        b.vehicleName.toLowerCase().includes(search.toLowerCase()) ||
        b.guestName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />

      <Main>
        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <h2 className="font-bold text-3xl tracking-tight">
            Booking History
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage and review all bookings across your vehicles.
          </p>
        </div>

        {/* ===== FILTERS ===== */}
        <Card className="shadow-sm mb-6 p-6 border-border/50">
          <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
            {/* Search */}
            <Input
              placeholder="Search by vehicle or guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:max-w-sm"
            />

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "confirmed", "completed", "cancelled", "declined"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(status as BookingStatus | "all")
                    }
                    className={cn(
                      "px-3 py-1.5 border rounded-full text-xs transition-all",
                      statusFilter === status
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 hover:bg-muted"
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
        </Card>

        {/* ===== TABLE ===== */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-6 py-4 font-medium text-muted-foreground">
                  Vehicle
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground">
                  Guest
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground">
                  Dates
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground">
                  Pickup
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-muted-foreground text-center"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}

              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-muted/30 border-border/50 border-t transition-colors"
                >
                  <td className="px-6 py-4 font-medium">
                    {b.vehicleName}
                  </td>

                  <td className="px-6 py-4">
                    {b.guestName}
                  </td>

                  <td className="px-6 py-4">
                    {formatDateRange(b.startDate, b.endDate)}
                  </td>

                  <td className="px-6 py-4">
                    {b.pickupLocation}
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border font-medium text-xs",
                        statusStyles(b.status),
                      )}
                    >
                      {b.status.charAt(0).toUpperCase() +
                        b.status.slice(1)}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 font-semibold text-right">
                    ${b.totalAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Main>
    </div>
  );
}