"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWindow } from "@/components/shared/bookings/ChatWindow";
import { LifecycleActions } from "@/components/shared/bookings/LifecycleActions";
import { MessageSquareText } from "lucide-react";

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

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

function paymentStateLabel(state: PeerHostBookingListItem["paymentState"]) {
  switch (state) {
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
}

function SummaryCard({
  title,
  value,
  note,
  icon: Icon,
  accentClassName,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ElementType;
  accentClassName: string;
}) {
  return (
    <Card className="bg-card/95 shadow-sm border-border/70 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="font-medium text-muted-foreground text-sm">
              {title}
            </CardTitle>
            <p className="mt-2 font-bold text-foreground text-2xl sm:text-3xl tracking-tight">
              {value}
            </p>
          </div>
          <div className={cn("shadow-sm p-3 rounded-2xl text-white", accentClassName)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-xs">{note}</p>
      </CardContent>
    </Card>
  );
}

function vehicleName(booking: PeerHostBookingListItem) {
  const vehicle = booking.vehicle;
  if (!vehicle) return "Vehicle unavailable";

  return [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ");
}

function guestName(booking: PeerHostBookingListItem) {
  return booking.renter?.name || "Guest unavailable";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-1 py-3 border-border/60 border-b last:border-b-0">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}

function MobileBookingCard({
  booking,
  onOpen,
}: {
  booking: PeerHostBookingListItem;
  onOpen: (booking: PeerHostBookingListItem) => void;
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
          <span className="text-xs">Plate {booking.vehicle?.plate || "N/A"}</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(
              booking.pricing.totalAmount,
              booking.pricing.currency,
            )}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpen(booking)}
        className="bg-background/70 mt-4 border-border/70 rounded-xl w-full h-10"
      >
        Detail
      </Button>
    </div>
  );
}

export function PeerHostBookingHistoryPage() {
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
  const [selectedBooking, setSelectedBooking] =
    useState<PeerHostBookingListItem | null>(null);

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

    fetchPeerHostBookings({
      search: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      page,
      limit: PAGE_SIZE,
    }, {
      cacheKey: `peerhost-bookings-${search}-${statusFilter}-${page}-${reloadKey}`,
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
            : "Failed to load peerhost booking history",
        );
        setLastCompletedRequestKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, requestKey, search, statusFilter]);

  const refreshBookings = () => setReloadKey((value) => value + 1);
  const summary = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === "PENDING").length;
    const confirmed = bookings.filter(
      (booking) => booking.status === "CONFIRMED",
    ).length;
    const completed = bookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;
    const pageRevenue = bookings.reduce(
      (sum, booking) => sum + booking.pricing.totalAmount,
      0,
    );

    return {
      pending,
      confirmed,
      completed,
      pageRevenue,
    };
  }, [bookings]);

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
                  Showing {bookings.length} records on this page (out of {pagination.total} total)
                </div>
                <div>
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              </div>

              <div className={cn("bg-card/95 shadow-sm border border-border/70 rounded-2xl transition-opacity", loading && "opacity-70")}>
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
                        onOpen={setSelectedBooking}
                      />
                    ))
                  )}
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[240px]">Vehicle Name</TableHead>
                        <TableHead className="w-[220px]">Guest Name</TableHead>
                        <TableHead className="w-[240px]">Dates</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="w-[140px]">Total</TableHead>
                        <TableHead className="w-[120px] text-right">Detail</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-14 text-muted-foreground text-center">
                            No bookings matched the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking) => (
                          <TableRow key={booking.id} className="border-border/60 align-top">
                            <TableCell>
                              <div className="font-medium">{vehicleName(booking)}</div>
                              <div className="mt-1 text-muted-foreground text-xs">
                                {booking.vehicle?.plate ? `Plate ${booking.vehicle.plate}` : "Plate unavailable"}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="font-medium">{guestName(booking)}</div>
                              <div className="mt-1 text-muted-foreground text-xs">
                                {booking.renter?.phone || booking.contactPhone || "No contact"}
                              </div>
                            </TableCell>

                            <TableCell className="text-muted-foreground text-sm">
                              {formatDateRange(booking.startTime, booking.endTime)}
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
                                onClick={() => setSelectedBooking(booking)}
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

      <Dialog
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
          }
        }}
      >
        {selectedBooking ? (
          <DialogContent className="bg-background p-0 border-border/70 w-[calc(100vw-1rem)] sm:w-full sm:max-w-2xl overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 px-5 sm:px-6 py-5 sm:py-6 text-left">
              <DialogTitle className="text-white text-xl">{vehicleName(selectedBooking)}</DialogTitle>
              <DialogDescription className="text-slate-300">
                Booking {selectedBooking.bookingId} for {guestName(selectedBooking)}
              </DialogDescription>
            </DialogHeader>

            <div className="h-[700px] overflow-hidden p-4 sm:p-6">
              <Tabs defaultValue="details" className="flex h-full flex-col">
                <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted/60 p-1">
                  <TabsTrigger value="details">Booking Details</TabsTrigger>
                  <TabsTrigger value="chat" className="gap-2">
                    Live Chat & Process
                    {(selectedBooking.status === "CONFIRMED" ||
                      selectedBooking.status === "ACTIVE") && (
                      <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="details"
                  className="flex-1 space-y-4 overflow-y-auto pr-1 mt-0 sm:space-y-6"
                >
                  <div className="gap-3 grid sm:grid-cols-2 md:grid-cols-3">
                <div className="bg-muted/30 p-4 border border-border/70 rounded-2xl">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <UserRound className="w-4 h-4" />
                    Guest
                  </div>
                  <p className="mt-2 font-medium text-sm">{guestName(selectedBooking)}</p>
                </div>

                <div className="bg-muted/30 p-4 border border-border/70 rounded-2xl">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <CalendarDays className="w-4 h-4" />
                    Dates
                  </div>
                  <p className="mt-2 font-medium text-sm">
                    {formatDateRange(selectedBooking.startTime, selectedBooking.endTime)}
                  </p>
                </div>

                <div className="bg-muted/30 p-4 border border-border/70 rounded-2xl">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Wallet className="w-4 h-4" />
                    Total
                  </div>
                  <p className="mt-2 font-medium text-sm">
                    {formatCurrency(
                      selectedBooking.pricing.totalAmount,
                      selectedBooking.pricing.currency,
                    )}
                  </p>
                </div>
              </div>

              <div className="px-4 border border-border/70 rounded-2xl">
                <DetailRow label="Status" value={bookingStatusLabel(selectedBooking.status)} />
                <DetailRow
                  label="Payment"
                  value={paymentStateLabel(selectedBooking.paymentState)}
                />
                <DetailRow
                  label="Booked on"
                  value={formatDateTime(selectedBooking.createdAt)}
                />
                <DetailRow
                  label="Pickup"
                  value={selectedBooking.pickupAddress || "Not provided"}
                />
                <DetailRow
                  label="Return"
                  value={selectedBooking.returnAddress || "Not provided"}
                />
                <DetailRow
                  label="Guest email"
                  value={selectedBooking.renter?.email || "Not provided"}
                />
              </div>
            </TabsContent>

                <TabsContent value="chat" className="flex-1 overflow-hidden space-y-6">
                  {selectedBooking.status === "CONFIRMED" ||
                  selectedBooking.status === "ACTIVE" ||
                  selectedBooking.status === "COMPLETED" ? (
                    <div className="grid gap-6 lg:grid-cols-[1fr_250px] h-full overflow-hidden">
                      <ChatWindow bookingId={selectedBooking.id} className="h-full" />
                      <div className="space-y-6 overflow-y-auto pr-1">
                        <LifecycleActions 
                          booking={selectedBooking} 
                          userType="provider" 
                          onRefresh={refreshBookings} 
                        />
                      </div>
                    </div>
                  ) : (
                    <Card className="p-12 text-center border-2 border-dashed border-zinc-200">
                      <MessageSquareText className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                      <h3 className="font-bold text-lg uppercase text-zinc-400">Chat Unavailable</h3>
                      <p className="text-sm text-zinc-500">
                        The chat room will open once the booking is confirmed.
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
