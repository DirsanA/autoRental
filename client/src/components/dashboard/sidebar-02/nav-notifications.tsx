"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon } from "lucide-react";
import { useAdminNotificationsStore } from "@/stores/admin-notifications-store";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, string> = {
  USER_ACTIVITY: "UA",
  COMPANY_ACTIVITY: "CA",
  VEHICLE_ACTIVITY: "VA",
  VERIFICATION_ACTIVITY: "VA",
  P2P_ACTIVITY: "PA",
  SYSTEM_ALERT: "SA",
};

const CATEGORY_COLORS: Record<string, string> = {
  USER_ACTIVITY: "bg-blue-500",
  COMPANY_ACTIVITY: "bg-green-500",
  VEHICLE_ACTIVITY: "bg-orange-500",
  VERIFICATION_ACTIVITY: "bg-purple-500",
  P2P_ACTIVITY: "bg-teal-500",
  SYSTEM_ALERT: "bg-gray-500",
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationsPopover() {
  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useAdminNotificationsStore();

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const previewNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Open notifications"
        >
          <BellIcon className="size-5" />

        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-80 my-6 bg-background">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>

        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {previewNotifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <BellIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
            No notifications yet
          </div>
        ) : (
          previewNotifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-3 hover:bg-muted"
              asChild
            >
              <Link
                href={notification.actionUrl || "/sysadmin/notifications"}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <Avatar className="size-8">
                  <AvatarFallback
                    className={cn(
                      "text-white",
                      CATEGORY_COLORS[notification.category] || "bg-gray-500",
                    )}
                  >
                    {CATEGORY_ICONS[notification.category] || "N"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !notification.isRead && "font-semibold",
                    )}
                  >
                    {notification.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {notification.message}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                {!notification.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm text-muted-foreground hover:text-primary"
          asChild
        >
          <Link href="/sysadmin/notifications">View all notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
