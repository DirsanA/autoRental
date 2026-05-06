"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
  ChartSkeleton,
} from "@/components/ui/shimmer-skeleton";

function StatCardSkeleton({ colorClass }: { colorClass: string }) {
  return (
    <ShimmerCard className="p-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <ShimmerSkeleton className="h-3 w-20" />
          <div className={`${colorClass} p-2 rounded-xl`}>
            <ShimmerSkeleton className="h-4 w-4" circle />
          </div>
        </div>
        <ShimmerSkeleton className="h-7 w-16" />
        <div className="flex items-center gap-0.5">
          <ShimmerSkeleton className="h-3 w-3" circle />
          <ShimmerSkeleton className="h-3 w-10" />
        </div>
      </div>
    </ShimmerCard>
  );
}

function RevenueChartSkeleton() {
  return (
    <ShimmerCard className="lg:col-span-2 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <ShimmerSkeleton className="h-5 w-32" />
        <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-full sm:w-auto">
          <ShimmerSkeleton className="h-7 w-16 rounded-lg" />
          <ShimmerSkeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
      <ChartSkeleton height={256} />
    </ShimmerCard>
  );
}

function FleetStatusSkeleton() {
  return (
    <ShimmerCard className="p-6">
      <ShimmerSkeleton className="h-5 w-24 mb-6" />
      <div className="h-40 flex items-center justify-center">
        <ShimmerSkeleton className="h-32 w-32 rounded-full" circle />
      </div>
      <div className="space-y-4 mt-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShimmerSkeleton className="h-2 w-2 rounded-full" />
                <ShimmerSkeleton className="h-4 w-16" />
              </div>
              <ShimmerSkeleton className="h-4 w-12" />
            </div>
            <ShimmerSkeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="bg-muted/30 mt-8 p-4 rounded-xl">
        <ShimmerSkeleton className="h-4 w-full" />
      </div>
    </ShimmerCard>
  );
}

export function CompanyDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-8 w-40" />
          <ShimmerSkeleton className="h-4 w-56" />
        </div>
        <ShimmerSkeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Stats Grid - 4 cards instead of 5 (earnings removed) */}
      <div className="gap-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton colorClass="bg-blue-500" />
        <StatCardSkeleton colorClass="bg-emerald-500" />
        <StatCardSkeleton colorClass="bg-indigo-500" />
        <StatCardSkeleton colorClass="bg-rose-500" />
      </div>

      {/* Charts Row */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <RevenueChartSkeleton />
        <FleetStatusSkeleton />
      </div>
    </div>
  );
}
