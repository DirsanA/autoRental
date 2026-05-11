"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CarFront,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquareText,
  PencilLine,
  Phone,
  RefreshCcw,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import MapSection from "@/components/MapSection";
import {
  createBookingReview,
  deleteBookingReview,
  fetchBookingDetail,
  fetchBookingReviews,
  updateBookingReview,
} from "@/lib/booking-detail-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWindow } from "@/components/shared/bookings/ChatWindow";

interface BookingDetail {
  id: string;
  bookingId: string;
  status: BookingStatus;
  paymentState: BookingPaymentState;
  startTime: string;
  endTime: string;
  withDriver: boolean;
  contactPhone: string;
  pickupAddress: string | null;
  returnAddress: string | null;
  pricing: {
    pricePerHour: number;
    rentalSubtotal: number;
    totalHours: number;
    systemCommission: number;
    totalAmount: number;
    currency: string;
  };
  securityDepositAmount: number;
  depositStatus:
    | "NOT_REQUIRED"
    | "HELD_IN_ESCROW"
    | "REFUNDED_TO_RENTER"
    | "RELEASED_TO_OWNER"
    | "UNDER_REVIEW";
  pickupVerifiedAt: string | null;
  pickupVerifiedBy: string | null;
  originalDocsChecked: boolean;
  manualDocumentHoldNote: string | null;
  returnConfirmedAt: string | null;
  returnConfirmedBy: string | null;
  returnCondition: "CLEAN" | "ISSUE_REPORTED" | null;
  payment: {
    method: string | null;
    status: string;
    paidAt: string | null;
    txRef?: string | null;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    plate: string;
    imageUrl: string | null;
    availability?: string | null;
    delivery?: string | null;
    ownerType?: string | null;
    pickupAddress?: string | null;
    returnAddress?: string | null;
    pickupGeo?: { lat: number; lng: number; precision?: string } | null;
    returnGeo?: { lat: number; lng: number; precision?: string } | null;
  } | null;
  createdAt: string | null;
  updatedAt?: string | null;
}

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

type BookingPaymentState = "pending" | "paid" | "failed";

interface Review {
  id: string;
  bookingId: string | null;
  reviewerId: string | null;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string | null;
  updatedAt: string | null;
  isOwner: boolean;
  reviewer: {
    id: string;
    name: string;
    profilePicture: string | null;
  } | null;
  target: {
    id: string;
    make: string | null;
    model: string | null;
    year: number | null;
    plate: string | null;
  } | null;
}

type ReviewDraft = {
  rating: number;
  comment: string;
};

const EMPTY_REVIEW_DRAFT: ReviewDraft = {
  rating: 0,
  comment: "",
};

