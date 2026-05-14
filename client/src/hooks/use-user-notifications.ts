/**
 * useUserNotifications
 *
 * Thin hook that:
 * 1. Reads from / dispatches to the singleton Zustand store so ALL components
 *    (bell badge, notification page, etc.) share one state instance.
 * 2. On first mount, bootstraps the store by fetching from the API.
 * 3. Wires real-time socket events from NotificationProvider into the store.
 */
"use client";

import { useEffect, useRef } from "react";
import { useUserNotificationsStore } from "@/stores/user-notifications-store";

export function useUserNotifications() {
  const store = useUserNotificationsStore();
  const bootstrapped = useRef(false);

  // Bootstrap: fetch once per session (first component to mount wins)
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    store.fetchNotifications(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Wire real-time socket events from the global NotificationProvider
  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const notification = (e as CustomEvent).detail;
      useUserNotificationsStore.getState().addIncoming(notification);
    };

    const handleCountUpdate = (e: Event) => {
      const count = (e as CustomEvent).detail as number;
      useUserNotificationsStore.getState().setUnreadCount(count);
    };

    window.addEventListener("user-notification-received", handleNewNotification);
    window.addEventListener("user-unread-count-updated", handleCountUpdate);

    return () => {
      window.removeEventListener("user-notification-received", handleNewNotification);
      window.removeEventListener("user-unread-count-updated", handleCountUpdate);
    };
  }, []);

  return store;
}
