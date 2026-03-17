"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, MoreHorizontal, Flag, Trash2, ShieldAlert } from "lucide-react";
import type { Review } from "./types";
import { cn } from "@/lib/utils";

// ─── Avatar generator for reviewers ──────────────────────────────────────────

function ReviewerAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0 border">
      {initials}
    </div>
  );
}

// ─── Star Rating display ─────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted",
          )}
        />
      ))}
    </div>
  );
}

// ─── Reviews Tab ─────────────────────────────────────────────────────────────

interface ReviewsTabProps {
  reviews: Review[];
  onFlag: (review: Review) => void;
  onDelete: (review: Review) => void;
}

export function ReviewsTab({ reviews, onFlag, onDelete }: ReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Star className="h-12 w-12 opacity-20 mb-3" />
        <p className="text-lg font-medium">No reviews yet</p>
        <p className="text-sm">
          Customers haven't left any reviews for this company.
        </p>
      </div>
    );
  }

  // Calculate summary stats
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const flaggedCount = reviews.filter((r) => r.flagged).length;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Summary Strip ───────────────────────────────────────────── */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">{avgRating.toFixed(1)}</span>
          <StarRating rating={Math.round(avgRating)} />
          <span className="text-muted-foreground ml-1">
            ({reviews.length} reviews)
          </span>
        </div>
        {flaggedCount > 0 && (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md">
            <ShieldAlert className="h-4 w-4" />
            {flaggedCount} flagged for moderation
          </div>
        )}
      </div>

      {/* ── Reviews Table ───────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Customer</TableHead>
              <TableHead className="w-[120px]">Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow
                key={review.id}
                className={cn(
                  "group transition-colors",
                  review.flagged
                    ? "bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
                    : "hover:bg-muted/50",
                )}
              >
                {/* Customer */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ReviewerAvatar name={review.customerName} />
                    <div>
                      <div className="font-medium text-sm leading-tight">
                        {review.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {review.vehicleName}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Rating */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StarRating rating={review.rating} />
                    {review.flagged && (
                      <Badge
                        variant="outline"
                        className="w-fit text-[10px] h-4 px-1 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                      >
                        Flagged
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Comment */}
                <TableCell className="max-w-[400px]">
                  <p className="text-sm text-foreground/90 line-clamp-2 pr-4">
                    {review.comment}
                  </p>
                </TableCell>

                {/* Date */}
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(review.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onFlag(review)}>
                        <Flag className="mr-2 h-4 w-4" />
                        {review.flagged ? "Unflag review" : "Flag for review"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(review)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
