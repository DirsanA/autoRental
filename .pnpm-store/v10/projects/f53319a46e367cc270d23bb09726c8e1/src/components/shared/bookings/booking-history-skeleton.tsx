"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
} from "@/components/ui/shimmer-skeleton";

function StatCardSkeleton() {
  return (
    <ShimmerCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <ShimmerSkeleton className="h-3 w-24" />
          <ShimmerSkeleton className="h-8 w-16" />
          <ShimmerSkeleton className="h-3 w-28" />
        </div>
        <ShimmerSkeleton className="h-10 w-10 rounded-xl" circle />
      </div>
    </ShimmerCard>
  );
}

function FilterBarSkeleton() {
  return (
    <ShimmerCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ShimmerSkeleton className="h-10 w-full max-w-sm rounded-xl" />
        <div className="flex gap-3">
          <ShimmerSkeleton className="h-10 w-32 rounded-xl" />
          <ShimmerSkeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </ShimmerCard>
  );
}

function TableHeaderSkeleton({ columns }: { columns: number }) {
  return (
    <div
      className="grid gap-4 rounded-xl border border-border/50 bg-muted/40 px-4 py-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns }, (_, index) => (
        <ShimmerSkeleton key={index} className="h-4 w-20" />
      ))}
    </div>
  );
}

function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <div
      className="grid gap-4 rounded-xl border border-border/40 bg-background/80 px-4 py-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns - 1 }, (_, colIndex) => (
        <div key={colIndex} className="space-y-2">
          <ShimmerSkeleton className="h-4 w-full" />
          <ShimmerSkeleton className="h-3 w-2/3" />
        </div>
      ))}
      <div className="flex items-center justify-end">
        <ShimmerSkeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

function MobileCardSkeleton() {
  return (
    <ShimmerCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-4 w-3/4" />
          <ShimmerSkeleton className="h-3 w-1/2" />
        </div>
        <ShimmerSkeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="h-4 w-4" circle />
          <ShimmerSkeleton className="h-3 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="h-4 w-4" circle />
          <ShimmerSkeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <ShimmerSkeleton className="h-3 w-24" />
        <ShimmerSkeleton className="h-4 w-16" />
      </div>
      <ShimmerSkeleton className="mt-4 h-10 w-full rounded-xl" />
    </ShimmerCard>
  );
}

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <ShimmerSkeleton className="h-10 w-24 rounded-xl" />
      <ShimmerSkeleton className="h-4 w-32" />
      <ShimmerSkeleton className="h-10 w-24 rounded-xl" />
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
      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: statCards }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBarSkeleton />

      {/* Table Container */}
      <ShimmerCard className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <ShimmerSkeleton className="h-4 w-40" />
          <ShimmerSkeleton className="h-4 w-20" />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[880px]">
            <TableHeaderSkeleton columns={columns} />
            <div className="mt-3 space-y-3">
              {Array.from({ length: rows }, (_, rowIndex) => (
                <TableRowSkeleton key={rowIndex} columns={columns} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <MobileCardSkeleton key={index} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <PaginationSkeleton />
        </div>
      </ShimmerCard>
    </div>
  );
}
