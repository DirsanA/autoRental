"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CarFront,
  MapPin,
  MessageSquareText,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sampleBookings } from "@/components/shared/bookings/data";
import type {
  Booking,
  BookingStatus,
} from "@/components/shared/bookings/types";

type BookingHistoryAudience = "renter" | "peerhost" | "company";

type ReviewDraft = {
  rating: number;
  comment: string;
  submittedAt?: string;
};

function formatDateRange(startIso: string, endIso: string) {
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

function formatSubmittedDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function bookingStatusLabel(status: BookingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusStyles(status: BookingStatus) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
    case "completed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30";
    case "cancelled":
    case "declined":
      return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
  }
}

export function BookingHistoryPage({
  audience = "peerhost",
}: {
  audience?: BookingHistoryAudience;
}) {
  const isRenter = audience === "renter";
  const isOperatorView = audience === "peerhost" || audience === "company";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewsByBookingId, setReviewsByBookingId] = useState<
    Record<string, ReviewDraft>
  >({});

  const bookings = useMemo(() => {
    return sampleBookings.filter((b) => {
      const matchesSearch =
        b.vehicleName.toLowerCase().includes(search.toLowerCase()) ||
        b.guestName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const selectedBooking =
    sampleBookings.find((booking) => booking.id === selectedBookingId) ?? null;

  const activeReview = selectedBooking
    ? reviewsByBookingId[selectedBooking.id] ?? {
        rating: selectedBooking.review?.rating ?? 0,
        comment: selectedBooking.review?.comment ?? "",
        submittedAt: selectedBooking.review?.submittedAt,
      }
    : { rating: 0, comment: "" };

  const canLeaveReview = isRenter && selectedBooking?.status === "completed";
  const hasSubmittedReview = Boolean(activeReview.submittedAt);
  const activeStars = hoveredRating ?? activeReview.rating;
  const reviewIsReady =
    activeReview.rating > 0 && activeReview.comment.trim().length >= 12;

  const openBookingDetail = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    setHoveredRating(null);
    setIsDetailOpen(true);
  };

  const handleReviewChange = (
    bookingId: string,
    updates: Partial<ReviewDraft>
  ) => {
    setReviewsByBookingId((prev) => {
      const current = prev[bookingId] ?? { rating: 0, comment: "" };

      return {
        ...prev,
        [bookingId]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  const handleReviewSubmit = () => {
    if (!selectedBooking || !reviewIsReady) {
      return;
    }

    setReviewsByBookingId((prev) => {
      const current = prev[selectedBooking.id] ?? { rating: 0, comment: "" };

      return {
        ...prev,
        [selectedBooking.id]: {
          ...current,
          submittedAt: new Date().toISOString(),
        },
      };
    });

    setHoveredRating(null);
  };

  return (
    <div className="flex flex-col flex-1 dark:bg-slate-950 overflow-hidden">
      <Header />

      <Main>
        <div className="mb-8">
          <h2 className="font-bold dark:text-white text-3xl tracking-tight">
            Booking History
          </h2>
          <p className="mt-2 text-muted-foreground dark:text-slate-400 text-sm">
            {isRenter
              ? "Open booking details and leave a rating after the trip is completed."
              : "Manage and review all bookings."}
          </p>
        </div>

        <Card className="dark:bg-slate-900 shadow-sm mb-6 p-6 border-border/50 dark:border-slate-800">
          <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
            <Input
              placeholder="Search by vehicle or guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dark:bg-slate-800 dark:border-slate-700 md:max-w-sm dark:placeholder:text-slate-500 dark:text-slate-200"
            />

            <div className="flex flex-wrap gap-2">
              {[
                "all",
                "pending",
                "confirmed",
                "completed",
                "cancelled",
                "declined",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status as BookingStatus | "all")
                  }
                  className={cn(
                    "px-3 py-1.5 border rounded-full text-xs transition-all",
                    statusFilter === status
                      ? "bg-primary text-primary-foreground border-primary dark:bg-primary dark:text-primary-foreground"
                      : "bg-muted/40 hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="dark:bg-slate-900 border border-border/50 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 dark:bg-slate-800/50">
              <tr className="text-left">
                <th className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-400">
                  Vehicle
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-400">
                  Guest
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-400">
                  Dates
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-400">
                  Pickup
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-400 text-right">
                  Total
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-400 text-right">
                  Detail
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-muted-foreground dark:text-slate-400 text-center"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}

              {bookings.map((b) => {
                const hasReview = Boolean(reviewsByBookingId[b.id]?.submittedAt);

                return (
                  <tr
                    key={b.id}
                    className="hover:bg-muted/30 dark:hover:bg-slate-800/50 border-border/50 dark:border-slate-800 border-t transition-colors"
                  >
                    <td className="px-6 py-4 font-medium dark:text-slate-200">
                      {b.vehicleName}
                    </td>

                    <td className="px-6 py-4 dark:text-slate-300">
                      {b.guestName}
                    </td>

                    <td className="px-6 py-4 dark:text-slate-300">
                      {formatDateRange(b.startDate, b.endDate)}
                    </td>

                    <td className="px-6 py-4 dark:text-slate-300">
                      {b.pickupLocation}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border font-medium text-xs",
                          statusStyles(b.status)
                        )}
                      >
                        {bookingStatusLabel(b.status)}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 font-semibold dark:text-slate-200 text-right">
                      ${b.totalAmount}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          onClick={() => openBookingDetail(b)}
                        >
                          Detail
                        </Button>
                        {isRenter && b.status === "completed" && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "border text-[10px]",
                              hasReview
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {hasReview ? "Reviewed" : "Can Review"}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Dialog
          open={isDetailOpen}
          onOpenChange={(open) => {
            setIsDetailOpen(open);
            if (!open) {
              setHoveredRating(null);
            }
          }}
        >
          {selectedBooking && (
            <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-3xl max-h-[90vh] dark:bg-slate-950 dark:border-slate-800 p-0 overflow-hidden">
              <DialogHeader className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 px-6 py-6 text-left">
                <DialogTitle className="text-white text-xl">
                  {selectedBooking.vehicleName}
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Booking detail, status, and review for {selectedBooking.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 p-6 max-h-[calc(90vh-110px)] overflow-y-auto">
                <div className="gap-4 grid md:grid-cols-2 xl:grid-cols-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-400 text-xs">
                      <CarFront className="w-4 h-4" />
                      Vehicle
                    </div>
                    <p className="mt-2 font-medium dark:text-slate-100 text-sm">
                      {selectedBooking.vehicleName}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-400 text-xs">
                      <UserRound className="w-4 h-4" />
                      Guest
                    </div>
                    <p className="mt-2 font-medium dark:text-slate-100 text-sm">
                      {selectedBooking.guestName}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-400 text-xs">
                      <CalendarDays className="w-4 h-4" />
                      Dates
                    </div>
                    <p className="mt-2 font-medium dark:text-slate-100 text-sm">
                      {formatDateRange(
                        selectedBooking.startDate,
                        selectedBooking.endDate
                      )}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-400 text-xs">
                      <Wallet className="w-4 h-4" />
                      Total
                    </div>
                    <p className="mt-2 font-medium dark:text-slate-100 text-sm">
                      ${selectedBooking.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-900/70 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="font-medium dark:text-slate-100 text-sm">
                      Booking Summary
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {[
                      ["Booking ID", selectedBooking.id],
                      ["Pickup location", selectedBooking.pickupLocation],
                      ["Status", bookingStatusLabel(selectedBooking.status)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 px-4 py-3"
                      >
                        <p className="text-muted-foreground dark:text-slate-400 text-xs">
                          {label}
                        </p>
                        <p className="font-medium dark:text-slate-100 text-sm">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {(isRenter || isOperatorView) && (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-slate-50 dark:bg-slate-900/70 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <MessageSquareText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <p className="font-semibold dark:text-slate-100 text-sm">
                            Rating & Review
                          </p>
                        </div>
                        <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs">
                          {canLeaveReview
                            ? "Completed booking. You can rate and review this car now."
                            : isOperatorView
                              ? "View the renter's rating and review for this booking here."
                              : "This booking must be completed before review is allowed."}
                        </p>
                      </div>

                      {hasSubmittedReview && activeReview.submittedAt && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                          Reviewed on {formatSubmittedDate(activeReview.submittedAt)}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-5 p-5">
                      {!canLeaveReview && !isOperatorView && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                          <p className="font-medium dark:text-slate-100 text-sm">
                            Review is locked for now
                          </p>
                          <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs leading-5">
                            Once this booking status changes to completed, the renter
                            can rate the car and write a review from this popup.
                          </p>
                        </div>
                      )}

                      {isOperatorView && (
                        <>
                          {selectedBooking.review || hasSubmittedReview ? (
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {Array.from({ length: 5 }, (_, index) => index + 1).map(
                                  (star) => (
                                    <div
                                      key={star}
                                      className={cn(
                                        "flex justify-center items-center rounded-xl w-11 h-11",
                                        star <= activeReview.rating
                                          ? "bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400"
                                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                      )}
                                    >
                                      <Star
                                        className={cn(
                                          "w-5 h-5",
                                          star <= activeReview.rating && "fill-current"
                                        )}
                                      />
                                    </div>
                                  )
                                )}
                                <Badge
                                  variant="outline"
                                  className="dark:border-slate-700 dark:text-slate-300"
                                >
                                  {activeReview.rating}/5 rating
                                </Badge>
                              </div>

                              <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <p className="text-muted-foreground dark:text-slate-400 text-xs">
                                  Renter review
                                </p>
                                <p className="mt-2 dark:text-slate-100 text-sm leading-6">
                                  {activeReview.comment}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                              <p className="font-medium dark:text-slate-100 text-sm">
                                No review yet
                              </p>
                              <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs leading-5">
                                This booking does not have a renter rating or review yet.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {canLeaveReview && (
                        <>
                          <div className="space-y-2">
                            <p className="font-medium dark:text-slate-100 text-sm">
                              Rate this car
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoveredRating(star)}
                                  onMouseLeave={() => setHoveredRating(null)}
                                  onClick={() =>
                                    handleReviewChange(selectedBooking.id, {
                                      rating: star,
                                    })
                                  }
                                  className={cn(
                                    "flex justify-center items-center rounded-xl w-11 h-11 transition-all",
                                    star <= activeStars
                                      ? "bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400"
                                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                  )}
                                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                >
                                  <Star
                                    className={cn(
                                      "w-5 h-5",
                                      star <= activeStars && "fill-current"
                                    )}
                                  />
                                </button>
                              ))}
                              <p className="text-muted-foreground dark:text-slate-400 text-xs">
                                {activeReview.rating > 0
                                  ? `${activeReview.rating}/5 selected`
                                  : "Choose rating"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-medium dark:text-slate-100 text-sm">
                              Write your review
                            </p>
                            <Textarea
                              value={activeReview.comment}
                              onChange={(e) =>
                                handleReviewChange(selectedBooking.id, {
                                  comment: e.target.value,
                                })
                              }
                              placeholder="Share the car condition, trip comfort, and your overall experience."
                              className="dark:bg-slate-900 dark:border-slate-700 min-h-32 dark:text-slate-100 dark:placeholder:text-slate-500"
                            />
                            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2">
                              <p className="text-muted-foreground dark:text-slate-400 text-xs">
                                Minimum 12 characters.
                              </p>
                              <p className="text-muted-foreground dark:text-slate-400 text-xs">
                                {activeReview.comment.trim().length} characters
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-400 text-xs">
                              <MapPin className="w-4 h-4" />
                              Review will be attached to booking {selectedBooking.id}
                            </div>
                            <Button
                              onClick={handleReviewSubmit}
                              disabled={!reviewIsReady}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {hasSubmittedReview ? "Update Review" : "Submit Review"}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </Main>
    </div>
  );
}
