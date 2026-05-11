"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import {
  ChartSkeleton,
  ShimmerCard,
  ShimmerSkeleton,
  StatCardSkeleton,
  TableHeaderSkeleton,
  TableRowSkeleton,
} from "@/components/ui/shimmer-skeleton";

const statGridClassMap: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export function AdminListPageSkeleton({
  stats = 3,
  columns = 6,
  rows = 5,
  showHelperCard = true,
  showFilters = true,
  showInfoBar = true,
}: {
  stats?: number;
  columns?: number;
  rows?: number;
  showHelperCard?: boolean;
  showFilters?: boolean;
  showInfoBar?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <Header />
      <Main className="gap-6 p-6 md:p-8 pb-20">
          <div className="space-y-3">
            <ShimmerSkeleton className="h-10 w-64" />
            <ShimmerSkeleton className="h-4 w-[28rem] max-w-full" />
          </div>

          {stats > 0 ? (
            <div className={`grid gap-4 ${statGridClassMap[Math.min(stats, 4)] || "md:grid-cols-4"}`}>
              {Array.from({ length: stats }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {showHelperCard ? (
            <ShimmerCard className="p-4">
              <ShimmerSkeleton className="h-4 w-5/6" />
            </ShimmerCard>
          ) : null}

          {showFilters ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <ShimmerSkeleton className="h-10 w-full sm:max-w-sm" />
                <ShimmerSkeleton className="h-10 w-full sm:w-44" />
                <ShimmerSkeleton className="h-10 w-full sm:w-44" />
              </div>
              <div className="flex gap-2">
                <ShimmerSkeleton className="h-10 w-28" />
                <ShimmerSkeleton className="h-10 w-28" />
              </div>
            </div>
          ) : null}

          {showInfoBar ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <ShimmerSkeleton className="h-4 w-44" />
              <ShimmerSkeleton className="h-4 w-32" />
            </div>
          ) : null}

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="space-y-4">
              <TableHeaderSkeleton columns={columns} />
              <div className="space-y-3">
                {Array.from({ length: rows }).map((_, index) => (
                  <TableRowSkeleton key={index} columns={columns} />
                ))}
              </div>
            </div>
          </div>
        </Main>
    
    </div>
  );
}

export function AdminDashboardPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <ShimmerSkeleton className="h-8 w-72" />
              <ShimmerSkeleton className="h-4 w-40" />
            </div>
            <ShimmerSkeleton className="h-11 w-44 rounded-xl" />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
            <ShimmerCard className="p-5">
              <div className="space-y-4">
                <ShimmerSkeleton className="h-5 w-40" />
                <ChartSkeleton height={260} />
              </div>
            </ShimmerCard>
            <ShimmerCard className="p-5">
              <div className="space-y-4">
                <ShimmerSkeleton className="h-5 w-36" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                      <ShimmerSkeleton className="h-4 w-28" />
                      <ShimmerSkeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </ShimmerCard>
          </div>
        </div>
      </Main>
    </div>
  );
}
