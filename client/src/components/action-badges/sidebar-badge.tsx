"use client";

import { useSidebarBadgeCount } from "@/hooks/use-action-badges";
import type { EntityType } from "@/lib/view-tracking-api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarBadgeProps {
  entityType: EntityType;
  showNumber?: boolean; // false = dot only
  className?: string;
}

/**
 * Sidebar badge component showing count of unviewed action-required items
 * 
 * Usage in sidebar route definition:
 * {
 *   id: "Users",
 *   title: "Users",
 *   icon: <UserCheck className="size-4" />,
 *   link: "/sysadmin/users",
 *   badge: <SidebarBadge entityType="USER" />,
 * }
 */
export function SidebarBadge({
  entityType,
  showNumber = true,
  className,
}: SidebarBadgeProps) {
  const { count, isLoading } = useSidebarBadgeCount(entityType);

  // Don't show anything if loading or count is 0
  if (isLoading || count === 0) {
    return null;
  }

  const displayCount = count > 99 ? "99+" : count;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "flex items-center justify-center",
          showNumber
            ? "ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px]"
            : "ml-auto h-2 w-2 rounded-full bg-red-500",
          className
        )}
      >
        {showNumber && (
          <span className="tabular-nums">{displayCount}</span>
        )}
        
        {/* Pulse animation ring for dot mode */}
        {!showNumber && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        )}
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * Dot-only variant for collapsed sidebar
 */
export function SidebarBadgeDot({
  entityType,
  className,
}: {
  entityType: EntityType;
  className?: string;
}) {
  return <SidebarBadge entityType={entityType} showNumber={false} className={className} />;
}
