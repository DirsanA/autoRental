import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type AdminNotification,
  type AdminNotificationCategory,
} from "@/lib/admin-notifications-api";

interface AdminNotificationsState {
  notifications: AdminNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  categoryFilter: AdminNotificationCategory | "all";
  readFilter: boolean | null;

  fetchNotifications: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  setCategoryFilter: (category: AdminNotificationCategory | "all") => void;
  setReadFilter: (read: boolean | null) => void;
  refreshUnreadCount: () => Promise<void>;
}

export const useAdminNotificationsStore = create<AdminNotificationsState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      isLoading: false,
      isLoadingMore: false,
      error: null,
      categoryFilter: "all",
      readFilter: null,

      setCategoryFilter: (category) => {
        set({ categoryFilter: category }, false, "setCategoryFilter");
        get().fetchNotifications(true);
      },

      setReadFilter: (read) => {
        set({ readFilter: read }, false, "setReadFilter");
        get().fetchNotifications(true);
      },

      fetchNotifications: async (reset = false) => {
        const { categoryFilter, readFilter } = get();
        const currentPage = reset ? 1 : get().pagination.page;

        set(
          {
            isLoading: reset,
            isLoadingMore: !reset,
            error: null,
          },
          false,
          reset ? "fetchNotifications/start" : "loadMore/start",
        );

        try {
          const result = await fetchAdminNotifications({
            page: currentPage,
            limit: 20,
            category: categoryFilter !== "all" ? categoryFilter : undefined,
            isRead: readFilter,
          });

          set(
            {
              notifications: reset
                ? result.notifications
                : [...get().notifications, ...result.notifications],
              unreadCount: result.unreadCount,
              pagination: result.pagination,
              isLoading: false,
              isLoadingMore: false,
            },
            false,
            reset ? "fetchNotifications/success" : "loadMore/success",
          );
        } catch (error) {
          set(
            {
              error: error instanceof Error ? error.message : "Failed to load",
              isLoading: false,
              isLoadingMore: false,
            },
            false,
            reset ? "fetchNotifications/error" : "loadMore/error",
          );
        }
      },

      loadMore: async () => {
        const { pagination, isLoadingMore } = get();
        if (isLoadingMore || pagination.page >= pagination.totalPages) return;

        set(
          { pagination: { ...pagination, page: pagination.page + 1 } },
          false,
          "loadMore/page",
        );
        await get().fetchNotifications(false);
      },

      markAsRead: async (id) => {
        const { notifications, unreadCount } = get();
        try {
          await markNotificationAsRead(id);
          set(
            {
              notifications: notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n,
              ),
              unreadCount: Math.max(0, unreadCount - 1),
            },
            false,
            "markAsRead",
          );
        } catch (error) {
          console.error("[AdminNotifications] Failed to mark as read:", error);
        }
      },

      markAllAsRead: async () => {
        const { notifications } = get();
        try {
          const count = await markAllNotificationsAsRead();
          set(
            {
              notifications: notifications.map((n) => ({ ...n, isRead: true })),
              unreadCount: 0,
            },
            false,
            "markAllAsRead",
          );
        } catch (error) {
          console.error("[AdminNotifications] Failed to mark all as read:", error);
        }
      },

      removeNotification: async (id) => {
        const { notifications, unreadCount } = get();
        const notification = notifications.find((n) => n.id === id);
        try {
          await deleteNotification(id);
          set(
            {
              notifications: notifications.filter((n) => n.id !== id),
              unreadCount: notification && !notification.isRead
                ? Math.max(0, unreadCount - 1)
                : unreadCount,
            },
            false,
            "removeNotification",
          );
        } catch (error) {
          console.error("[AdminNotifications] Failed to delete:", error);
        }
      },

      refreshUnreadCount: async () => {
        try {
          const { fetchAdminNotifications } = await import(
            "@/lib/admin-notifications-api"
          );
          const result = await fetchAdminNotifications({ limit: 1 });
          set({ unreadCount: result.unreadCount }, false, "refreshUnreadCount");
        } catch (error) {
          console.error("[AdminNotifications] Failed to refresh count:", error);
        }
      },
    }),
    { name: "AdminNotificationsStore" },
  ),
);
