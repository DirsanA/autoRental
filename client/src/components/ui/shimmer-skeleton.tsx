"use client";

import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
  circle?: boolean;
}

export function ShimmerSkeleton({ className, circle }: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/60 dark:bg-muted/30",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
    >
      {/* Shimmer overlay - light mode uses dark shimmer, dark mode uses light shimmer */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer dark:block hidden"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
        }}
      />
      {/* Light mode shimmer - dark gradient */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer block dark:hidden"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

interface ShimmerCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerCard({ children, className }: ShimmerCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 shadow-sm",
        className
      )}
    >
      {/* Subtle pulse animation for the card */}
      <div className="absolute inset-0 animate-pulse-slow bg-muted/20" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function StatCardSkeleton({
  icon = true,
  lines = 2,
}: {
  icon?: boolean;
  lines?: number;
}) {
  return (
    <ShimmerCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <ShimmerSkeleton className="h-3 w-24" />
          <ShimmerSkeleton className="h-8 w-20" />
          {lines > 2 && <ShimmerSkeleton className="h-2 w-32" />}
        </div>
        {icon && <ShimmerSkeleton className="h-10 w-10 rounded-xl" circle />}
      </div>
    </ShimmerCard>
  );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/80 px-4 py-4">
      {Array.from({ length: columns - 1 }, (_, i) => (
        <div key={i} className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-4 w-full" />
          <ShimmerSkeleton className="h-3 w-2/3" />
        </div>
      ))}
      <div className="w-24">
        <ShimmerSkeleton className="ml-auto h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function TableHeaderSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div
      className="grid gap-4 rounded-xl border border-border/50 bg-muted/40 px-4 py-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns }, (_, i) => (
        <ShimmerSkeleton key={i} className="h-4 w-20" />
      ))}
    </div>
  );
}

export function ListItemSkeleton({
  avatar = true,
  lines = 2,
}: {
  avatar?: boolean;
  lines?: number;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      {avatar && <ShimmerSkeleton className="h-10 w-10 shrink-0" circle />}
      <div className="flex-1 space-y-2">
        <ShimmerSkeleton className="h-4 w-3/4" />
        {lines > 1 && <ShimmerSkeleton className="h-3 w-1/2" />}
      </div>
      <ShimmerSkeleton className="h-4 w-16" />
    </div>
  );
}

const barHeights = [
  "h-[45%]",
  "h-[65%]",
  "h-[35%]",
  "h-[80%]",
  "h-[55%]",
  "h-[40%]",
  "h-[70%]",
  "h-[50%]",
  "h-[85%]",
  "h-[45%]",
  "h-[60%]",
  "h-[75%]",
];

const barOpacities = [
  "opacity-50",
  "opacity-70",
  "opacity-40",
  "opacity-80",
  "opacity-60",
  "opacity-50",
  "opacity-75",
  "opacity-55",
  "opacity-85",
  "opacity-45",
  "opacity-65",
  "opacity-70",
];

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <div
        className="flex items-end justify-between gap-2"
        style={{ height }}
      >
        {barHeights.map((heightClass, i) => (
          <ShimmerSkeleton
            key={i}
            className={cn("w-full rounded-t-sm", heightClass, barOpacities[i])}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 6 }, (_, i) => (
          <ShimmerSkeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}
