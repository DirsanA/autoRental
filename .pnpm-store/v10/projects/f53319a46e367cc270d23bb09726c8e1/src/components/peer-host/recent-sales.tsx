import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type BookingItem = {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
};

interface RecentBookingProps {
  bookings?: BookingItem[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function RecentBooking({ bookings = [] }: RecentBookingProps) {
  if (bookings.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground dark:text-slate-400">
        No recent bookings found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="w-9 h-9">
            <AvatarFallback>{getInitials(booking.customerName)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 ml-4">
            <p className="font-medium text-sm leading-none">{booking.customerName}</p>
            <p className="text-muted-foreground text-sm">{booking.customerEmail}</p>
          </div>
          <div className="ml-auto font-medium">+{formatCurrency(booking.amount)}</div>
        </div>
      ))}
    </div>
  );
}
