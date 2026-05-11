"use client";

import { BookingChatInbox } from "@/components/shared/bookings/BookingChatInbox";
import { fetchRenterBookings } from "@/lib/bookings-api";

export default function RenterMessagesPage() {
  const loadBookings = async () => {
    const result = await fetchRenterBookings({ limit: 100 });
    return result.bookings;
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-muted/5 p-3 md:p-4">
      <BookingChatInbox userType="renter" fetchBookings={loadBookings} />
    </div>
  );
}
