"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Eye,
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  useAdminNotificationsStore,
} from "@/stores/admin-notifications-store";
import type {
  AdminNotification,
  AdminNotificationCategory,
} from "@/lib/admin-notifications-api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const CATEGORY_CONFIG: Record<
  AdminNotificationCategory,
  { label: string; cls: string; icon: string }
> = {
  USER_ACTIVITY: {
    label: "User",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "US",
  },
  COMPANY_ACTIVITY: {
    label: "Company",
    cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: "CO",
  },
  VEHICLE_ACTIVITY: {
    label: "Vehicle",
    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: "VE",
  },
  VERIFICATION_ACTIVITY: {
    label: "Verification",
    cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: "VF",
  },
  P2P_ACTIVITY: {
    label: "P2P Host",
    cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    icon: "P2",
  },
  SYSTEM_ALERT: {
    label: "System",
    cls: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    icon: "SY",
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; dot: string }
> = {
  URGENT: { label: "Urgent", dot: "bg-red-500" },
  HIGH: { label: "High", dot: "bg-orange-500" },
  MEDIUM: { label: "Medium", dot: "bg-yellow-500" },
  LOW: { label: "Low", dot: "bg-green-500" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: AdminNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const categoryConfig = CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG.SYSTEM_ALERT;
  const priorityConfig = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.LOW;

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <TableRow
      className={cn(
        "group cursor-pointer transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20",
      )}
      onClick={handleClick}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-semibold text-white",
              categoryConfig.cls,
            )}
          >
            {categoryConfig.icon}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  !notification.isRead && "font-semibold",
                )}
              >
                {notification.title}
              </span>
              {!notification.isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
            <span className="truncate text-xs text-muted-foreground">
              {notification.message}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              categoryConfig.cls,
            )}
          >
            {categoryConfig.label}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", priorityConfig.dot)} />
          <span className="text-sm text-muted-foreground">
            {priorityConfig.label}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {formatDate(notification.createdAt)}
      </TableCell>

      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-70 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => onMarkRead(notification.id)}
              disabled={notification.isRead}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark read
            </DropdownMenuItem>
            {notification.actionUrl && (
              <DropdownMenuItem onClick={handleClick}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(notification.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    categoryFilter,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setCategoryFilter,
  } = useAdminNotificationsStore();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && pagination.page < pagination.totalPages) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById("infinite-scroll-sentinel");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [loadMore, isLoadingMore, pagination.page, pagination.totalPages]);

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await removeNotification(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="flex flex-1 flex-col min-h-0">
        <Header />
        <Main className="gap-6 p-6 md:p-8 pb-20">
          <div className="flex flex-col gap-2">
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Notifications
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Stay updated with activity across the platform. See major changes
              from users, peer hosts, companies, and more.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value as AdminNotificationCategory | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="USER_ACTIVITY">User Activity</SelectItem>
                  <SelectItem value="COMPANY_ACTIVITY">Company Activity</SelectItem>
                  <SelectItem value="VEHICLE_ACTIVITY">Vehicle Activity</SelectItem>
                  <SelectItem value="VERIFICATION_ACTIVITY">Verification</SelectItem>
                  <SelectItem value="P2P_ACTIVITY">P2P Host Activity</SelectItem>
                  <SelectItem value="SYSTEM_ALERT">System Alerts</SelectItem>
                </SelectContent>
              </Select>

              {unreadCount > 0 && (
                <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {unreadCount} unread
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllRead}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-medium">Error loading notifications</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Notification</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[72px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                        <span>Loading notifications...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <BellOff className="h-8 w-8 opacity-30" />
                        <span>No notifications yet</span>
                        <span className="text-xs">
                          New activity will appear here
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={(id) => setDeleteTarget(id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Infinite Scroll Sentinel */}
            {notifications.length > 0 && (
              <div 
                id="infinite-scroll-sentinel" 
                className="flex items-center justify-center p-8 text-muted-foreground"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                ) : pagination.page < pagination.totalPages ? (
                  <span className="text-xs opacity-50 italic">Scroll for more</span>
                ) : (
                  <span className="text-xs opacity-50 italic">End of notifications</span>
                )}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {notifications.length} of {pagination.total} notifications
            </p>
            {pagination.page < pagination.totalPages && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => loadMore()}
                disabled={isLoadingMore}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {isLoadingMore ? "Loading..." : "Click to load more"}
              </Button>
            )}
          </div>
        </Main>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
