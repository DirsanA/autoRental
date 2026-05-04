"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CarFront,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchRenterBookings,
  type RenterBookingListItem,
  type RenterBookingPaymentState,
  type RenterBookingsPagination,
  type RenterBookingStatus,
} from "@/lib/bookings-api";
import { cn } from "@/lib/utils";
import { RenterBookingFilters } from "./RenterBookingFilters";
import { ReportIssueModal } from "@/components/shared/report/ReportIssueModal";
import { AlertTriangle } from "lucide-react";

const PAGE_SIZE = 10;

function SummaryCard({
  title,
  value,
  icon: Icon,
  note,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  note: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "-";

  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
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

function paymentStateLabel(state: RenterBookingPaymentState) {
  switch (state) {
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
}

function bookingStatusClasses(status: RenterBookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ACTIVE":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "DISPUTED":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function paymentStateClasses(state: RenterBookingPaymentState) {
  switch (state) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function vehicleLabel(booking: RenterBookingListItem) {
  const vehicle = booking.vehicle;
  if (!vehicle) return "Vehicle unavailable";

  return [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ");
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function RenterBookingHistoryPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RenterBookingStatus | "all">(
    "all",
  );
  const [paymentFilter, setPaymentFilter] = useState<
    RenterBookingPaymentState | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [bookings, setBookings] = useState<RenterBookingListItem[]>([]);
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
    paymentFilter,
    page,
    reloadKey,
  });
  const loading = requestKey !== lastCompletedRequestKey;
  const isFetching = loading && bookings.length === 0;
  const displayedBookings = bookings;
  const tableRecordCount = displayedBookings.length;

  useEffect(() => {
    let cancelled = false;

    fetchRenterBookings({
      search: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      paymentState: paymentFilter === "all" ? undefined : paymentFilter,
      page,
      limit: PAGE_SIZE,
    })
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
            : "Failed to load booking history",
        );
        setLastCompletedRequestKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [page, paymentFilter, reloadKey, requestKey, search, statusFilter]);

  const refreshBookings = () => setReloadKey((value) => value + 1);

  const summary = useMemo(() => {
    const pendingBookings = displayedBookings.filter(
      (booking) => booking.status === "PENDING",
    ).length;
    const confirmedBookings = displayedBookings.filter(
      (booking) => booking.status === "CONFIRMED",
    ).length;
    const activeTrips = displayedBookings.filter(
      (booking) => booking.status === "ACTIVE",
    ).length;
    const paidBookings = displayedBookings.filter(
      (booking) => booking.paymentState === "paid",
    ).length;
    const completedTrips = displayedBookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;

    return {
      pendingBookings,
      confirmedBookings,
      activeTrips,
      paidBookings,
      completedTrips,
    };
  }, [displayedBookings]);

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <Main className="gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Booking History
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Review your live renter bookings, payment progress, and trip
              details from one place.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              title="Total Bookings"
              value={pagination.total}
              icon={CarFront}
              note="All matching records"
              loading={isFetching}
            />
            <SummaryCard
              title="Pending Bookings"
              value={summary.pendingBookings}
              icon={CalendarDays}
              note={`Confirmed ${summary.confirmedBookings} | Active ${summary.activeTrips}`}
              loading={isFetching}
            />
            <SummaryCard
              title="Paid Bookings"
              value={summary.paidBookings}
              icon={Wallet}
              note={`Completed ${summary.completedTrips}`}
              loading={isFetching}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <RenterBookingFilters
              search={searchInput}
              onSearchChange={setSearchInput}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              paymentFilter={paymentFilter}
              onPaymentFilterChange={(value) => {
                setPaymentFilter(value);
                setPage(1);
              }}
            />

            <Button
              variant="outline"
              onClick={refreshBookings}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Showing {tableRecordCount} records on this page (out of {pagination.total} total)
            </div>
            <div>
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center rounded-xl border bg-card p-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
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
              <div className={cn("rounded-xl border bg-card shadow-sm transition-opacity", loading && "opacity-50")}>
                <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <span>Booking records (Page {pagination.page})</span>
                </div>
                <Table className="min-w-[1100px] overflow-y-scroll">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[150px]">Booking ID</TableHead>
                      <TableHead className="w-[220px]">Vehicle</TableHead>
                      <TableHead className="w-[220px]">Trip Window</TableHead>
                      <TableHead className="w-[180px]">
                        Pickup / Return
                      </TableHead>
                      <TableHead className="w-[150px]">Payment</TableHead>
                      <TableHead className="w-[140px]">Status</TableHead>
                      <TableHead className="w-[150px]">Booked On</TableHead>
                      <TableHead className="w-[140px]">Total</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="py-14 text-center text-muted-foreground"
                        >
                          No bookings matched the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedBookings.map((booking) => (
                        <TableRow key={booking.id} className="align-top">
                          <TableCell>
                            <div className="font-medium">
                              {booking.bookingId}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {booking.contactPhone || "No contact"}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-medium">
                              {vehicleLabel(booking)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Plate {booking.vehicle?.plate || "unavailable"}
                            </div>
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateRange(
                              booking.startTime,
                              booking.endTime,
                            )}
                          </TableCell>

                          <TableCell className="text-sm">
                            <div>{booking.pickupAddress || "Not provided"}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Return: {booking.returnAddress || "Not provided"}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                paymentStateClasses(booking.paymentState),
                              )}
                            >
                              {paymentStateLabel(booking.paymentState)}
                            </Badge>
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

                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(booking.createdAt)}
                          </TableCell>

                          <TableCell className="font-medium">
                            {formatCurrency(
                              booking.pricing.totalAmount,
                              booking.pricing.currency,
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <ReportIssueModal 
                                subjectId={booking.id}
                                subjectModel="Booking"
                                trigger={
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="sr-only">Report Booking</span>
                                  </Button>
                                }
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/renter/booking-history/${booking.id}`,
                                  )
                                }
                              >
                                View details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={loading || pagination.page <= 1}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
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
