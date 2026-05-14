"use client";

import { Bell } from "lucide-react";
import { useUserNotifications } from "@/hooks/use-user-notifications";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserNotificationsBellProps {
  /** The dashboard-specific notifications route, e.g. /renter/notifications */
  href: string;
  className?: string;
}

/**
 * A simple bell icon with an unread count badge.
 * Clicking navigates to the role-specific notifications page instead of
 * opening a popover — this avoids the "mark all read didn't update the count"
 * UX problem and keeps behaviour consistent with the sysadmin pattern.
 */
export function UserNotificationsBell({ href, className }: UserNotificationsBellProps) {
  const { unreadCount } = useUserNotifications();

  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full",
        "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute right-1 top-1 flex h-4 w-4 items-center justify-center",
            "rounded-full bg-red-500 text-[10px] font-bold text-white leading-none",
          )}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
