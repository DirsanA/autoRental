"use client";

import { useSidebarBadgeCount } from "@/hooks/use-action-badges";
import type { EntityType } from "@/lib/view-tracking-api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ActionBadgeProps {
  entityType: EntityType;
  variant?: "pill" | "dot";
  showNumber?: boolean;
  className?: string;
}

/**
 * Generic action badge component to show unviewed action-required counts.
 * Can be used in sidebar, headers, or buttons.
 */
export function ActionBadge({
  entityType,
  variant = "pill",
  showNumber = true,
  className,
}: ActionBadgeProps) {
  const { count, isLoading } = useSidebarBadgeCount(entityType);

  if (isLoading || count === 0) {
    return null;
  }

  const displayCount = count > 99 ? "99+" : count;

  if (variant === "dot") {
    return (
      <span className={cn("relative flex h-2 w-2", className)}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
      </span>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px] shadow-sm",
          className
        )}
      >
        {showNumber ? (
          <span className="tabular-nums">{displayCount}</span>
        ) : null}
      </motion.span>
    </AnimatePresence>
  );
}
