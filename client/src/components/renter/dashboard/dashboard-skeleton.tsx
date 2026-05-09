"use client";

import {
  ChartSkeleton,
  ListItemSkeleton,
  ShimmerCard,
  ShimmerSkeleton,
} from "@/components/ui/shimmer-skeleton";

function StatCardSkeleton() {
  return (
    <ShimmerCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-3 w-24" />
          <ShimmerSkeleton className="h-8 w-20" />
          <ShimmerSkeleton className="h-3 w-36" />
        </div>
        <ShimmerSkeleton className="h-10 w-10 rounded-xl" circle />
      </div>
    </ShimmerCard>
  );
}

function NextTripSkeleton() {
  return (
    <ShimmerCard className="lg:col-span-2 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton className="h-3 w-48" />
        </div>
        <ShimmerSkeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="mt-6 rounded-2xl border border-border/50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-6 w-44" />
              <ShimmerSkeleton className="h-6 w-24 rounded-full" />
            </div>
            <ShimmerSkeleton className="h-4 w-56" />
            <ShimmerSkeleton className="h-4 w-32" />
          </div>

          <div className="flex flex-col gap-2">
            <ShimmerSkeleton className="h-10 w-32 rounded-xl" />
            <ShimmerSkeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </ShimmerCard>
  );
}

function QuickActionsSkeleton() {
  return (
    <ShimmerCard className="p-6">
      <div className="space-y-2">
        <ShimmerSkeleton className="h-4 w-28" />
        <ShimmerSkeleton className="h-3 w-32" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <ShimmerSkeleton key={index} className="h-11 w-full rounded-xl" />
        ))}
      </div>
    </ShimmerCard>
  );
}

function RecentBookingsSkeleton() {
  return (
    <ShimmerCard className="lg:col-span-2 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-4 w-28" />
          <ShimmerSkeleton className="h-3 w-32" />
        </div>
        <ShimmerSkeleton className="h-9 w-24 rounded-xl" />
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShimmerSkeleton className="h-5 w-40" />
                  <ShimmerSkeleton className="h-6 w-20 rounded-full" />
                </div>
                <ShimmerSkeleton className="h-3 w-32" />
              </div>

              <div className="flex items-center gap-3">
                <ShimmerSkeleton className="h-5 w-20" />
                <ShimmerSkeleton className="h-9 w-16 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ShimmerCard>
  );
}

function AccountSkeleton() {
  return (
    <ShimmerCard className="p-6">
      <div className="space-y-2">
        <ShimmerSkeleton className="h-4 w-20" />
        <ShimmerSkeleton className="h-3 w-32" />
      </div>

      <div className="mt-4 space-y-4">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex items-center justify-between">
            <ShimmerSkeleton className="h-4 w-28" />
            <ShimmerSkeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>

      <ShimmerSkeleton className="mt-5 h-10 w-full rounded-xl" />
    </ShimmerCard>
  );
}

export function RenterDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ShimmerSkeleton className="h-9 w-52" />
        <ShimmerSkeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <NextTripSkeleton />
        <QuickActionsSkeleton />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <RecentBookingsSkeleton />
        <AccountSkeleton />
      </div>
    </div>
  );
}