function formatDateTime(dateString?: string | null) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("en-US", {
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

function formatDuration(totalHours: number) {
  if (!Number.isFinite(totalHours)) return "-";
  if (Number.isInteger(totalHours)) return `${totalHours} hours`;
  return `${totalHours.toFixed(1)} hours`;
}

function bookingStatusLabel(status: BookingStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function paymentStateLabel(state: BookingPaymentState) {
  switch (state) {
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
}

function bookingStatusClasses(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ACTIVE":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "DISPUTED":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function paymentStateClasses(state: BookingPaymentState) {
  switch (state) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function depositStatusLabel(status: BookingDetail["depositStatus"]) {
  switch (status) {
    case "HELD_IN_ESCROW":
      return "Held in escrow";
    case "REFUNDED_TO_RENTER":
      return "Refunded to renter wallet";
    case "RELEASED_TO_OWNER":
      return "Released to owner";
    case "UNDER_REVIEW":
      return "Under review";
    default:
      return "Not required";
  }
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

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium sm:max-w-[65%] sm:text-right">
        {value}
      </p>
    </div>
  );
}

function StarRating({
  rating,
  interactive = false,
  onRatingChange,
  className,
}: {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => {
            if (interactive) {
              onRatingChange?.(star);
            }
          }}
          className={cn(
            "rounded-md p-1 transition-colors",
            interactive && "hover:bg-amber-50",
          )}
        >
          <Star
            className={cn(
              "h-5 w-5",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function RenterBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] =
    useState<ReviewDraft>(EMPTY_REVIEW_DRAFT);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBookingData() {
      try {
        setLoading(true);
        setError(null);

        const bookingData = await fetchBookingDetail(bookingId);
        const reviewsData = await fetchBookingReviews(bookingId).catch(() => []);

        if (cancelled) return;

        setBooking(bookingData);
        setReviews(reviewsData);
      } catch (cause) {
        if (cancelled) return;

        setError(
          cause instanceof Error
            ? cause.message
            : "Failed to load booking details",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (bookingId) {
      void loadBookingData();
    }

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const ownedReview = reviews.find((review) => review.isOwner) ?? null;
  const canCreateReview = booking?.status === "COMPLETED" && !ownedReview;
  const reviewFormOpen = editingReviewId !== null || canCreateReview;
  const reviewCommentLength = reviewDraft.comment.trim().length;

  const resetReviewComposer = () => {
    setReviewDraft(EMPTY_REVIEW_DRAFT);
    setEditingReviewId(null);
  };

  const mergeReview = (review: Review) => {
    setReviews((current) => {
      const existingIndex = current.findIndex((item) => item.id === review.id);

      if (existingIndex === -1) {
        return [review, ...current];
      }

      return current.map((item) => (item.id === review.id ? review : item));
    });
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const bookingData = await fetchBookingDetail(bookingId);
      const reviewsData = await fetchBookingReviews(bookingId).catch(() => []);

      setBooking(bookingData);
      setReviews(reviewsData);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to refresh booking",
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking) return;

    if (reviewDraft.rating === 0) {
      toast({
        title: "Rating required",
        description: "Select a star rating before saving your review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingReview(true);

      const payload = {
        rating: reviewDraft.rating,
        comment: reviewDraft.comment.trim() || undefined,
      };

      const savedReview = editingReviewId
        ? await updateBookingReview(booking.id, editingReviewId, payload)
        : await createBookingReview(booking.id, payload);

      mergeReview(savedReview);
      resetReviewComposer();

      toast({
        title: editingReviewId ? "Review updated" : "Review submitted",
        description: editingReviewId
          ? "Your feedback has been updated."
          : "Your feedback has been saved for this trip.",
      });
    } catch (cause) {
      toast({
        title: "Unable to save review",
        description:
          cause instanceof Error ? cause.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setReviewDraft({
      rating: review.rating,
      comment: review.comment ?? "",
    });
  };

  const handleDeleteReview = async (review: Review) => {
    if (!window.confirm("Delete your rating and review for this booking?")) {
      return;
    }

    try {
      setDeletingReviewId(review.id);
      await deleteBookingReview(bookingId, review.id);
      setReviews((current) => current.filter((item) => item.id !== review.id));

      if (editingReviewId === review.id) {
        resetReviewComposer();
      }

      toast({
        title: "Review deleted",
        description: "Your rating and comment were removed.",
      });
    } catch (cause) {
      toast({
        title: "Unable to delete review",
        description:
          cause instanceof Error ? cause.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </Main>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="items-center justify-center gap-4">
            <p className="text-center text-sm text-red-600">
              {error || "Booking not found"}
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Go back
            </Button>
          </Main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <Main className="gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push("/renter/booking-history")}
                className="w-fit gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to booking history
              </Button>

              <div className="space-y-2">
                <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                  Booking {booking.bookingId}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Review the trip timeline, payment summary, pickup details, and
                  your renter feedback from one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    bookingStatusClasses(booking.status),
                  )}
                >
                  {bookingStatusLabel(booking.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    paymentStateClasses(booking.paymentState),
                  )}
                >
                  {paymentStateLabel(booking.paymentState)}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
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
              value={booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "N/A"}
              note={booking.vehicle?.plate || "No plate info"}
              icon={Car}
            />
            <StatCard
              title="Payment State"
              value={paymentStateLabel(booking.paymentState)}
              note={`Method: ${booking.payment.method || "Not specified"}`}
              icon={Wallet}
            />
            <StatCard
              title="Booking Status"
              value={bookingStatusLabel(booking.status)}
              note={`Booked on ${formatDateTime(booking.createdAt)}`}
              icon={CarFront}
            />
            <StatCard
              title="Total Amount"
              value={formatCurrency(
                booking.pricing.totalAmount,
                booking.pricing.currency,
              )}
              note={`${formatCurrency(
                booking.pricing.rentalSubtotal,
                booking.pricing.currency,
              )} rental subtotal`}
              icon={CreditCard}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.95fr)]">
            <div className="space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted/50 p-1">
                  <TabsTrigger value="details">Booking Details</TabsTrigger>
                  <TabsTrigger value="chat" className="gap-2">
                    Live Chat & Process
                    {(booking.status === "CONFIRMED" || booking.status === "ACTIVE") && (
                      <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CarFront className="h-5 w-5" />
                        Vehicle Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {booking.vehicle ? (
                        <div className="flex flex-col gap-5 lg:flex-row">
                          {booking.vehicle.imageUrl ? (
                            <img
                              src={booking.vehicle.imageUrl}
                              alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                              className="h-52 w-full rounded-2xl object-cover lg:w-72"
                            />
                          ) : (
                            <div className="flex h-52 w-full items-center justify-center rounded-2xl bg-muted lg:w-72">
                              <CarFront className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex-1 space-y-4">
                            <div>
                              <h2 className="text-2xl font-semibold">
                                {booking.vehicle.make} {booking.vehicle.model}
                              </h2>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {booking.vehicle.year} | Plate{" "}
                                {booking.vehicle.plate}
                              </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                  Pickup support
                                </p>
                                <p className="mt-2 text-sm font-medium">
                                  {booking.vehicle.delivery || "Standard handoff"}
                                </p>
                              </div>
                              <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                  Availability note
                                </p>
                                <p className="mt-2 text-sm font-medium">
                                  {booking.vehicle.availability || "No extra note"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                          Vehicle information is currently unavailable for this
                          booking.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chat" className="space-y-6 mt-0 h-[calc(100vh-300px)] min-h-[500px]">
                  {booking.status === "CONFIRMED" ||
                  booking.status === "ACTIVE" ||
                  booking.status === "COMPLETED" ? (
                    <div className="h-full overflow-hidden">
                      <ChatWindow
                        bookingId={booking.id}
                        className="h-full"
                        counterparty={{
                          name: "Vehicle Owner",
                          role: "HOST",
                          avatar: booking.vehicle?.imageUrl || undefined,
                        }}
                      />
                    </div>
                  ) : (
                    <Card className="border-2 border-dashed border-black p-12 text-center">
                      <MessageSquareText className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
                      <h3 className="text-lg font-bold uppercase">
                        Chat Unavailable
                      </h3>
                      <p className="text-sm text-zinc-500">
                        The chat room will open once your booking is confirmed.
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5" />
                    Rating and Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {ownedReview && !reviewFormOpen && (
                    <div className="rounded-2xl border bg-muted/10 p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-3">
                              <StarRating rating={ownedReview.rating} />
                              <Badge variant="outline" className="font-medium">
                                {ownedReview.rating}/5
                              </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Saved {formatDateTime(ownedReview.createdAt)}
                              {ownedReview.updatedAt &&
                              ownedReview.updatedAt !== ownedReview.createdAt
                                ? ` | Updated ${formatDateTime(
                                    ownedReview.updatedAt,
                                  )}`
                                : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditReview(ownedReview)}
                              className="gap-2"
                            >
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReview(ownedReview)}
                              disabled={deletingReviewId === ownedReview.id}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              {deletingReviewId === ownedReview.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm leading-6 text-foreground">
                          {ownedReview.comment ||
                            "No written comment provided."}
                        </p>
                      </div>
                    </div>
                  )}

                  {reviewFormOpen && (
                    <div className="rounded-2xl border p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">
                            {editingReviewId
                              ? "Edit your review"
                              : "Share your trip feedback"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Rate the vehicle and capture the important details
                            of your experience.
                          </p>
                        </div>

                        {editingReviewId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetReviewComposer}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>

                      <div className="mt-5 space-y-5">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <StarRating
                            rating={reviewDraft.rating}
                            interactive
                            onRatingChange={(rating) =>
                              setReviewDraft((current) => ({
                                ...current,
                                rating,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="review-comment">Comment</Label>
                          <Textarea
                            id="review-comment"
                            value={reviewDraft.comment}
                            onChange={(event) =>
                              setReviewDraft((current) => ({
                                ...current,
                                comment: event.target.value,
                              }))
                            }
                            placeholder="Describe the vehicle condition, pickup flow, comfort, and anything another renter should know."
                            className="min-h-32"
                            maxLength={500}
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Optional comment, up to 500 characters.</span>
                            <span>{reviewCommentLength} characters</span>
                          </div>
                        </div>

                        <Button
                          onClick={handleSubmitReview}
                          disabled={
                            submittingReview || reviewDraft.rating === 0
                          }
                          className="w-full gap-2"
                        >
                          {submittingReview ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving review...
                            </>
                          ) : editingReviewId ? (
                            "Update review"
                          ) : (
                            "Submit review"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {!ownedReview && !canCreateReview && (
                    <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                      {booking.status === "COMPLETED"
                        ? "No review has been added for this booking yet."
                        : "Reviews unlock after the booking is completed."}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No reviews are attached to this booking yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border bg-muted/10 p-5"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-sm font-semibold">
                                  {review.isOwner
                                    ? "Your review"
                                    : review.reviewer?.name || "Booking review"}
                                </p>
                                <Badge variant="outline">
                                  {review.isOwner ? "Editable" : "Read only"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <StarRating rating={review.rating} />
                                <span className="text-xs text-muted-foreground">
                                  Created {formatDateTime(review.createdAt)}
                                </span>
                              </div>
                            </div>

                            {review.target && (
                              <div className="rounded-xl border bg-background px-3 py-2 text-xs text-muted-foreground">
                                Target:{" "}
                                {[
                                  [review.target.make, review.target.model]
                                    .filter(Boolean)
                                    .join(" "),
                                  review.target.plate,
                                ]
                                  .filter(Boolean)
                                  .join(" | ") || "Vehicle"}
                              </div>
                            )}
                          </div>

                          <p className="mt-4 text-sm leading-6 text-foreground">
                            {review.comment || "No written comment provided."}
                          </p>

                          {review.images.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-3">
                              {review.images.map((image, index) => (
                                <img
                                  key={`${review.id}-${image}-${index}`}
                                  src={image}
                                  alt={`Review evidence ${index + 1}`}
                                  className="h-20 w-20 rounded-xl object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {(() => {
            const vehicle = booking.vehicle;
            const pickupAddress = booking.pickupAddress || vehicle?.pickupAddress || null;
            const returnAddress = booking.returnAddress || vehicle?.returnAddress || null;
            const sameLocation = pickupAddress && returnAddress && pickupAddress === returnAddress;
            
            const locationText = (() => {
              if (pickupAddress && returnAddress) {
                if (sameLocation) return pickupAddress;
                return `Pickup: ${pickupAddress} | Return: ${returnAddress}`;
              }
              if (pickupAddress) return pickupAddress;
              if (returnAddress) return returnAddress;
              return "Pickup & return location";
            })();

            const coords = (() => {
              if (!vehicle) return undefined;
              const geo = vehicle.pickupGeo || vehicle.returnGeo;
              if (!geo?.lat || !geo?.lng) return undefined;
              return {
                lat: Math.round(geo.lat * 100) / 100,
                lng: Math.round(geo.lng * 100) / 100,
              };
            })();

            return <MapSection locationText={locationText} coords={coords} />;
          })()}
        </Main>
      </div>
    </div>
  );
}
