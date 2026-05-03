"use client";

import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-7 w-16 bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-3 w-28 bg-black/10 dark:bg-white/10" />
        </div>
        <Skeleton className="h-10 w-10 rounded-2xl bg-black/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

export function BookingHistoryPageSkeleton({
  columns,
  rows = 6,
  statCards = 3,
}: {
  columns: number;
  rows?: number;
  statCards?: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: statCards }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-sm rounded-2xl bg-black/10 dark:bg-white/10" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-2xl bg-black/10 dark:bg-white/10" />
            <Skeleton className="h-10 w-24 rounded-2xl bg-black/10 dark:bg-white/10" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-40 bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-4 w-20 bg-black/10 dark:bg-white/10" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div
              className="grid gap-4 rounded-2xl border border-border/70 bg-muted/40 px-4 py-4"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-4 w-20 bg-black/10 dark:bg-white/10"
                />
              ))}
            </div>

            <div className="mt-3 space-y-3">
              {Array.from({ length: rows }, (_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-4"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: columns }, (_, colIndex) => (
                    <div key={colIndex} className="space-y-2">
                      <Skeleton className="h-4 w-full bg-black/10 dark:bg-white/10" />
                      {colIndex < columns - 1 ? (
                        <Skeleton className="h-3 w-2/3 bg-black/10 dark:bg-white/10" />
                      ) : (
                        <Skeleton className="ml-auto h-9 w-20 rounded-xl bg-black/10 dark:bg-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-9 w-20 rounded-xl bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-4 w-24 bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-9 w-20 rounded-xl bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
