"use client";

import { useCallback, useState, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import { MessageSquareText, Search, User, Car, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type BookingChatItem = {
  id: string;
  bookingId: string;
  status: string;
  startTime?: string | null;
  startDate?: string | null;
  vehicleName?: string | null;
  customerName?: string | null;
  contactPhone?: string | null;
  renter?: {
    name?: string | null;
    profilePicture?: string | null;
    avatarUrl?: string | null;
  } | null;
  company?: {
    name?: string | null;
    logoUrl?: string | null;
    profilePicture?: string | null;
  } | null;
  vehicle?: {
    make?: string | null;
    model?: string | null;
    imageUrl?: string | null;
    host?: {
      name?: string | null;
      profilePicture?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
};

interface BookingChatInboxProps {
  userType: "renter" | "provider";
  fetchBookings: () => Promise<BookingChatItem[]>;
}

export function BookingChatInbox({ userType, fetchBookings }: BookingChatInboxProps) {
  const [bookings, setBookings] = useState<BookingChatItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingChatItem | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [visitedBookingIds, setVisitedBookingIds] = useState<Set<string>>(new Set());

  const loadBookings = useCallback(async () => {
    try {
      const data = await fetchBookings();
      // Filter for chat-eligible bookings
      const eligible = data.filter((b) =>
        ["CONFIRMED", "ACTIVE", "COMPLETED", "approved", "completed"].includes(b.status)
      );
      setBookings(eligible);
      setSelectedBooking((current) => current ?? eligible[0] ?? null);
    } catch (err) {
      console.error("Failed to load inbox bookings", err);
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = bookings.filter((b) => {
    const searchStr = search.toLowerCase();
    const vehicleName = (b.vehicleName || `${b.vehicle?.make || ""} ${b.vehicle?.model || ""}`).toLowerCase();
    const customerName = (b.customerName || b.renter?.name || "").toLowerCase();
    return vehicleName.includes(searchStr) || customerName.includes(searchStr) || b.bookingId.toLowerCase().includes(searchStr);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full h-full grid grid-cols-1 lg:grid-cols-[340px_1fr] border rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Sidebar List */}
      <div className="border-r flex flex-col bg-muted/10 min-h-0">
        <div className="p-4 border-b bg-background">
          <h2 className="text-lg font-semibold mb-4 tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-primary" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search chats..." 
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 font-bold uppercase text-xs">
                No active chats found
              </div>
            ) : (
              filteredBookings.map((booking, idx) => (
                <button
                  key={booking.id}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setVisitedBookingIds(prev => new Set(prev).add(booking.id));
                  }}
                  className={cn(
                    "w-full p-4 text-left transition-all hover:bg-accent flex items-start gap-3 group relative border-b last:border-b-0",
                    selectedBooking?.id === booking.id ? "bg-accent" : "bg-transparent"
                  )}
                >
                  {selectedBooking?.id === booking.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="w-12 h-12 rounded-lg bg-muted border flex items-center justify-center shrink-0 overflow-hidden">
                    {booking.vehicle?.imageUrl ? (
                      <img src={booking.vehicle.imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm truncate tracking-tight text-foreground">
                        {booking.vehicleName || `${booking.vehicle?.make} ${booking.vehicle?.model}`}
                      </h4>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {booking.startTime || booking.startDate
                          ? format(new Date(booking.startTime || booking.startDate || ""), "MMM d")
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-muted-foreground truncate flex items-center gap-1 uppercase tracking-wider">
                        <User className="w-3 h-3" />
                        {userType === "provider" ? (booking.customerName || booking.renter?.name) : "Vehicle Owner"}
                      </p>
                      <span className="text-[10px] font-medium text-zinc-300">/</span>
                      <span className="text-[10px] font-bold text-primary/70 tracking-tighter">#{booking.bookingId}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={cn(
                        "text-[9px] font-bold px-2 py-0 border-none shadow-none uppercase tracking-tighter",
                        booking.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      )}>
                        {booking.status}
                      </Badge>
                      {/* Small circle indicator for new activity */}
                      {idx % 3 === 0 && !visitedBookingIds.has(booking.id) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm ring-2 ring-background" />
                      )}
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform mt-4",
                    selectedBooking?.id === booking.id && "text-primary translate-x-1"
                  )} />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col min-h-0 bg-muted/5 relative overflow-hidden">
        {selectedBooking ? (
          <div className="flex flex-col h-full overflow-hidden p-4 gap-4">
            {/* Header */}
            <div className="p-4 border rounded-lg bg-background shadow-sm flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-muted border flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-none tracking-tight text-foreground">
                    {selectedBooking.vehicleName || `${selectedBooking.vehicle?.make} ${selectedBooking.vehicle?.model}`}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-muted/50 border-none">
                      BOOKING #{selectedBooking.bookingId}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ChatWindow
                bookingId={selectedBooking.id}
                bookingDisplayId={selectedBooking.bookingId}
                vehicleName={selectedBooking.vehicleName || `${selectedBooking.vehicle?.make} ${selectedBooking.vehicle?.model}`}
                className="h-full rounded-lg shadow-none"
                counterparty={
                  userType === "provider"
                    ? {
                        name: selectedBooking.customerName || selectedBooking.renter?.name || "Renter",
                        role: "RENTER",
                        avatar: selectedBooking.renter?.profilePicture || selectedBooking.renter?.avatarUrl,
                      }
                    : {
                        name: selectedBooking.vehicle?.host?.name || selectedBooking.company?.name || "Host",
                        role: selectedBooking.company ? "COMPANY" : "HOST",
                        avatar:
                          selectedBooking.company?.logoUrl ||
                          selectedBooking.company?.profilePicture ||
                          selectedBooking.vehicle?.host?.profilePicture ||
                          selectedBooking.vehicle?.host?.avatarUrl,
                      }
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-3xl border-4 border-black border-dashed flex items-center justify-center mb-4">
              <MessageSquareText className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">No Chat Selected</h3>
            <p className="text-sm text-zinc-500 font-medium max-w-xs">
              Select a booking from the sidebar to start coordinating with the other party.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
