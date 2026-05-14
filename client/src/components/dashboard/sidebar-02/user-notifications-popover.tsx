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
import { BellIcon, MessageSquare, CreditCard, Bell } from "lucide-react";
import { useUserNotifications } from "@/hooks/use-user-notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, any> = {
  CHAT: <MessageSquare className="size-4" />,
  PAYMENT: <CreditCard className="size-4" />,
  BOOKING: <Bell className="size-4" />,
  SYSTEM: <BellIcon className="size-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  CHAT: "bg-blue-500",
  PAYMENT: "bg-green-500",
  BOOKING: "bg-purple-500",
  SYSTEM: "bg-gray-500",
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

export function UserNotificationsPopover() {
  const { notifications, unreadCount, markRead, markAllRead } = useUserNotifications();

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
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-80 bg-background z-[100]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto px-2 py-1 text-xs text-primary"
              onClick={(e) => {
                e.preventDefault();
                markAllRead();
              }}
            >
              Mark all read
            </Button>
          )}
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
              className="flex items-start gap-3 hover:bg-muted p-3 cursor-pointer"
              asChild
            >
              <Link
                href={notification.actionUrl || "#"}
                onClick={() => {
                  if (!notification.isRead) {
                    markRead(notification.id);
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
                      "text-sm font-medium leading-none",
                      !notification.isRead && "font-bold",
                    )}
                  >
                    {notification.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                {!notification.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 mt-1" />
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm text-muted-foreground hover:text-primary py-2"
          asChild
        >
          <Link href="/profile/notifications">View all notifications</Link>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
