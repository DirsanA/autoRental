"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
} from "@/components/ui/shimmer-skeleton";

function SearchFilterSkeleton() {
  return (
    <ShimmerCard className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <ShimmerSkeleton className="h-12 w-full xl:max-w-md rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <ShimmerSkeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>
    </ShimmerCard>
  );
}

function VehicleCardSkeleton() {
  return (
    <ShimmerCard className="overflow-hidden rounded-[30px] p-0">
      {/* Image placeholder */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <ShimmerSkeleton className="w-full h-full rounded-none" />
        {/* Gradient overlay placeholder */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <ShimmerSkeleton className="h-6 w-24 rounded-full" />
          <ShimmerSkeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* Price */}
        <div className="absolute bottom-4 left-4">
          <ShimmerSkeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <ShimmerSkeleton className="h-7 w-48" />
            <ShimmerSkeleton className="h-4 w-32" />
          </div>
          <div className="space-y-1 text-right">
            <ShimmerSkeleton className="h-3 w-12" />
            <ShimmerSkeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Service dates grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-2xl bg-muted/30 p-4">
            <ShimmerSkeleton className="h-3 w-20" />
            <ShimmerSkeleton className="h-4 w-28" />
          </div>
          <div className="space-y-2 rounded-2xl bg-muted/30 p-4">
            <ShimmerSkeleton className="h-3 w-24" />
            <ShimmerSkeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <ShimmerSkeleton className="h-11 w-full rounded-2xl" />
          <ShimmerSkeleton className="h-11 w-full rounded-2xl" />
        </div>
      </div>
    </ShimmerCard>
  );
}

export function FleetManagementSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Search & Filter */}
      <SearchFilterSkeleton />

      {/* Vehicle Grid */}
      <section className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </section>
    </div>
  );
}
