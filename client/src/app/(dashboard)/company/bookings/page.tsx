"use client";

import Link from "next/link";
import {
  Calendar,
  Car,
  Clock,
  Download,
  MapPin,
  RefreshCcw,
  Search,
  Wallet,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { type CompanyBooking, fetchCompanyBookings } from "@/lib/booking.api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingHistoryPageSkeleton } from "@/components/shared/bookings/booking-history-skeleton";

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "-";
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(value);
}

function getStatusStyle(status: CompanyBooking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "ACTIVE":
      return "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400";
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "CANCELLED":
      return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    case "DISPUTED":
      return "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400";
    case "COMPLETED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function MobileBookingCard({
  booking,
}: {
  booking: CompanyBooking;
}) {
  return (
    <div className="bg-card/95 shadow-sm p-4 border border-border/70 rounded-2xl">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {booking.customerName}
          </p>
          <p className="mt-1 text-muted-foreground text-xs truncate">
            {booking.vehicleName}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-full font-semibold shrink-0",
            getStatusStyle(booking.status),
          )}
        >
          {booking.status}
        </Badge>
      </div>

      <div className="gap-3 grid mt-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatDateRange(booking.startDate, booking.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{booking.pickupLocation}</span>
        </div>
        <div className="flex justify-between items-center gap-3">
          <span className="text-muted-foreground text-xs">
            ID: {booking.bookingId}
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(booking.totalAmount)}
          </span>
        </div>
      </div>

      <Button
        asChild
        className="bg-foreground hover:bg-foreground/90 mt-4 rounded-xl w-full h-10 text-background"
        size="sm"
      >
        <Link href={`/company/bookings/${encodeURIComponent(booking.bookingId)}`}>
          Detail
        </Link>
      </Button>
    </div>
  );
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<CompanyBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastCompletedRequestKey, setLastCompletedRequestKey] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const trimmedSearch = deferredSearchQuery.trim().toLowerCase();
  const requestKey = JSON.stringify({ reloadKey });
  const loading = requestKey !== lastCompletedRequestKey;
  const isFetching = loading && bookings.length === 0;

  useEffect(() => {
    let cancelled = false;

    fetchCompanyBookings({
      cacheKey: `company-bookings-${reloadKey}`,
    })
      .then((data) => {
        if (cancelled) return;
        setBookings(data);
        setError(null);
        setLastCompletedRequestKey(requestKey);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Failed to fetch company bookings",
        );
        setLastCompletedRequestKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, requestKey]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        !trimmedSearch ||
        booking.customerName.toLowerCase().includes(trimmedSearch) ||
        booking.vehicleName.toLowerCase().includes(trimmedSearch) ||
        booking.bookingId.toLowerCase().includes(trimmedSearch);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, statusFilter, trimmedSearch]);

  const refreshBookings = () => setReloadKey((value) => value + 1);

  const exportToCSV = () => {
    const headers = [
      "Booking ID",
      "Customer",
      "Vehicle",
      "Start Date",
      "End Date",
      "Amount",
      "Status",
    ];

    const rows = filteredBookings.map((booking) => [
      booking.bookingId,
      booking.customerName,
      booking.vehicleName,
      formatDate(booking.startDate),
      formatDate(booking.endDate),
      booking.totalAmount,
      booking.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(String).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "company-bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(135deg,color-mix(in_oklab,var(--background)_92%,white)_0%,color-mix(in_oklab,var(--background)_96%,var(--muted))_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.94)_100%)] shadow-sm p-4 sm:p-6 border border-border/70 rounded-[28px] overflow-hidden">
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-end gap-5">
          <div className="max-w-2xl">
            <Badge className="bg-foreground hover:bg-foreground px-3 py-1 rounded-full text-background">
              Company dashboard
            </Badge>
            <h2 className="mt-4 font-bold text-foreground text-2xl sm:text-3xl tracking-tight">
              Booking Management
            </h2>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              Keep reservation activity in view with faster loading, clearer
              filters, and quick access to every booking detail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={refreshBookings}
              disabled={loading}
              className="bg-background/70 border-border/70 rounded-2xl"
            >
              <RefreshCcw className="mr-2 w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {isFetching ? (
        <BookingHistoryPageSkeleton columns={6} rows={5} statCards={4} />
      ) : error ? (
        <div className="bg-red-500/10 p-6 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-center">
          <p>{error}</p>
          <Button variant="outline" onClick={refreshBookings} className="mt-4">
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-card/95 shadow-sm p-4 border border-border/70 rounded-2xl">
            <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
              <div className="flex sm:flex-row flex-col flex-1 sm:items-center gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by customer, vehicle, or booking ID..."
                    className="bg-background/70 pl-10 border-border/70 rounded-2xl h-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-background/70 border-border/70 rounded-2xl w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    <SelectItem value="DISPUTED">DISPUTED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-muted-foreground text-sm">
                {loading
                  ? "Refreshing bookings..."
                  : `${filteredBookings.length} matching bookings`}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "bg-card/95 shadow-sm p-4 border border-border/70 rounded-2xl transition-opacity",
              loading && "opacity-70",
            )}
          >
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 mb-4 text-muted-foreground text-sm">
              <span>Company booking history</span>
              <span>Updated from live booking records</span>
            </div>

            <div className="md:hidden gap-3 grid">
              {filteredBookings.length === 0 ? (
                <div className="bg-background/60 px-4 py-10 border border-border/70 rounded-2xl text-muted-foreground text-sm text-center">
                  No company bookings matched the current filters.
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <MobileBookingCard
                    key={booking.id}
                    booking={booking}
                  />
                ))
              )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-border/70">
                    <TableHead className="py-4">Customer</TableHead>
                    <TableHead className="py-4">Vehicle</TableHead>
                    <TableHead className="py-4">Dates</TableHead>
                    <TableHead className="py-4">Pickup</TableHead>
                    <TableHead className="py-4">Amount</TableHead>
                    <TableHead className="py-4">Status</TableHead>
                    <TableHead className="py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-16 text-muted-foreground text-center"
                      >
                        No company bookings matched the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="border-border/60">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex justify-center items-center bg-muted rounded-2xl w-10 h-10 font-semibold text-foreground">
                              {booking.customerName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {booking.customerName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                ID: {booking.bookingId}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-foreground">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {booking.vehicleName}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {formatDateRange(
                                booking.startDate,
                                booking.endDate,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Booked {formatDate(booking.createdAt)}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 text-muted-foreground text-sm">
                          {booking.pickupLocation}
                        </TableCell>

                        <TableCell className="py-4 font-semibold text-foreground">
                          {formatCurrency(booking.totalAmount)}
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full font-semibold",
                              getStatusStyle(booking.status),
                            )}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <div className="flex justify-end">
                            <Button
                              asChild
                              className="bg-foreground hover:bg-foreground/90 rounded-xl text-background"
                              size="sm"
                            >
                              <Link href={`/company/bookings/${encodeURIComponent(booking.bookingId)}`}>
                                Detail
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
