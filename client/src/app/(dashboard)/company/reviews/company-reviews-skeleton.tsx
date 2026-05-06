"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
} from "@/components/ui/shimmer-skeleton";

function StarRatingSkeleton() {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <ShimmerSkeleton key={i} className="h-4 w-4" circle />
      ))}
    </div>
  );
}

function RatingBreakdownSkeleton() {
  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-3">
          <ShimmerSkeleton className="h-4 w-3" />
          <div className="flex-1 bg-muted/40 rounded-full h-2 overflow-hidden">
            <ShimmerSkeleton className="h-full w-full" />
          </div>
          <ShimmerSkeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <ShimmerCard className="p-5 space-y-3">
      {/* Header with avatar and name */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-3">
          <ShimmerSkeleton className="h-10 w-10 rounded-full" circle />
          <div className="space-y-1">
            <ShimmerSkeleton className="h-4 w-24" />
            <ShimmerSkeleton className="h-3 w-32" />
          </div>
        </div>
        <StarRatingSkeleton />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-5/6" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-6 pt-2">
        <ShimmerSkeleton className="h-4 w-20" />
        <ShimmerSkeleton className="h-4 w-20" />
      </div>
    </ShimmerCard>
  );
}

export function CompanyReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <ShimmerSkeleton className="h-8 w-40" />
        <ShimmerSkeleton className="h-4 w-64" />
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* Average Rating Card */}
          <ShimmerCard className="p-6 text-center">
            <ShimmerSkeleton className="h-4 w-28 mx-auto mb-3" />
            <ShimmerSkeleton className="h-12 w-16 mx-auto" />
            <div className="flex justify-center mt-2">
              <StarRatingSkeleton />
            </div>
            <ShimmerSkeleton className="h-3 w-32 mx-auto mt-2" />
          </ShimmerCard>

          {/* Rating Breakdown */}
          <ShimmerCard className="p-6">
            <ShimmerSkeleton className="h-5 w-32 mb-4" />
            <RatingBreakdownSkeleton />
          </ShimmerCard>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6 lg:col-span-2">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <ShimmerSkeleton className="h-10 w-full rounded-lg" />
            <ShimmerSkeleton className="h-10 w-full sm:w-36 rounded-lg" />
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
