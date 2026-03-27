"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserFullDetail } from "./types";
import { formatDateTime, formatLabel, formatMoney } from "./formatters";

interface RelatedRecordsTabProps {
  user: UserFullDetail;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

/**
 * Shows recent bookings, reviews, disputes, and transactions for the user.
 */
export function RelatedRecordsTab({ user }: RelatedRecordsTabProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Reviews</CardDescription>
            <CardTitle className="text-2xl">
              {user.metrics.reviewsWritten} / {user.metrics.reviewsReceived}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Written vs received reviews linked to this account.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Disputes</CardDescription>
            <CardTitle className="text-2xl">
              {user.metrics.disputesRaised} / {user.metrics.disputesAgainst}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Raised vs received disputes found for the user.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total paid</CardDescription>
            <CardTitle className="text-2xl">
              {formatMoney(user.metrics.totalPaid)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Sum of completed outgoing transactions by this user.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total received</CardDescription>
            <CardTitle className="text-2xl">
              {formatMoney(user.metrics.totalReceived)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Sum of completed incoming transactions tied to the user or linked company.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest bookings where the user appears as renter or through owned inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.recentBookings.length === 0 ? (
              <EmptyState message="No linked bookings were found." />
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Booking</TableHead>
                      <TableHead>Relation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.bookingId || booking.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {formatLabel(booking.relation)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatLabel(booking.status)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(booking.startTime)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(booking.endTime)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(booking.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Latest authored and received reviews tied to the account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.recentReviews.length === 0 ? (
                <EmptyState message="No linked reviews were found." />
              ) : (
                <div className="space-y-3">
                  {user.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border bg-muted/10 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-normal">
                            {formatLabel(review.relation)}
                          </Badge>
                          <Badge variant="outline" className="font-normal">
                            {formatLabel(review.targetType)}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium">
                          Rating: {review.rating ?? "N/A"}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {review.comment || "No review comment provided."}
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {formatDateTime(review.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Disputes</CardTitle>
              <CardDescription>
                Latest dispute records where the user is a party.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.recentDisputes.length === 0 ? (
                <EmptyState message="No linked disputes were found." />
              ) : (
                <div className="space-y-3">
                  {user.recentDisputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="rounded-lg border bg-muted/10 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {formatLabel(dispute.relation)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {formatLabel(dispute.status)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {formatLabel(dispute.subjectModel)}
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm text-foreground">
                        {formatLabel(dispute.issueCategory)}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(dispute.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest incoming and outgoing transactions connected to this profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.recentTransactions.length === 0 ? (
              <EmptyState message="No linked transactions were found." />
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Created</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {formatDateTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {formatLabel(transaction.direction)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatLabel(transaction.type)}</TableCell>
                        <TableCell>{formatLabel(transaction.status)}</TableCell>
                        <TableCell>
                          {formatLabel(transaction.receiverModel)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMoney(
                            transaction.amount,
                            transaction.currency || "USD",
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
