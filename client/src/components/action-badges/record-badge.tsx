"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, Eye } from "lucide-react";

interface RecordBadgeProps {
  show?: boolean;
  variant?: "dot" | "badge" | "pulse" | "signal";
  label?: string;
  className?: string;
}

/**
 * Record-level action badge component
 * Shows when a record requires admin action and hasn't been viewed
 */
export function RecordBadge({
  show = false,
  variant = "badge",
  label = "Action Required",
  className,
}: RecordBadgeProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn("inline-flex items-center", className)}
      >
        {variant === "dot" && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          </span>
        )}

        {variant === "signal" && (
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-1.5 py-0.5 pr-2.5 dark:bg-red-950/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              New
            </span>
          </div>
        )}

        {variant === "badge" && (
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
              "dark:border-red-900 dark:bg-red-900/20 dark:text-red-400",
              "font-semibold text-[10px] uppercase tracking-tight py-0"
            )}
          >
            <AlertCircle className="h-3 w-3" />
            {label}
          </Badge>
        )}

        {variant === "pulse" && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {label}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact dot badge for table rows
 */
export function RecordBadgeDot({
  show = false,
  className,
}: {
  show?: boolean;
  className?: string;
}) {
  return <RecordBadge show={show} variant="dot" className={className} />;
}

/**
 * Status-aware record badge that shows appropriate styling
 * based on the action type
 */
export function StatusRecordBadge({
  status,
  isNew,
  showActionBadges = false,
  className,
}: {
  status: "pending" | "approved" | "rejected" | "flagged" | string;
  isNew?: boolean;
  showActionBadges?: boolean;
  className?: string;
}) {
  const show = showActionBadges && status === "pending" && !isNew;
  
  if (!show) return null;

  return (
    <RecordBadge
      show={true}
      variant="badge"
      label="Needs Review"
      className={className}
    />
  );
}
