"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
  ChartSkeleton,
  ListItemSkeleton,
} from "@/components/ui/shimmer-skeleton";

function StatCardSkeleton({ hasIcon = true }: { hasIcon?: boolean }) {
  return (
    <ShimmerCard className="p-5">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <ShimmerSkeleton className="h-4 w-24" />
        {hasIcon && <ShimmerSkeleton className="h-4 w-4" circle />}
      </div>
      <div className="space-y-2">
        <ShimmerSkeleton className="h-8 w-28" />
        <ShimmerSkeleton className="h-3 w-36" />
      </div>
    </ShimmerCard>
  );
}

function OverviewCardSkeleton() {
  return (
    <ShimmerCard className="col-span-4 p-5">
      <ShimmerSkeleton className="mb-6 h-5 w-24" />
      <ChartSkeleton height={300} />
    </ShimmerCard>
  );
}

function RecentBookingsCardSkeleton() {
  return (
    <ShimmerCard className="col-span-3 p-5">
      <div className="mb-2">
        <ShimmerSkeleton className="mb-2 h-5 w-32" />
        <ShimmerSkeleton className="h-3 w-40" />
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <ListItemSkeleton key={i} avatar lines={2} />
        ))}
      </div>
    </ShimmerCard>
  );
}

export function PeerHostDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton hasIcon={false} />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Error placeholder - hidden by default, shown when needed */}
      <div className="hidden bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        Error placeholder
      </div>

      {/* Overview and Recent Bookings */}
      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-7">
        <OverviewCardSkeleton />
        <RecentBookingsCardSkeleton />
      </div>
    </div>
  );
}
