"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
} from "@/components/ui/shimmer-skeleton";

function RatingStarsSkeleton() {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <ShimmerSkeleton key={i} className="h-4 w-4" circle />
      ))}
    </div>
  );
}

function RatingDistributionSkeleton() {
  return (
    <div className="space-y-3 md:col-span-2">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-3">
          <ShimmerSkeleton className="h-4 w-6" />
          <div className="flex-1 bg-muted/40 dark:bg-muted/20 rounded-full h-2 overflow-hidden">
            <ShimmerSkeleton
              className="h-full w-full"
              style={{ width: `${Math.random() * 80 + 10}%` }}
            />
          </div>
          <ShimmerSkeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <ShimmerCard>
      <div className="space-y-4 p-6">
        {/* Top Section - Avatar and Name */}
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex items-center gap-4">
            <ShimmerSkeleton className="h-10 w-10 rounded-full" circle />
            <div className="space-y-2">
              <ShimmerSkeleton className="h-4 w-24" />
              <ShimmerSkeleton className="h-3 w-16" />
            </div>
          </div>
          <RatingStarsSkeleton />
        </div>

        {/* Vehicle Name */}
        <ShimmerSkeleton className="h-4 w-32" />

        {/* Comment */}
        <div className="space-y-2">
          <ShimmerSkeleton className="h-4 w-full" />
          <ShimmerSkeleton className="h-4 w-5/6" />
          <ShimmerSkeleton className="h-4 w-4/6" />
        </div>
      </div>
    </ShimmerCard>
  );
}

export function ReviewsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2 mb-10">
        <ShimmerSkeleton className="h-10 w-48" />
        <ShimmerSkeleton className="h-4 w-64" />
      </div>

      {/* Summary Section */}
      <div className="gap-8 grid md:grid-cols-3">
        {/* Average Rating Card */}
        <ShimmerCard className="p-8">
          <ShimmerSkeleton className="h-4 w-28 mb-3" />
          <div className="flex items-center gap-4 mt-3">
            <ShimmerSkeleton className="h-12 w-16" />
            <div className="space-y-2">
              <RatingStarsSkeleton />
              <ShimmerSkeleton className="h-3 w-32" />
            </div>
          </div>
        </ShimmerCard>

        {/* Rating Distribution */}
        <RatingDistributionSkeleton />
      </div>

      {/* Reviews List */}
      <div className="space-y-6 mt-12">
        {Array.from({ length: 3 }, (_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
