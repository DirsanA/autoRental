"use client";

import { BookingChatInbox } from "@/components/shared/bookings/BookingChatInbox";
import { fetchCompanyBookings } from "@/lib/booking.api";

export default function CompanyMessagesPage() {
  const loadBookings = async () => {
    return await fetchCompanyBookings();
  };

  return (
    <div className="flex flex-col h-screen p-2 lg:p-4 overflow-hidden bg-muted/5">
      <BookingChatInbox userType="provider" fetchBookings={loadBookings} />
    </div>
  );
}
