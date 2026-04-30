"use client";
import {
  Search,
  Filter,
  Check,
  X,
  Clock,
  Calendar,
  User,
  Car,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Star,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchCompanyBookings,
  approveBooking,
  rejectBooking,
  CompanyBooking,
  normalizeStatus,
} from "@/lib/booking.api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatSubmittedDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default function BookingManagement() {
  const [bookings, setBookings] = useState<CompanyBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<CompanyBooking | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchCompanyBookings();
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    loadBookings();
  }, []);
  const getStatusStyle = (status: CompanyBooking["status"]) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const openBookingDetail = (booking: CompanyBooking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };
  const filteredBookings = bookings.filter((b) => {
  const matchesSearch =
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bookingId.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesStatus =
    statusFilter === "all" || b.status === statusFilter;

  return matchesSearch && matchesStatus;
});
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

  const rows = filteredBookings.map((b) => [
    b.bookingId,
    b.customerName,
    b.vehicleName,
    formatDate(b.startDate),
    formatDate(b.endDate),
    b.totalAmount,
    b.status,
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.map(String).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "bookings.csv");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-2xl">
            Booking Management
          </h2>
          <p className="text-slate-500">
            Review and manage vehicle reservation requests.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 p-4 border-slate-100 border-b">
          <div className="relative w-full sm:w-64">
            <Search
              className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm transition-all"
            />
          </div>
          <div className="flex sm:flex-row flex-col gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 hover:bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 text-sm transition-colors">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </button>
            <button onClick={exportToCSV} className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl font-medium text-white text-sm transition-colors">
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-slate-100 border-b">
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs text-right uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-slate-100 rounded-full w-10 h-10 font-bold text-slate-600">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {booking.customerName}
                        </p>
                        <p className="text-slate-500 text-xs">
                          ID: {booking.bookingId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-700 text-sm">
                        {booking.vehicleName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600 text-xs">
                        <Calendar size={14} />
                        <span>
                          {formatDate(booking.startDate)} →{" "}
                          {formatDate(booking.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock size={12} />
                        <span>Booked on {formatDate(booking.createdAt)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 text-sm">
                      ${booking.totalAmount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            className="bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg text-emerald-600 transition-colors"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="bg-rose-50 hover:bg-rose-100 p-2 rounded-lg text-rose-600 transition-colors"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button className="hover:bg-slate-100 p-2 rounded-lg text-slate-400 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                      <button
                        onClick={() => openBookingDetail(booking)}
                        className="bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg font-semibold text-white text-xs transition-colors"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-4 border-slate-100 border-t">
          <p className="font-medium text-slate-500 text-xs">
            Showing 2 of 2 bookings
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg font-bold text-slate-400 text-xs cursor-not-allowed">
              Previous
            </button>
            <button className="hover:bg-white px-3 py-1 border border-slate-200 rounded-lg font-bold text-slate-600 text-xs transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedBooking && (
          <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden border-slate-200">
            <DialogHeader className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-6 text-left">
              <DialogTitle className="text-white text-xl">
                {selectedBooking.vehicleName}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Booking detail and customer review for {selectedBooking.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 p-6 max-h-[calc(90vh-110px)] overflow-y-auto">
              <div className="gap-4 grid md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <User size={14} />
                    Customer
                  </div>
                  <p className="mt-2 font-semibold text-slate-900 text-sm">
                    {selectedBooking.customerName}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Car size={14} />
                    Vehicle
                  </div>
                  <p className="mt-2 font-semibold text-slate-900 text-sm">
                    {selectedBooking.vehicleName}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Calendar size={14} />
                    Trip dates
                  </div>
                  <p className="mt-2 font-semibold text-slate-900 text-sm">
                    {formatDate(selectedBooking.startDate)} →{" "}
                    {formatDate(selectedBooking.endDate)}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Wallet size={14} />
                    Amount
                  </div>
                  <p className="mt-2 font-semibold text-slate-900 text-sm">
                    ${selectedBooking.totalAmount}
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-slate-100 border-b">
                  <p className="font-semibold text-slate-900 text-sm">
                    Booking Summary
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    ["Booking ID", selectedBooking.bookingId],
                    ["Status", selectedBooking.status],
                    ["Pickup location", selectedBooking.pickupLocation],
                    ["Booked on", formatDate(selectedBooking.createdAt)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 px-4 py-3"
                    >
                      <p className="text-slate-500 text-xs">{label}</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-slate-50 px-4 py-4 border-slate-100 border-b">
                  <div>
                    <div className="flex items-center gap-2">
                      <MessageSquareText size={16} className="text-blue-600" />
                      <p className="font-semibold text-slate-900 text-sm">
                        Customer Rating & Review
                      </p>
                    </div>
                    <p className="mt-1 text-slate-500 text-xs">
                      Review stays visible here for completed bookings.
                    </p>
                  </div>

                  {selectedBooking.review?.submittedAt && (
                    <span className="bg-emerald-500 px-3 py-1 rounded-full font-semibold text-white text-xs">
                      Reviewed on{" "}
                      {formatSubmittedDate(selectedBooking.review.submittedAt)}
                    </span>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  {selectedBooking.review ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        {Array.from({ length: 5 }, (_, index) => index + 1).map(
                          (star) => (
                            <div
                              key={star}
                              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                star <= selectedBooking.review!.rating
                                  ? "bg-amber-100 text-amber-500"
                                  : "bg-slate-100 text-slate-300"
                              }`}
                            >
                              <Star
                                size={18}
                                className={
                                  star <= (selectedBooking.review?.rating || 0)
                                    ? "fill-current"
                                    : ""
                                }
                              />
                            </div>
                          ),
                        )}
                        <span className="px-3 py-1 border border-slate-200 rounded-full font-semibold text-slate-700 text-xs">
                          {selectedBooking.review?.rating || 0}/5 rating
                        </span>
                      </div>

                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                        <p className="font-medium text-slate-500 text-xs">
                          Customer comment
                        </p>
                        <p className="mt-2 text-slate-800 text-sm leading-6">
                          {selectedBooking.review?.comment || "No comment"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                      <p className="font-semibold text-slate-900 text-sm">
                        No review yet
                      </p>
                      <p className="mt-1 text-slate-500 text-xs leading-5">
                        This booking does not have a rating or review from the
                        customer yet.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <MapPin size={14} />
                    Review is linked to booking {selectedBooking.bookingId}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
