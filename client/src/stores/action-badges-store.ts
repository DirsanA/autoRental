import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { EntityType, SidebarBadgeCounts } from "@/lib/view-tracking-api";
import {
  getSidebarBadgeCounts,
  markAsViewed as apiMarkAsViewed,
  markPageAsViewed as apiMarkPageAsViewed,
  getViewedIds,
} from "@/lib/view-tracking-api";

interface ActionBadgesState {
  // Sidebar badge counts
  sidebarCounts: SidebarBadgeCounts;
  
  // Set of viewed record IDs per entity type
  viewedRecords: Record<EntityType, Set<string>>;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSidebarCounts: (counts: SidebarBadgeCounts) => void;
  markAsViewed: (type: EntityType, id: string) => Promise<void>;
  markPageAsViewed: (type: EntityType, ids: string[]) => Promise<void>;
  isViewed: (type: EntityType, id: string) => boolean;
  refreshCounts: () => Promise<void>;
  getSidebarCount: (type: EntityType) => number;
  shouldShowBadge: (type: EntityType, id: string, actionRequired?: boolean) => boolean;
  markAllViewedInPage: (type: EntityType, ids: string[]) => void;
}

const DEFAULT_COUNTS: SidebarBadgeCounts = {
  users: 0,
  p2pHosts: 0,
  companies: 0,
  vehicles: 0,
  verifications: 0,
};

const DEFAULT_VIEWED_RECORDS: Record<EntityType, Set<string>> = {
  USER: new Set(),
  P2P_HOST: new Set(),
  COMPANY: new Set(),
  VEHICLE: new Set(),
  VERIFICATION: new Set(),
};

export const useActionBadgesStore = create<ActionBadgesState>()(
  devtools(
    (set, get) => ({
      sidebarCounts: DEFAULT_COUNTS,
      viewedRecords: DEFAULT_VIEWED_RECORDS,
      isLoading: false,
      error: null,

      setSidebarCounts: (counts) => {
        set({ sidebarCounts: counts }, false, "setSidebarCounts");
      },

      markAsViewed: async (type, id) => {
        const { viewedRecords, sidebarCounts } = get();
        
        // Optimistic update - add to viewed set immediately
        const newViewed = new Set(viewedRecords[type]);
        newViewed.add(id);
        
        set(
          { 
            viewedRecords: { ...viewedRecords, [type]: newViewed },
            // Decrement sidebar count for this type
            sidebarCounts: {
              ...sidebarCounts,
              [getCountKey(type)]: Math.max(0, sidebarCounts[getCountKey(type)] - 1),
            },
          },
          false,
          "markAsViewed"
        );

        // API call in background
        try {
          await apiMarkAsViewed(type, id);
        } catch (error) {
          console.error("[ActionBadgesStore] Failed to mark as viewed:", error);
          // Don't revert - if it fails, we just won't persist, but UI is updated
        }
      },

      markPageAsViewed: async (type, ids) => {
        const { viewedRecords, sidebarCounts } = get();
        
        // Count how many are actually new (not already viewed)
        const currentViewed = viewedRecords[type];
        const newViewedCount = ids.filter(id => !currentViewed.has(id)).length;
        
        if (newViewedCount === 0) return; // Nothing new to mark

        // Optimistic update
        const newViewed = new Set(currentViewed);
        ids.forEach(id => newViewed.add(id));
        
        set(
          {
            viewedRecords: { ...viewedRecords, [type]: newViewed },
            sidebarCounts: {
              ...sidebarCounts,
              [getCountKey(type)]: Math.max(0, sidebarCounts[getCountKey(type)] - newViewedCount),
            },
          },
          false,
          "markPageAsViewed"
        );

        // API call in background
        try {
          await apiMarkPageAsViewed(type, ids);
        } catch (error) {
          console.error("[ActionBadgesStore] Failed to mark page as viewed:", error);
        }
      },

      isViewed: (type, id) => {
        return get().viewedRecords[type].has(id);
      },

      shouldShowBadge: (type, id, actionRequired = false) => {
        // Only show badge if:
        // 1. Action is required (from API response)
        // 2. Record hasn't been viewed yet
        if (!actionRequired) return false;
        return !get().isViewed(type, id);
      },

      refreshCounts: async () => {
        set({ isLoading: true, error: null }, false, "refreshCounts/start");
        
        try {
          const counts = await getSidebarBadgeCounts();
          set({ sidebarCounts: counts, isLoading: false }, false, "refreshCounts/success");
        } catch (error) {
          console.error("[ActionBadgesStore] Failed to refresh counts:", error);
          set(
            { 
              error: error instanceof Error ? error.message : "Failed to refresh", 
              isLoading: false 
            },
            false,
            "refreshCounts/error"
          );
        }
      },

      getSidebarCount: (type) => {
        return get().sidebarCounts[getCountKey(type)];
      },

      markAllViewedInPage: (type, ids) => {
        const { viewedRecords } = get();
        const newViewed = new Set(viewedRecords[type]);
        ids.forEach(id => newViewed.add(id));
        
        set(
          { viewedRecords: { ...viewedRecords, [type]: newViewed } },
          false,
          "markAllViewedInPage"
        );
      },
    }),
    { name: "ActionBadgesStore" }
  )
);

/**
 * Helper to map EntityType to sidebar count key
 */
function getCountKey(type: EntityType): keyof SidebarBadgeCounts {
  switch (type) {
    case "USER":
      return "users";
    case "P2P_HOST":
      return "p2pHosts";
    case "COMPANY":
      return "companies";
    case "VEHICLE":
      return "vehicles";
    case "VERIFICATION":
      return "verifications";
    default:
      return "users";
  }
}
