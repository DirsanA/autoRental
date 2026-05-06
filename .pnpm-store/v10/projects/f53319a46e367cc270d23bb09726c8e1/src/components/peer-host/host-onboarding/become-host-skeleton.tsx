"use client";

import {
  ShimmerSkeleton,
  ShimmerCard,
} from "@/components/ui/shimmer-skeleton";

function StepIndicatorSkeleton() {
  return (
    <div className="flex justify-between items-center min-w-[500px] sm:min-w-0">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col items-center">
          <ShimmerSkeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" circle />
          <ShimmerSkeleton className="h-3 w-16 mt-2" />
        </div>
      ))}
    </div>
  );
}

function FormFieldSkeleton({
  label = true,
  height = "h-10",
}: {
  label?: boolean;
  height?: string;
}) {
  return (
    <div className="space-y-1 sm:space-y-2">
      {label && <ShimmerSkeleton className="h-3 w-20" />}
      <ShimmerSkeleton className={`w-full ${height} rounded-md`} />
    </div>
  );
}

function PhotoUploadSkeleton() {
  return (
    <div className="relative">
      <ShimmerSkeleton className="w-full h-32 rounded-lg" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <ShimmerSkeleton className="h-8 w-8 rounded-full mb-2" circle />
        <ShimmerSkeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function DocumentUploadSkeleton() {
  return (
    <div className="border-2 border-dashed border-border/50 rounded-xl p-6">
      <div className="flex flex-col items-center justify-center gap-3">
        <ShimmerSkeleton className="h-10 w-10 rounded-full" circle />
        <div className="space-y-2 text-center">
          <ShimmerSkeleton className="h-4 w-32 mx-auto" />
          <ShimmerSkeleton className="h-3 w-48 mx-auto" />
        </div>
        <ShimmerSkeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function BecomeHostSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <ShimmerSkeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
              <ShimmerSkeleton className="h-6 sm:h-8 w-40 sm:w-48" />
            </div>
            <ShimmerSkeleton className="h-3 sm:h-4 w-56 sm:w-72" />
          </div>
          <ShimmerSkeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Progress Steps */}
        <div className="-mx-4 px-4 pb-2 overflow-x-auto">
          <StepIndicatorSkeleton />
        </div>
      </div>

      {/* Main Grid */}
      <div className="gap-4 sm:gap-6 grid lg:grid-cols-3">
        {/* Left Column - Main Form */}
        <ShimmerCard className="lg:col-span-2 p-4 sm:p-6">
          {/* Card Header */}
          <div className="pb-4 mb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-5 w-5" circle />
              <ShimmerSkeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Basic Info Grid */}
            <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-3">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </div>

            {/* VIN & Plate */}
            <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </div>

            {/* Specs Grid */}
            <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </div>

            {/* Features */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <ShimmerSkeleton className="h-3 w-32" />
                <ShimmerSkeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <ShimmerSkeleton key={i} className="h-7 w-20 rounded-full" />
                ))}
              </div>
              <div className="flex gap-2">
                <FormFieldSkeleton label={false} />
                <ShimmerSkeleton className="h-9 sm:h-10 w-9 sm:w-10 rounded-md shrink-0" />
              </div>
            </div>

            {/* Photo Upload Grid */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <ShimmerSkeleton className="h-3 w-32" />
                <ShimmerSkeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="gap-3 sm:gap-4 grid grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <PhotoUploadSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </ShimmerCard>

        {/* Right Column - Tips & Progress */}
        <div className="space-y-4 sm:space-y-6">
          {/* Tips Card */}
          <ShimmerCard className="p-4 sm:p-6">
            <ShimmerSkeleton className="h-5 w-24 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ShimmerSkeleton className="h-4 w-4 mt-0.5 rounded-full" circle />
                  <ShimmerSkeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </ShimmerCard>

          {/* Progress Card */}
          <ShimmerCard className="p-4 sm:p-6">
            <ShimmerSkeleton className="h-5 w-28 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <ShimmerSkeleton className="h-3 w-24" />
                  <ShimmerSkeleton className="h-4 w-4 rounded-full" circle />
                </div>
              ))}
            </div>
            <ShimmerSkeleton className="h-10 w-full rounded-lg mt-6" />
          </ShimmerCard>
        </div>
      </div>
    </div>
  );
}
