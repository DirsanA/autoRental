import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

export type EntityType = "USER" | "P2P_HOST" | "COMPANY" | "VEHICLE" | "VERIFICATION";

export interface SidebarBadgeCounts {
  users: number;
  p2pHosts: number;
  companies: number;
  vehicles: number;
  verifications: number;
}

const API_BASE = resolveApiBaseUrl();

/**
 * Mark a single entity as viewed by the current admin
 */
export async function markAsViewed(
  entityType: EntityType,
  entityId: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/view-tracking/mark-viewed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    credentials: "include",
    body: JSON.stringify({ entityType, entityId }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[ViewTracking] Failed to mark as viewed:", error);
    // Don't throw - view tracking is non-critical
  }
}

/**
 * Mark multiple entities as viewed (for list page visits)
 */
export async function markPageAsViewed(
  entityType: EntityType,
  entityIds: string[]
): Promise<void> {
  if (entityIds.length === 0) return;

  // Batch in groups of 50 to avoid payload size issues
  const batchSize = 50;
  for (let i = 0; i < entityIds.length; i += batchSize) {
    const batch = entityIds.slice(i, i + batchSize);
    
    const response = await fetch(`${API_BASE}/view-tracking/mark-page-viewed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeader(),
      },
      credentials: "include",
      body: JSON.stringify({ entityType, entityIds: batch }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[ViewTracking] Failed to mark page as viewed:", error);
      // Don't throw - view tracking is non-critical
    }
  }
}

/**
 * Get sidebar badge counts for all entity types
 */
export async function getSidebarBadgeCounts(): Promise<SidebarBadgeCounts> {
  try {
    const response = await fetch(`${API_BASE}/view-tracking/sidebar-counts`, {
      headers: buildAuthHeader(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[ViewTracking] Failed to get sidebar counts:", error);
    // Return zeros on error (don't show badges if we can't determine)
    return {
      users: 0,
      p2pHosts: 0,
      companies: 0,
      vehicles: 0,
      verifications: 0,
    };
  }
}

/**
 * Get list of viewed entity IDs from a provided list
 */
export async function getViewedIds(
  entityType: EntityType,
  entityIds: string[]
): Promise<string[]> {
  if (entityIds.length === 0) return [];

  try {
    const idsParam = entityIds.join(",");
    const response = await fetch(
      `${API_BASE}/view-tracking/viewed-ids/${entityType}?ids=${encodeURIComponent(idsParam)}`,
      {
        headers: buildAuthHeader(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.viewedIds || [];
  } catch (error) {
    console.error("[ViewTracking] Failed to get viewed IDs:", error);
    return [];
  }
}

/**
 * Mark that admin took action on an entity (approve/reject/etc)
 */
export async function markActionTaken(
  entityType: EntityType,
  entityId: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/view-tracking/mark-action-taken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    credentials: "include",
    body: JSON.stringify({ entityType, entityId }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[ViewTracking] Failed to mark action taken:", error);
    // Don't throw - view tracking is non-critical
  }
}
