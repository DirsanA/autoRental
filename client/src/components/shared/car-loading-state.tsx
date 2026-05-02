"use client";

import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarLoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * A shared branded loading component for vehicle-related sections.
 */
export function CarLoadingState({
  message = "Loading vehicles...",
  className,
}: CarLoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="relative mb-6">
        {/* Outer pulse effect */}
        <div className="absolute -inset-4 rounded-full bg-blue-500/10 animate-ping opacity-75" />
        
        {/* Branded Icon Container */}
        <div className="relative bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
          <Car className="w-10 h-10 text-blue-600 animate-bounce" />
          
          {/* Decorative speed lines */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-0.5 w-4 bg-gradient-to-r from-transparent to-blue-400/50 rounded-full animate-pulse" />
          <div className="absolute -left-3 top-1/3 -translate-y-1/2 h-0.5 w-3 bg-gradient-to-r from-transparent to-blue-400/30 rounded-full animate-pulse delay-75" />
          <div className="absolute -left-3 top-2/3 -translate-y-1/2 h-0.5 w-3 bg-gradient-to-r from-transparent to-blue-400/30 rounded-full animate-pulse delay-150" />
        </div>
      </div>
      
      {/* Loading message */}
      <div className="space-y-2">
        <p className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {message}
        </p>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] animate-pulse">
          Please wait
        </p>
      </div>
    </div>
  );
}
