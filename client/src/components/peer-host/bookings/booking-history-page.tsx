"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Phone,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
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
import {
  fetchPeerHostBookings,
  type PeerHostBookingListItem,
  type RenterBookingsPagination,
  type RenterBookingStatus,
} from "@/lib/bookings-api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "-";

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return `${new Date(start).toLocaleDateString("en-US", options)} - ${new Date(end).toLocaleDateString("en-US", options)}`;
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function bookingStatusLabel(status: RenterBookingStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function bookingStatusClasses(status: RenterBookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "ACTIVE":
      return "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400";
    case "COMPLETED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "CANCELLED":
      return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    case "DISPUTED":
      return "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400";
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
}

function vehicleName(booking: PeerHostBookingListItem) {
  const vehicle = booking.vehicle;
  if (!vehicle) return "Vehicle unavailable";

  return [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ");
}

function guestName(booking: PeerHostBookingListItem) {
  return booking.renter?.name || "Guest unavailable";
}

function MobileBookingCard({
  booking,
  detailHref,
}: {
  booking: PeerHostBookingListItem;
  detailHref: string;
}) {
  return (
    <div className="bg-card/95 shadow-sm p-4 border border-border/70 rounded-2xl">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {vehicleName(booking)}
          </p>
          <p className="mt-1 text-muted-foreground text-xs truncate">
            {guestName(booking)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-full font-semibold shrink-0",
            bookingStatusClasses(booking.status),
          )}
        >
          {bookingStatusLabel(booking.status)}
        </Badge>
      </div>

      <div className="gap-3 grid mt-4 text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>{formatDateRange(booking.startTime, booking.endTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="truncate">
            {booking.renter?.phone || booking.contactPhone || "No contact"}
          </span>
        </div>
        <div className="flex justify-between items-center gap-3">
          <span className="text-xs">
            Plate {booking.vehicle?.plate || "N/A"}
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(
              booking.pricing.totalAmount,
              booking.pricing.currency,
            )}
          </span>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="bg-background/70 mt-4 border-border/70 rounded-xl w-full h-10"
      >
        <Link href={detailHref}>Detail</Link>
      </Button>
    </div>
  );
}

export function PeerHostBookingHistoryPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RenterBookingStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [bookings, setBookings] = useState<PeerHostBookingListItem[]>([]);
  const [pagination, setPagination] = useState<RenterBookingsPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [lastCompletedRequestKey, setLastCompletedRequestKey] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const requestKey = JSON.stringify({
    search,
    statusFilter,
    page,
    reloadKey,
  });
  const loading = requestKey !== lastCompletedRequestKey;
  const isFetching = loading && bookings.length === 0;

  useEffect(() => {
    let cancelled = false;

    fetchPeerHostBookings(
      {
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: PAGE_SIZE,
      },
      {
        cacheKey: `peerhost-bookings-${search}-${statusFilter}-${page}-${reloadKey}`,
      },
    )
      .then((result) => {
        if (cancelled) return;
        setBookings(result.bookings);
        setPagination(result.pagination);
        setError(null);
        setLastCompletedRequestKey(requestKey);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Failed to load peerhost booking history",
        );
        setLastCompletedRequestKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, requestKey, search, statusFilter]);

  const refreshBookings = () => setReloadKey((value) => value + 1);
  const detailHref = (booking: PeerHostBookingListItem) =>
    `/peerhost/booking-history/${encodeURIComponent(booking.bookingId || booking.id)}`;

  return (
    <div className="relative flex w-full h-dvh">
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <Main className="gap-6 p-4 md:p-6 lg:p-8">
          {isFetching ? (
            <BookingHistoryPageSkeleton columns={6} rows={5} statCards={4} />
          ) : error ? (
            <div className="bg-red-500/10 p-6 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center">
              <div>{error}</div>
              <Button
                variant="outline"
                onClick={refreshBookings}
                className="mt-4"
              >
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
                        placeholder="Search by vehicle or guest..."
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        className="bg-background/70 pl-10 border-border/70 rounded-2xl h-10"
                      />
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value as RenterBookingStatus | "all");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="bg-background/70 border-border/70 rounded-2xl sm:w-[180px] h-10">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="DISPUTED">Disputed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-muted-foreground text-sm">
                    {loading
                      ? "Refreshing bookings..."
                      : `Showing ${bookings.length} records on this page`}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 text-muted-foreground text-sm">
                <div>
                  Showing {bookings.length} records on this page (out of{" "}
                  {pagination.total} total)
                </div>
                <div>
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              </div>

              <div
                className={cn(
                  "bg-card/95 shadow-sm border border-border/70 rounded-2xl transition-opacity",
                  loading && "opacity-70",
                )}
              >
                <div className="flex justify-between items-center px-4 py-4 border-border/70 border-b text-muted-foreground text-sm">
                  <span>Peerhost booking records</span>
                  <span>Fast cached fetch with live filters</span>
                </div>
                <div className="md:hidden gap-3 grid p-4">
                  {bookings.length === 0 ? (
                    <div className="bg-background/60 px-4 py-10 border border-border/70 rounded-2xl text-muted-foreground text-sm text-center">
                      No bookings matched the current filters.
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <MobileBookingCard
                        key={booking.id}
                        booking={booking}
                        detailHref={detailHref(booking)}
                      />
                    ))
                  )}
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[240px]">
                          Vehicle Name
                        </TableHead>
                        <TableHead className="w-[220px]">Guest Name</TableHead>
                        <TableHead className="w-[240px]">Dates</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="w-[140px]">Total</TableHead>
                        <TableHead className="w-[120px] text-right">
                          Detail
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-14 text-muted-foreground text-center"
                          >
                            No bookings matched the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking) => (
                          <TableRow
                            key={booking.id}
                            className="border-border/60 align-top"
                          >
                            <TableCell>
                              <div className="font-medium">
                                {vehicleName(booking)}
                              </div>
                              <div className="mt-1 text-muted-foreground text-xs">
                                {booking.vehicle?.plate
                                  ? `Plate ${booking.vehicle.plate}`
                                  : "Plate unavailable"}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="font-medium">
                                {guestName(booking)}
                              </div>
                              <div className="mt-1 text-muted-foreground text-xs">
                                {booking.renter?.phone ||
                                  booking.contactPhone ||
                                  "No contact"}
                              </div>
                            </TableCell>

                            <TableCell className="text-muted-foreground text-sm">
                              {formatDateRange(
                                booking.startTime,
                                booking.endTime,
                              )}
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-medium",
                                  bookingStatusClasses(booking.status),
                                )}
                              >
                                {bookingStatusLabel(booking.status)}
                              </Badge>
                            </TableCell>

                            <TableCell className="font-medium">
                              {formatCurrency(
                                booking.pricing.totalAmount,
                                booking.pricing.currency,
                              )}
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(detailHref(booking))}
                                className="bg-background/70 border-border/70"
                              >
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={loading || pagination.page <= 1}
                >
                  Previous
                </Button>

                <span className="text-muted-foreground text-sm">
                  {pagination.total === 0
                    ? "No results"
                    : `Page ${pagination.page} of ${pagination.totalPages}`}
                </span>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1),
                    )
                  }
                  disabled={
                    loading ||
                    pagination.total === 0 ||
                    pagination.page >= pagination.totalPages
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </Main>
      </div>

    </div>
  );
}
