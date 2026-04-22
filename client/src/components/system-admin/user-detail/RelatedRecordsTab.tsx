"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CarFront,
  CreditCard,
  MessageSquareText,
  NotebookPen,
} from "lucide-react";
import type { UserFullDetail } from "./types";
import { formatDateTime, formatLabel, formatMoney } from "./formatters";

interface RelatedRecordsTabProps {
  user: UserFullDetail;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-none shadow-sm ring-1 ring-border">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Shows a compact activity view with expandable detail.
 */
export function RelatedRecordsTab({ user }: RelatedRecordsTabProps) {
  const vehicles = user.ownedVehicles.slice(0, 3);
  const bookings = user.recentBookings.slice(0, 3);
  const transactions = user.recentTransactions.slice(0, 3);
  const reviews = user.recentReviews.slice(0, 2);
  const disputes = user.recentDisputes.slice(0, 2);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Owned Vehicles"
          value={user.metrics.vehiclesOwned}
          icon={CarFront}
        />
        <SummaryCard
          title="Bookings"
          value={user.metrics.bookingsAsRenter}
          icon={NotebookPen}
        />
        <SummaryCard
          title="Disputes"
          value={user.metrics.disputesRaised + user.metrics.disputesAgainst}
          icon={MessageSquareText}
        />
        <SummaryCard
          title="Total Received"
          value={formatMoney(user.metrics.totalReceived)}
          icon={CreditCard}
        />
      </div>

      <Accordion
        type="multiple"
        defaultValue={["vehicles", "bookings"]}
        className="grid gap-4"
      >
        <AccordionItem
          value="vehicles"
          className="overflow-hidden rounded-2xl border bg-card px-5"
        >
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="text-left">
              <div className="text-lg font-semibold">Owned Vehicles</div>
              <div className="text-sm text-muted-foreground">
                The most recent vehicle inventory attached to this user.
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            {vehicles.length === 0 ? (
              <EmptyState message="No owned vehicles were found for this user." />
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                {vehicles.map((vehicle) => {
                  const coverPhoto =
                    vehicle.photos.front ||
                    vehicle.photos.side ||
                    vehicle.photos.back ||
                    vehicle.photos.gallery[0] ||
                    null;

                  return (
                    <div
                      key={vehicle.id}
                      className="overflow-hidden rounded-2xl border bg-muted/10"
                    >
                      <div className="h-40 bg-muted/30">
                        {coverPhoto ? (
                          <img
                            src={coverPhoto}
                            alt={`${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""}`.trim()}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No vehicle image
                          </div>
                        )}
                      </div>
                      <div className="grid gap-3 p-4 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">
                              {[vehicle.year, vehicle.make, vehicle.model]
                                .filter(Boolean)
                                .join(" ") || "Unnamed vehicle"}
                            </div>
                            <div className="text-muted-foreground">
                              Plate: {vehicle.plate || "Not provided"}
                            </div>
                          </div>
                          <Badge variant="outline" className="font-normal">
                            {formatLabel(vehicle.status)}
                          </Badge>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-medium">
                              {formatMoney(vehicle.price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">VIN</span>
                            <span className="font-medium">
                              {vehicle.vin || "Not provided"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="bookings"
          className="overflow-hidden rounded-2xl border bg-card px-5"
        >
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="text-left">
              <div className="text-lg font-semibold">Recent Bookings</div>
              <div className="text-sm text-muted-foreground">
                The latest booking activity where this user is directly involved.
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            {bookings.length === 0 ? (
              <EmptyState message="No linked bookings were found." />
            ) : (
              <div className="grid gap-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/10 p-4"
                  >
                    <div>
                      <div className="font-medium">
                        {booking.bookingId || booking.id}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {formatLabel(booking.relation)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {formatLabel(booking.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(booking.startTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="signals"
          className="overflow-hidden rounded-2xl border bg-card px-5"
        >
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="text-left">
              <div className="text-lg font-semibold">Trust Signals</div>
              <div className="text-sm text-muted-foreground">
                Recent reviews and dispute activity that could affect admin decisions.
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="grid gap-3">
                <div className="text-sm font-semibold text-muted-foreground">
                  Reviews
                </div>
                {reviews.length === 0 ? (
                  <EmptyState message="No linked reviews were found." />
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border bg-muted/10 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {formatLabel(review.relation)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {formatLabel(review.targetType)}
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm font-medium">
                        Rating: {review.rating ?? "N/A"}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {review.comment || "No review comment provided."}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid gap-3">
                <div className="text-sm font-semibold text-muted-foreground">
                  Disputes
                </div>
                {disputes.length === 0 ? (
                  <EmptyState message="No linked disputes were found." />
                ) : (
                  disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="rounded-2xl border bg-muted/10 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {formatLabel(dispute.relation)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {formatLabel(dispute.status)}
                        </Badge>
                      </div>
                      <div className="mt-3 font-medium">
                        {formatLabel(dispute.issueCategory)}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {formatDateTime(dispute.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="payments"
          className="overflow-hidden rounded-2xl border bg-card px-5"
        >
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="text-left">
              <div className="text-lg font-semibold">Recent Transactions</div>
              <div className="text-sm text-muted-foreground">
                A short payment snapshot without the full ledger view.
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            {transactions.length === 0 ? (
              <EmptyState message="No linked transactions were found." />
            ) : (
              <div className="grid gap-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/10 p-4"
                  >
                    <div>
                      <div className="font-medium">
                        {formatMoney(
                          transaction.amount,
                          transaction.currency || "USD",
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {formatLabel(transaction.direction)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {formatLabel(transaction.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(transaction.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
