"use client";

import { useEffect, useState } from "react";
import { useAdminNotificationsStore } from "@/stores/admin-notifications-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationBellBadgeProps {
  className?: string;
  variant?: "pill" | "dot";
}

export function NotificationBellBadge({ 
  className, 
  variant = "pill" 
}: NotificationBellBadgeProps) {
  const { unreadCount, fetchNotifications } = useAdminNotificationsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchNotifications(true);
  }, [fetchNotifications]);

  if (!mounted || unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  if (variant === "dot") {
    return (
      <span className={cn("relative flex h-2 w-2", className)}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
      </span>
    );
  }

  return (
    <AnimatePresence>
      <motion.span
        key={unreadCount}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px] text-center shadow-sm",
          className
        )}
      >
        <span className="tabular-nums">{displayCount}</span>
      </motion.span>
    </AnimatePresence>
  );
}
