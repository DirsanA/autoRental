"use client";

import { useEffect } from "react";
import type { EntityType } from "@/lib/view-tracking-api";

/**
 * Hook to automatically refresh data when a real-time signal is received
 * 
 * @param onRefresh - Callback function to trigger data reload
 * @param entityType - Optional entity type to filter refreshes
 */
export function useRealTimeRefresh(
  onRefresh: () => void,
  entityType?: EntityType | EntityType[]
) {
  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<{ entityType?: EntityType }>;
      const eventEntityType = customEvent.detail?.entityType;

      // If no entity type specified in event or hook, refresh everything
      if (!entityType || !eventEntityType) {
        onRefresh();
        return;
      }

      // If entity type matches (single or array), refresh
      const types = Array.isArray(entityType) ? entityType : [entityType];
      if (types.includes(eventEntityType)) {
        onRefresh();
      }
    };

    window.addEventListener("admin-data-refresh", handleRefresh);
    return () => window.removeEventListener("admin-data-refresh", handleRefresh);
  }, [onRefresh, entityType]);
}
