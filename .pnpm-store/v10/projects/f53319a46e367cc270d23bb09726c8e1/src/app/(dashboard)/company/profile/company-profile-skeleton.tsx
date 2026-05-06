"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
} from "@/components/ui/shimmer-skeleton";

function FormFieldSkeleton({
  label = true,
  icon = true,
  textarea = false,
}: {
  label?: boolean;
  icon?: boolean;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-2">
      {label && <ShimmerSkeleton className="h-3 w-24" />}
      <div className="relative">
        {icon && !textarea && (
          <ShimmerSkeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full" />
        )}
        {icon && textarea && (
          <ShimmerSkeleton className="absolute left-3 top-3 h-4 w-4 rounded-full" />
        )}
        <ShimmerSkeleton
          className={`w-full rounded-xl ${textarea ? 'h-20' : 'h-10'
            } ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
}

function DocumentItemSkeleton() {
  return (
    <div className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
      <div className="flex items-center gap-3">
        <ShimmerSkeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <ShimmerSkeleton className="h-4 w-40" />
          <ShimmerSkeleton className="h-3 w-32" />
        </div>
      </div>
      <ShimmerSkeleton className="h-4 w-12" />
    </div>
  );
}

export function CompanyProfileSkeleton() {
  return (
    <div className="space-y-8 mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-8 w-40" />
          <ShimmerSkeleton className="h-4 w-64" />
        </div>
        <ShimmerSkeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6 md:col-span-1">
          {/* Company Card */}
          <ShimmerCard className="p-6 text-center">
            <div className="inline-block relative mb-4">
              <ShimmerSkeleton className="h-32 w-32 rounded-3xl" circle />
              <ShimmerSkeleton className="absolute -right-2 -bottom-2 h-8 w-8 rounded-xl" />
            </div>
            <ShimmerSkeleton className="h-6 w-40 mx-auto" />
            <ShimmerSkeleton className="h-4 w-32 mx-auto mt-2" />
            <ShimmerSkeleton className="h-6 w-32 mx-auto mt-6 rounded-full" />
          </ShimmerCard>

          {/* Verification Status */}
          <ShimmerCard className="p-6">
            <ShimmerSkeleton className="h-5 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <ShimmerSkeleton className="h-3 w-28" />
                  <ShimmerSkeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </ShimmerCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 md:col-span-2">
          {/* General Information */}
          <ShimmerCard className="p-8">
            <ShimmerSkeleton className="h-6 w-40 mb-6" />
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <div className="sm:col-span-2">
                <FormFieldSkeleton textarea />
              </div>
            </div>
          </ShimmerCard>

          {/* Legal Documents */}
          <ShimmerCard className="p-8">
            <ShimmerSkeleton className="h-6 w-40 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 2 }, (_, i) => (
                <DocumentItemSkeleton key={i} />
              ))}
              <ShimmerSkeleton className="h-20 w-full rounded-2xl border-2 border-dashed" />
            </div>
          </ShimmerCard>
        </div>
      </div>
    </div>
  );
}
