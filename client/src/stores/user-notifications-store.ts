"use client";

import { create } from "zustand";
import {
  getUserNotifications,
  getUserUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as apiDeleteNotification,
  type UserNotification,
} from "@/lib/notifications-api";

interface UserNotificationsState {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  pagination: { page: number; limit: number; totalPages: number; total: number };

  fetchNotifications: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addIncoming: (notification: UserNotification) => void;
  setUnreadCount: (count: number) => void;
}

export const useUserNotificationsStore = create<UserNotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoadingMore: false,
  pagination: { page: 1, limit: 20, totalPages: 1, total: 0 },

  fetchNotifications: async (reset = true) => {
    const { pagination } = get();
    if (reset) {
      set({ isLoading: true });
    } else {
      set({ isLoadingMore: true });
    }

    try {
      const nextPage = reset ? 1 : pagination.page + 1;
      const res = await getUserNotifications({ page: nextPage, limit: pagination.limit });

      set((state) => ({
        notifications: reset
          ? res.data.notifications
          : [...state.notifications, ...res.data.notifications],
        unreadCount: res.data.unreadCount,
        pagination: {
          page: res.data.pagination.page,
          limit: res.data.pagination.limit,
          totalPages: res.data.pagination.pages,
          total: res.data.pagination.total,
        },
      }));
    } catch (err) {
      console.error("[UserNotificationsStore] Failed to fetch:", err);
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  loadMore: async () => {
    const { isLoadingMore, pagination, fetchNotifications } = get();
    if (!isLoadingMore && pagination.page < pagination.totalPages) {
      await fetchNotifications(false);
    }
  },

  markRead: async (id: string) => {
    try {
      await markNotificationAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error("[UserNotificationsStore] Failed to mark read:", err);
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("[UserNotificationsStore] Failed to mark all read:", err);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await apiDeleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        pagination: { ...state.pagination, total: Math.max(0, state.pagination.total - 1) },
      }));
    } catch (err) {
      console.error("[UserNotificationsStore] Failed to delete:", err);
    }
  },

  addIncoming: (notification: UserNotification) => {
    set((state) => {
      if (state.notifications.some((n) => n.id === notification.id)) return state;
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    });
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },
}));
