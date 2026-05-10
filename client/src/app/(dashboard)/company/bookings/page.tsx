"use client";

import {
  Calendar,
  Car,
  Clock,
  Download,
  MapPin,
  RefreshCcw,
  Search,
  User,
  Wallet,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { type CompanyBooking, fetchCompanyBookings } from "@/lib/booking.api";
import {
  activateOwnedBooking,
  confirmOwnedBookingReturn,
} from "@/lib/bookings-api";
import {
  isChatAvailable,
  getDepositStatusDisplay,
  type UnifiedBookingStatus,
} from "@/lib/booking-types-unified";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWindow } from "@/components/shared/bookings/ChatWindow";
import { LifecycleActions } from "@/components/shared/bookings/LifecycleActions";
import { MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function formatRelativeTimestamp(value?: string | null) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusStyle(status: CompanyBooking["status"]) {
  switch (status) {
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "rejected":
      return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    case "completed":
      return "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function SummaryCard({
  title,
  value,
  note,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-card/95 shadow-sm p-4 border border-border/70 rounded-2xl">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="mt-2 font-bold text-foreground text-2xl sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">{note}</p>
        </div>
        <div className={cn("shadow-sm p-3 rounded-2xl text-white", accent)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function BookingMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-1 py-3 border-border/70 border-b last:border-b-0">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold text-foreground text-sm">{value}</p>
    </div>
  );
}

function MobileBookingCard({
  booking,
  onOpen,
}: {
  booking: CompanyBooking;
  onOpen: (booking: CompanyBooking) => void;
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
            "rounded-full font-semibold capitalize shrink-0",
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
        onClick={() => onOpen(booking)}
        className="bg-foreground hover:bg-foreground/90 mt-4 rounded-xl w-full h-10 text-background"
        size="sm"
      >
        Detail
      </Button>
    </div>
  );
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<CompanyBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<CompanyBooking | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastCompletedRequestKey, setLastCompletedRequestKey] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isMutatingBooking, setIsMutatingBooking] = useState(false);
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

  const summary = useMemo(() => {
    const pending = filteredBookings.filter(
      (booking) => booking.status === "pending",
    ).length;
    const approved = filteredBookings.filter(
      (booking) => booking.status === "approved",
    ).length;
    const completed = filteredBookings.filter(
      (booking) => booking.status === "completed",
    ).length;
    const revenue = filteredBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0,
    );

    return {
      total: filteredBookings.length,
      pending,
      approved,
      completed,
      revenue,
    };
  }, [filteredBookings]);

  const openBookingDetail = (booking: CompanyBooking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const refreshBookings = () => setReloadKey((value) => value + 1);

  const handleActivateBooking = async (booking: CompanyBooking) => {
    const originalDocsChecked = booking.withDriver
      ? false
      : window.confirm(
          "Confirm that the renter's original documents were checked physically before starting this self-drive trip.",
        );

    if (!booking.withDriver && !originalDocsChecked) {
      return;
    }

    try {
      setIsMutatingBooking(true);
      await activateOwnedBooking({
        bookingId: booking.bookingId,
        ownerType: "Company",
        originalDocsChecked,
      });
      setIsDetailOpen(false);
      refreshBookings();
    } finally {
      setIsMutatingBooking(false);
    }
  };

  const handleReturnConfirmation = async (
    booking: CompanyBooking,
    returnCondition: "CLEAN" | "ISSUE_REPORTED",
  ) => {
    const reason =
      returnCondition === "ISSUE_REPORTED"
        ? window.prompt("Describe the issue reported for this return.") ||
          undefined
        : undefined;

    try {
      setIsMutatingBooking(true);
      await confirmOwnedBookingReturn({
        bookingId: booking.bookingId,
        ownerType: "Company",
        returnCondition,
        reason,
      });
      setIsDetailOpen(false);
      refreshBookings();
    } finally {
      setIsMutatingBooking(false);
    }
  };

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
            <Button
              onClick={exportToCSV}
              className="bg-foreground hover:bg-foreground/90 rounded-2xl text-background"
            >
              <Download className="mr-2 w-4 h-4" />
              Export CSV
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                    onOpen={openBookingDetail}
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
                              "rounded-full font-semibold capitalize",
                              getStatusStyle(booking.status),
                            )}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <div className="flex justify-end">
                            <Button
                              onClick={() => openBookingDetail(booking)}
                              className="bg-foreground hover:bg-foreground/90 rounded-xl text-background"
                              size="sm"
                            >
                              Detail
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedBooking ? (
          <DialogContent className="bg-background p-0 border-border/70 w-[calc(100vw-1rem)] sm:w-full sm:max-w-5xl h-[calc(100vh-2rem)] max-h-[900px] overflow-hidden flex flex-col">
            <DialogHeader className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-5 sm:px-6 py-5 sm:py-6 text-left">
              <DialogTitle className="text-white text-xl">
                {selectedBooking.vehicleName}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Booking {selectedBooking.bookingId} for{" "}
                {selectedBooking.customerName}
              </DialogDescription>
            </DialogHeader>

            <div className="h-[700px] overflow-hidden p-4 sm:p-6">
              <Tabs defaultValue="details" className="flex h-full flex-col">
                <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted/60 p-1">
                  <TabsTrigger value="details">Booking Details</TabsTrigger>
                  <TabsTrigger value="chat" className="gap-2">
                    Live Chat & Process
                    {isChatAvailable(
                      selectedBooking.rawStatus as UnifiedBookingStatus,
                      selectedBooking.paymentState,
                    ) && (
                      <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="details"
                  className="flex-1 space-y-4 overflow-y-auto pr-1 mt-0 sm:space-y-6"
                >
                  <div className="gap-3 grid sm:grid-cols-2 xl:grid-cols-4">
                    <div className="bg-muted/30 p-4 border border-border/70 rounded-2xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <User className="w-4 h-4" />
                        Customer
                      </div>
                      <p className="mt-2 font-semibold text-foreground text-sm">
                        {selectedBooking.customerName}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-4 border border-border/70 rounded-2xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Car className="w-4 h-4" />
                        Vehicle
                      </div>
                      <p className="mt-2 font-semibold text-foreground text-sm">
                        {selectedBooking.vehicleName}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-4 border border-border/70 rounded-2xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="w-4 h-4" />
                        Trip dates
                      </div>
                      <p className="mt-2 font-semibold text-foreground text-sm">
                        {formatDateRange(
                          selectedBooking.startDate,
                          selectedBooking.endDate,
                        )}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-4 border border-border/70 rounded-2xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Wallet className="w-4 h-4" />
                        Amount
                      </div>
                      <p className="mt-2 font-semibold text-foreground text-sm">
                        {formatCurrency(selectedBooking.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 border border-border/70 rounded-2xl">
                    <BookingMetaRow
                      label="Booking ID"
                      value={selectedBooking.bookingId}
                    />
                    <BookingMetaRow
                      label="Status"
                      value={selectedBooking.status}
                    />
                    <BookingMetaRow
                      label="Pickup location"
                      value={selectedBooking.pickupLocation}
                    />
                    <BookingMetaRow
                      label="Booked on"
                      value={formatRelativeTimestamp(selectedBooking.createdAt)}
                    />
                    <BookingMetaRow
                      label="Customer email"
                      value={selectedBooking.customerEmail || "Not provided"}
                    />
                    <BookingMetaRow
                      label="Customer phone"
                      value={selectedBooking.customerPhone || "Not provided"}
                    />
                    <BookingMetaRow
                      label="Booking mode"
                      value={
                        selectedBooking.withDriver
                          ? "With driver"
                          : "Self-drive"
                      }
                    />
                    <BookingMetaRow
                      label="Security deposit"
                      value={formatCurrency(
                        selectedBooking.securityDepositAmount || 0,
                      )}
                    />
                    <BookingMetaRow
                      label="Deposit status"
                      value={getDepositStatusDisplay(
                        selectedBooking.depositStatus,
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    {selectedBooking.rawStatus === "CONFIRMED" &&
                    selectedBooking.paymentState === "paid" ? (
                      <Button
                        onClick={() =>
                          void handleActivateBooking(selectedBooking)
                        }
                        disabled={isMutatingBooking}
                      >
                        {isMutatingBooking
                          ? "Starting..."
                          : "Verify Pickup & Start Trip"}
                      </Button>
                    ) : null}
                    {selectedBooking.rawStatus === "CONFIRMED" &&
                    selectedBooking.paymentState === "paid" &&
                    !selectedBooking.withDriver &&
                    !selectedBooking.originalDocsChecked ? (
                      <p className="text-xs text-muted-foreground">
                        Self-drive bookings must be verified physically before
                        activation.
                      </p>
                    ) : null}
                    {selectedBooking.rawStatus === "ACTIVE" ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            void handleReturnConfirmation(
                              selectedBooking,
                              "ISSUE_REPORTED",
                            )
                          }
                          disabled={isMutatingBooking}
                        >
                          Report Issue
                        </Button>
                        <Button
                          onClick={() =>
                            void handleReturnConfirmation(
                              selectedBooking,
                              "CLEAN",
                            )
                          }
                          disabled={isMutatingBooking}
                        >
                          {isMutatingBooking
                            ? "Saving..."
                            : "Confirm Clean Return"}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </TabsContent>

                <TabsContent
                  value="chat"
                  className="flex-1 overflow-hidden space-y-6"
                >
                  {isChatAvailable(
                    selectedBooking.rawStatus as UnifiedBookingStatus,
                    selectedBooking.paymentState,
                  ) ? (
                    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] h-full overflow-hidden">
                      <ChatWindow
                        bookingId={selectedBooking.id}
                        className="h-full"
                        counterparty={{
                          name: selectedBooking.customerName || "Renter",
                          role: "RENTER",
                        }}
                      />
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
                      <h3 className="font-bold text-lg uppercase text-zinc-400">
                        Chat Unavailable
                      </h3>
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
