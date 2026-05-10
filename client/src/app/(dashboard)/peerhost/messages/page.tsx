"use client";

import { BookingChatInbox } from "@/components/shared/bookings/BookingChatInbox";
import { fetchPeerHostBookings } from "@/lib/bookings-api";

export default function PeerHostMessagesPage() {
  const loadBookings = async () => {
    const result = await fetchPeerHostBookings({ limit: 100 });
    return result.bookings;
  };

  return (
    <div className="flex flex-col h-screen p-2 lg:p-4 overflow-hidden bg-muted/5">
      <BookingChatInbox userType="provider" fetchBookings={loadBookings} />
    </div>
  );
}
