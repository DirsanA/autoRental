import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { cn } from "@/lib/utils";
import { sampleBookings } from "./data";
import type { BookingStatus } from "./types";

function formatDateRange(startIso: string, endIso: string) {
  // Fixed locale+timezone for stable SSR hydration.
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

function statusBadgeVariant(
  status: BookingStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
    case "declined":
      return "destructive";
  }
}

function statusLabel(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "declined":
      return "Declined";
  }
}

export function PeerHostBookingHistoryPage() {
  // "Smart" page boundary: this component is pure UI and uses a single data source.
  // Later you can swap `sampleBookings` with fetched data and keep the UI intact.
  const bookings = sampleBookings;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Booking History</h2>
          <p className="text-sm text-muted-foreground">
            Past and upcoming bookings for your vehicles.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {bookings.map((b) => (
            <Card key={b.id} className="border-border/50">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{b.vehicleName}</CardTitle>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Guest: <span className="text-foreground">{b.guestName}</span>
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(b.status)}>
                    {statusLabel(b.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className={cn("grid gap-2 text-sm")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {formatDateRange(b.startDate, b.endDate)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="font-medium">{b.pickupLocation}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">${b.totalAmount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </div>
  );
}

