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
  RefreshCcw,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatWindow } from "@/components/shared/bookings/ChatWindow";
import { BookingHistoryPageSkeleton } from "@/components/shared/bookings/booking-history-skeleton";
import {
  fetchCompanyBookings,
  type CompanyBookingListItem,
  type RenterBookingStatus,
} from "@/lib/bookings-api";
import {
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

function paymentStateLabel(state: CompanyBookingListItem["paymentState"]) {
  switch (state) {
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
}

function vehicleName(booking: CompanyBookingListItem) {
  const vehicle = booking.vehicle;
  if (!vehicle) return "Vehicle unavailable";
  return [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ");
}

function renterName(booking: CompanyBookingListItem) {
  return booking.renter?.name || "Renter unavailable";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
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
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold text-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export function CompanyBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingReference = decodeURIComponent(String(params.bookingId || ""));
  const [booking, setBooking] = useState<CompanyBookingListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!bookingReference) return;

      if (mode === "initial") setIsLoading(true);
      if (mode === "refresh") setIsRefreshing(true);
      setError(null);

      try {
        const result = await fetchCompanyBookings(
          {
            search: bookingReference,
            page: 1,
            limit: 20,
          },
          {
            cacheKey: `company-booking-detail-${bookingReference}-${Date.now()}`,
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
          setError("Booking was not found for this company account.");
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BookingHistoryPageSkeleton columns={4} rows={3} statCards={4} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Unable to load booking
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {error || "Booking details are unavailable."}
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => router.push("/company/bookings")}>
            Back to bookings
          </Button>
        </div>
      </div>
    );
  }

  const chatAvailable = isChatAvailable(
    booking.status as UnifiedBookingStatus,
    booking.paymentState,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(135deg,color-mix(in_oklab,var(--background)_96%,white)_0%,color-mix(in_oklab,var(--background)_98%,var(--muted))_100%)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push("/company/bookings")}
              className="w-fit gap-2 rounded-2xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to bookings
            </Button>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn("font-medium", bookingStatusClasses(booking.status))}>
                  {bookingStatusLabel(booking.status)}
                </Badge>
                <Badge variant="outline" className="font-medium">
                  {paymentStateLabel(booking.paymentState)}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Booking {booking.bookingId}
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                A dedicated booking workspace with chat front and center, plus
                renter details, trip status, payment context, and lifecycle actions.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={refreshBooking}
            disabled={isRefreshing}
            className="gap-2 rounded-2xl"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
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
          value={renterName(booking)}
          note={booking.renter?.phone || booking.contactPhone || "No contact number"}
          icon={UserRound}
        />
        <StatCard
          title="Trip Dates"
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <MessageSquareText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Booking Chat
            </h2>
          </div>

          <div className="h-[72vh] min-h-[560px]">
            {chatAvailable ? (
              <ChatWindow
                bookingId={booking.id}
                bookingDisplayId={booking.bookingId}
                vehicleName={vehicleName(booking)}
                className="h-full rounded-[28px]"
                counterparty={{
                  name: renterName(booking),
                  role: "RENTER",
                }}
              />
            ) : (
              <Card className="flex h-full items-center justify-center rounded-[28px] border-border/70 border-2 border-dashed shadow-sm">
                <CardContent className="px-6 py-12 text-center">
                  <MessageSquareText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Chat unavailable
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    The conversation panel opens once the booking is confirmed and paid.
                    Until then, you can review the booking details and monitor its status.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Renter Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow label="Name" value={renterName(booking)} />
              <DetailRow
                label="Phone"
                value={booking.renter?.phone || booking.contactPhone || "Not provided"}
              />
              <DetailRow
                label="Email"
                value={booking.renter?.email || "Not provided"}
              />
              <DetailRow
                label="Last updated"
                value={formatDateTime(booking.updatedAt || booking.createdAt)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
