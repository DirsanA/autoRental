"use client";

import {
  ShimmerCard,
  ShimmerSkeleton,
} from "@/components/ui/shimmer-skeleton";

function ModeCardSkeleton() {
  return (
    <ShimmerSkeleton className="h-20 w-full rounded-xl" />
  );
}

function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <ShimmerSkeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <ShimmerSkeleton className="h-4 w-40" />
        <ShimmerSkeleton className="h-3 w-28" />
      </div>
      <ShimmerSkeleton className="h-8 w-8 rounded-full" circle />
    </div>
  );
}

export function ProfileVerificationSkeleton({
  showRentalModes = true,
}: {
  showRentalModes?: boolean;
}) {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShimmerSkeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <ShimmerSkeleton className="h-8 w-56" />
            <ShimmerSkeleton className="h-4 w-80 max-w-full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="h-7 w-28 rounded-full" />
          <ShimmerSkeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {showRentalModes ? (
        <ShimmerCard className="p-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="px-3 py-2 space-y-2">
              <ShimmerSkeleton className="h-4 w-36" />
              <ShimmerSkeleton className="h-3 w-64" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 w-full sm:w-auto sm:min-w-[420px]">
              <ModeCardSkeleton />
              <ModeCardSkeleton />
            </div>
          </div>
        </ShimmerCard>
      ) : null}

      <ShimmerCard className="p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <ShimmerSkeleton className="h-32 w-32 rounded-full" circle />

          <div className="flex-1 space-y-3 w-full">
            <ShimmerSkeleton className="h-6 w-40" />
            <ShimmerSkeleton className="h-4 w-96 max-w-full" />
            <div className="flex flex-wrap gap-3 pt-2">
              <ShimmerSkeleton className="h-9 w-28 rounded-xl" />
              <ShimmerSkeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </ShimmerCard>

      <ShimmerCard className="p-6">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-5 w-40" />
          <ShimmerSkeleton className="h-4 w-72" />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <ShimmerSkeleton className="h-3 w-24" />
            <ShimmerSkeleton className="h-10 w-full rounded-xl" />
            <ShimmerSkeleton className="h-3 w-32" />
            <ShimmerSkeleton className="h-10 w-full rounded-xl" />
            <ShimmerSkeleton className="h-3 w-28" />
            <ShimmerSkeleton className="h-10 w-full rounded-xl" />
            <ShimmerSkeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="space-y-4">
            <ShimmerSkeleton className="h-3 w-28" />
            <DocumentRowSkeleton />
            <DocumentRowSkeleton />
            <ShimmerSkeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
      </ShimmerCard>

      <ShimmerCard className="p-6">
        <div className="space-y-3">
          <ShimmerSkeleton className="h-5 w-36" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="space-y-2">
                <ShimmerSkeleton className="h-3 w-24" />
                <ShimmerSkeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <ShimmerSkeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </ShimmerCard>
    </div>
  );
}
