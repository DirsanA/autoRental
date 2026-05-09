"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useActionBadgesStore } from "@/stores/action-badges-store";
import type { EntityType } from "@/lib/view-tracking-api";

/**
 * Hook for managing action badges in components
 * Provides simplified interface to the action badges store
 */
export function useActionBadges() {
  const store = useActionBadgesStore();

  return {
    // State
    sidebarCounts: store.sidebarCounts,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    markAsViewed: store.markAsViewed,
    markPageAsViewed: store.markPageAsViewed,
    isViewed: store.isViewed,
    refreshCounts: store.refreshCounts,
    getSidebarCount: store.getSidebarCount,
    shouldShowBadge: store.shouldShowBadge,
  };
}

/**
 * Hook to get sidebar badge count for a specific entity type
 */
export function useSidebarBadgeCount(entityType: EntityType) {
  const count = useActionBadgesStore((state) =>
    state.getSidebarCount(entityType),
  );
  const refresh = useActionBadgesStore((state) => state.refreshCounts);
  const isLoading = useActionBadgesStore((state) => state.isLoading);

  return { count, refresh, isLoading };
}

/**
 * Hook to check if a specific record should show an action badge
 */
export function useRecordBadge(
  entityType: EntityType,
  entityId: string,
  actionRequired?: boolean,
) {
  const shouldShow = useActionBadgesStore((state) =>
    state.shouldShowBadge(entityType, entityId, actionRequired),
  );
  const markAsViewed = useActionBadgesStore((state) => state.markAsViewed);

  const markViewed = useCallback(async () => {
    await markAsViewed(entityType, entityId);
  }, [entityType, entityId, markAsViewed]);

  return { showBadge: shouldShow, markAsViewed: markViewed };
}

/**
 * Hook to track page views for list pages
 * Marks items as viewed when list loads
 * Badge count updates are handled by NotificationProvider (WebSocket or polling)
 */
export function usePageViewTracking(entityType: EntityType) {
  const { markPageAsViewed } = useActionBadges();

  // Function to mark a list of IDs as viewed (call when data loads)
  const trackPageView = useCallback(
    async (entityIds: string[]) => {
      if (entityIds.length === 0) return;
      await markPageAsViewed(entityType, entityIds);
    },
    [entityType, markPageAsViewed],
  );

  return {
    trackPageView,
  };
}

/**
 * Hook to track individual record view (for detail pages)
 * Marks the record as viewed when the component mounts
 */
export function useDetailViewTracking(
  entityType: EntityType,
  entityId: string | null,
) {
  const { refreshCounts, markAsViewed } = useActionBadges();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (entityId && !hasTrackedRef.current) {
      // Mark as tracked immediately to prevent duplicate calls
      hasTrackedRef.current = true;

      // Mark as viewed via API
      markAsViewed(entityType, entityId);

      // Refresh sidebar counts to update badges
      refreshCounts();
    }
  }, [entityType, entityId, markAsViewed, refreshCounts]);

  return { isTracked: hasTrackedRef.current };
}
