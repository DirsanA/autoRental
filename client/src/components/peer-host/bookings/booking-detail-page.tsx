"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CreditCard,
  Loader2,
  MessageSquareText,
  Phone,
  RefreshCcw,
  UserRound,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWindow } from "@/components/shared/bookings/ChatWindow";
import {
  activateOwnedBooking,
  confirmOwnedBookingReturn,
  fetchPeerHostBookings,
  type PeerHostBookingListItem,
  type RenterBookingStatus,
} from "@/lib/bookings-api";
import {
  getDepositStatusDisplay,
  isChatAvailable,
  type UnifiedBookingStatus,
} from "@/lib/booking-types-unified";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium sm:max-w-[65%] sm:text-right">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ElementType;
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
        <div className="text-xl font-semibold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export function PeerHostBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingReference = String(params.bookingId || "");
  const [booking, setBooking] = useState<PeerHostBookingListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutatingBooking, setIsMutatingBooking] = useState(false);

  const loadBooking = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!bookingReference) return;

      if (mode === "initial") setIsLoading(true);
      if (mode === "refresh") setIsRefreshing(true);
      setError(null);

      try {
        const result = await fetchPeerHostBookings(
          {
            search: bookingReference,
            page: 1,
            limit: 20,
          },
          {
            cacheKey: `peerhost-booking-detail-${bookingReference}-${Date.now()}`,
          },
        );

        const nextBooking =
          result.bookings.find(
            (item) =>
              item.id === bookingReference ||
              item.bookingId.toLowerCase() === bookingReference.toLowerCase(),
          ) || result.bookings[0] || null;

        if (!nextBooking) {
          setBooking(null);
          setError("Booking was not found for this peer-host account.");
          return;
        }

        setBooking(nextBooking);
      } catch (cause) {
        setBooking(null);
        setError(
          cause instanceof Error
            ? cause.message
            : "Failed to load booking details.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [bookingReference],
  );

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const refreshBooking = useCallback(() => {
    void loadBooking("refresh");
  }, [loadBooking]);

  const handleActivateBooking = async () => {
    if (!booking) return;

    const originalDocsChecked = booking.withDriver
      ? false
      : window.confirm(
          "Confirm that you physically checked the renter's original ID and driving license before starting this self-drive trip.",
        );

    if (!booking.withDriver && !originalDocsChecked) return;

    try {
      setIsMutatingBooking(true);
      const updated = await activateOwnedBooking({
        bookingId: booking.bookingId,
        ownerType: "User",
        originalDocsChecked,
      });
      setBooking({
        ...booking,
        ...updated,
        renter: booking.renter,
      });
    } finally {
      setIsMutatingBooking(false);
    }
  };

  const handleReturnConfirmation = async (
    returnCondition: "CLEAN" | "ISSUE_REPORTED",
  ) => {
    if (!booking) return;

    const reason =
      returnCondition === "ISSUE_REPORTED"
        ? window.prompt("Describe the issue reported for this return.") ||
          undefined
        : undefined;

    try {
      setIsMutatingBooking(true);
      const updated = await confirmOwnedBookingReturn({
        bookingId: booking.bookingId,
        ownerType: "User",
        returnCondition,
        reason,
      });
      setBooking({
        ...booking,
        ...updated,
        renter: booking.renter,
      });
    } finally {
      setIsMutatingBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="items-center justify-center">
          <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Unable to load booking</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || "Booking details are unavailable."}
            </p>
            <div className="mt-5 flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/peerhost/booking-history")}
              >
                Back to booking history
              </Button>
            </div>
          </div>
        </Main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main className="gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push("/peerhost/booking-history")}
              className="w-fit gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to booking history
            </Button>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Booking {booking.bookingId}
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Review renter details, trip timing, payment status, chat, and
                pickup or return actions from one dedicated workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn("font-medium", bookingStatusClasses(booking.status))}
              >
                {bookingStatusLabel(booking.status)}
              </Badge>
              <Badge variant="outline" className="font-medium">
                {paymentStateLabel(booking.paymentState)}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={refreshBooking}
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Vehicle"
            value={vehicleName(booking)}
            note={booking.vehicle?.plate ? `Plate ${booking.vehicle.plate}` : "Plate unavailable"}
            icon={CarFront}
          />
          <StatCard
            title="Renter"
            value={guestName(booking)}
            note={booking.renter?.phone || booking.contactPhone || "No contact"}
            icon={UserRound}
          />
          <StatCard
            title="Dates"
            value={formatDateRange(booking.startTime, booking.endTime)}
            note={`Booked ${formatDateTime(booking.createdAt)}`}
            icon={CalendarDays}
          />
          <StatCard
            title="Total"
            value={formatCurrency(booking.pricing.totalAmount, booking.pricing.currency)}
            note={`${formatCurrency(booking.pricing.rentalSubtotal, booking.pricing.currency)} rental subtotal`}
            icon={CreditCard}
          />
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted/60 p-1">
            <TabsTrigger value="details">Booking Details</TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              Live Chat & Process
              {(booking.status === "CONFIRMED" || booking.status === "ACTIVE") && (
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Renter
                </CardTitle>
              </CardHeader>
              <CardContent className="rounded-lg border p-5">
                <DetailRow label="Name" value={guestName(booking)} />
                <DetailRow
                  label="Phone"
                  value={booking.renter?.phone || booking.contactPhone || "Not provided"}
                />
                <DetailRow
                  label="Email"
                  value={booking.renter?.email || "Not provided"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Payment and Deposit
                </CardTitle>
              </CardHeader>
              <CardContent className="rounded-lg border p-5">
                <DetailRow
                  label="Rental subtotal"
                  value={formatCurrency(
                    booking.pricing.rentalSubtotal,
                    booking.pricing.currency,
                  )}
                />
                <DetailRow
                  label="System commission"
                  value={formatCurrency(
                    booking.pricing.systemCommission,
                    booking.pricing.currency,
                  )}
                />
                <DetailRow
                  label="Security deposit"
                  value={formatCurrency(
                    booking.securityDepositAmount || 0,
                    booking.pricing.currency,
                  )}
                />
                <DetailRow
                  label="Deposit status"
                  value={getDepositStatusDisplay(booking.depositStatus)}
                />
                <DetailRow
                  label="Total paid"
                  value={formatCurrency(
                    booking.pricing.totalAmount,
                    booking.pricing.currency,
                  )}
                />
                <DetailRow label="Payment" value={paymentStateLabel(booking.paymentState)} />
                <DetailRow label="Transaction ref" value={booking.payment.txRef || "-"} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-0 h-[calc(100vh-320px)] min-h-[520px]">
            {isChatAvailable(
              booking.status as UnifiedBookingStatus,
              booking.paymentState,
            ) ? (
              <div className="flex h-full flex-col gap-4 overflow-hidden">
                {(booking.status === "CONFIRMED" &&
                  booking.paymentState === "paid") ||
                booking.status === "ACTIVE" ? (
                  <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Trip actions</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Keep the booking status aligned after pickup or return.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {booking.status === "CONFIRMED" &&
                      booking.paymentState === "paid" ? (
                        <Button
                          onClick={() => void handleActivateBooking()}
                          disabled={isMutatingBooking}
                        >
                          {isMutatingBooking
                            ? "Starting..."
                            : "Verify Pickup & Start Trip"}
                        </Button>
                      ) : null}
                      {booking.status === "ACTIVE" ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() =>
                              void handleReturnConfirmation("ISSUE_REPORTED")
                            }
                            disabled={isMutatingBooking}
                          >
                            Report Issue
                          </Button>
                          <Button
                            onClick={() =>
                              void handleReturnConfirmation("CLEAN")
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
                  </div>
                ) : null}
                <ChatWindow bookingId={booking.id} className="min-h-0 flex-1" />
              </div>
            ) : (
              <Card className="border-2 border-dashed p-12 text-center">
                <MessageSquareText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-bold uppercase">
                  Chat Unavailable
                </h3>
                <p className="text-sm text-muted-foreground">
                  The chat room will open once the booking is confirmed.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </div>
  );
}
