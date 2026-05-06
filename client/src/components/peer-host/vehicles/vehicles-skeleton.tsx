"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
} from "@/components/ui/shimmer-skeleton";

function StatCardSkeleton({
  colorClass,
}: {
  colorClass: string;
}) {
  return (
    <div
      className={`group relative ${colorClass} shadow-lg backdrop-blur-sm border-0 overflow-hidden transition-all duration-300 rounded-xl`}
    >
      <div className="top-0 right-0 absolute blur-2xl rounded-full w-24 h-24 opacity-20" />
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <ShimmerSkeleton className="h-4 w-28" />
            <ShimmerSkeleton className="h-10 w-16" />
          </div>
          <ShimmerSkeleton className="h-10 w-10" circle />
        </div>
      </div>
    </div>
  );
}

function VehicleCardSkeleton() {
  return (
    <ShimmerCard className="overflow-hidden p-0">
      {/* Image placeholder */}
      <div className="relative bg-muted/60 dark:bg-muted/30 w-full h-52">
        <ShimmerSkeleton className="w-full h-full rounded-none" />
        {/* Badge placeholder */}
        <div className="top-3 right-3 absolute">
          <ShimmerSkeleton className="h-6 w-24 rounded-full" />
        </div>
        {/* Price placeholder */}
        <div className="bottom-3 left-3 absolute">
          <ShimmerSkeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-5 w-3/4" />
          <ShimmerSkeleton className="h-4 w-1/2" />
        </div>

        <div className="flex justify-between items-center">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </ShimmerCard>
  );
}

export function VehiclesPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <ShimmerSkeleton className="h-10 w-48" />
        <ShimmerSkeleton className="h-4 w-72" />
      </div>

      {/* Stat Cards */}
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-3 mt-10">
        <StatCardSkeleton colorClass="bg-gradient-to-br from-emerald-500/10 to-emerald-400/5" />
        <StatCardSkeleton colorClass="bg-gradient-to-br from-blue-500/10 to-blue-400/5" />
        <StatCardSkeleton colorClass="bg-gradient-to-br from-amber-500/10 to-amber-400/5" />
      </div>

      {/* Vehicle Grid */}
      <div className="gap-6 grid md:grid-cols-2 xl:grid-cols-2 mt-10">
        {Array.from({ length: 4 }, (_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
