"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useActionBadgesStore } from "@/stores/action-badges-store";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { generateNotificationsFromPendingItems } from "@/lib/admin-notifications-api";
import { useAdminNotificationsStore } from "@/stores/admin-notifications-store";
import type { SidebarBadgeCounts, EntityType } from "@/lib/view-tracking-api";
import { getSidebarBadgeCounts } from "@/lib/view-tracking-api";

interface NotificationContextType {
  // Connection state
  isConnected: boolean;
  transport: "websocket" | "polling" | "http" | null;
  
  // Manual refresh (fallback when disconnected)
  refreshBadgeCounts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const API_BASE = resolveApiBaseUrl();
// Convert http:// or https:// to ws:// or wss:// for WebSocket
// IMPORTANT: Socket.io server is mounted on the root, so we strip /api if present
const WS_URL = API_BASE.replace(/^http/, "ws").replace(/\/api$/, "");

interface NotificationProviderProps {
  children: ReactNode;
  adminId?: string;
  userId?: string;
}

/**
 * Notification Provider with WebSocket + Polling fallback
 * 
 * Migration-friendly architecture:
 * 1. Tries WebSocket first for real-time updates
 * 2. Falls back to HTTP polling every 30s if WebSocket fails
 * 3. Components use the same hooks regardless of transport
 * 4. Can switch between transports without code changes
 */
export function NotificationProvider({
  children,
  adminId,
  userId,
}: NotificationProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState<"websocket" | "polling" | "http" | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const setSidebarCounts = useActionBadgesStore((state) => state.setSidebarCounts);
  const refreshCounts = useActionBadgesStore((state) => state.refreshCounts);
  const fetchNotifications = useAdminNotificationsStore((state) => state.fetchNotifications);

  /**
   * Manual refresh via HTTP (used as fallback)
   */
  const refreshBadgeCounts = useCallback(async () => {
    try {
      const counts = await getSidebarBadgeCounts();
      setSidebarCounts(counts);
    } catch (error) {
      console.error("[NotificationProvider] Failed to refresh counts:", error);
    }
  }, [setSidebarCounts]);

  /**
   * Start HTTP polling fallback
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Already polling
    
    console.log("[NotificationProvider] Starting HTTP polling fallback");
    setTransport("http");
    
    // Immediate first fetch
    refreshBadgeCounts();
    fetchNotifications(true);
    
    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      refreshBadgeCounts();
      fetchNotifications(true);
    }, 30000);
  }, [refreshBadgeCounts, fetchNotifications]);

  /**
   * Stop HTTP polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle real-time badge count update from WebSocket
   */
  const handleBadgeCountUpdate = useCallback((counts: SidebarBadgeCounts) => {
    setSidebarCounts(counts);
  }, [setSidebarCounts]);

  /**
   * Handle entity viewed event (clear specific badge)
   */
  const handleEntityViewed = useCallback((data: {
    entityType: EntityType;
    entityId: string;
    timestamp: string;
  }) => {
    // Update store to mark this entity as viewed
    const store = useActionBadgesStore.getState();
    store.markAllViewedInPage(data.entityType, [data.entityId]);
  }, []);

  /**
   * Handle new action-required entity
   */
  const handleNewActionRequired = useCallback((data: {
    entityType: EntityType;
    entityId: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
  }) => {
    // Refresh counts to get updated badge numbers
    refreshBadgeCounts();
    
    // Dispatch global event for pages to refresh their lists
    window.dispatchEvent(new CustomEvent("admin-data-refresh", { 
      detail: { entityType: data.entityType } 
    }));
    
    console.log("[NotificationProvider] New action required:", data);
  }, [refreshBadgeCounts]);

  /**
   * Handle admin inbox update (refresh notifications list)
   */
  const handleAdminInboxUpdate = useCallback(() => {
    console.log("[NotificationProvider] Admin inbox refresh triggered via socket");
    fetchNotifications(true); // Reset and fetch fresh notifications
  }, [fetchNotifications]);

  /**
   * Initial data load
   */
  useEffect(() => {
    const initData = async () => {
      // 1. Ensure notifications are generated from any existing pending items
      try {
        await generateNotificationsFromPendingItems();
      } catch (err) {
        console.error("[NotificationProvider] Failed to generate notifications:", err);
      }
      
      // 2. Initial fetch of notifications
      fetchNotifications(true);
      
      // 3. Initial refresh of badge counts
      refreshBadgeCounts();
    };

    if (adminId) {
      initData();
    }
  }, [adminId, fetchNotifications, refreshBadgeCounts]);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    if (!adminId && !userId) {
      // No identity, use HTTP polling as fallback if needed
      startPolling();
      return;
    }

    // Initialize Socket.io connection
    const socket = io(WS_URL, {
      transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection opened
    socket.on("connect", () => {
      console.log("[NotificationProvider] WebSocket connected:", socket.id);
      setIsConnected(true);
      setTransport(socket.io.engine?.transport?.name as any || "websocket");
      
      // Authenticate with admin or user ID
      if (adminId) {
        socket.emit("authenticate", { adminId });
      } else if (userId) {
        socket.emit("authenticate", { userId });
      }
      
      // Stop HTTP polling since WebSocket is working
      stopPolling();
    });

    // Connection lost
    socket.on("disconnect", (reason) => {
      console.log("[NotificationProvider] WebSocket disconnected:", reason);
      setIsConnected(false);
      setTransport(null);
      
      // Start HTTP polling as fallback
      startPolling();
    });

    // Listen for badge count updates
    socket.on("v1:badge-counts:update", handleBadgeCountUpdate);

    // Listen for entity viewed events
    socket.on("v1:entity:viewed", handleEntityViewed);

    // Listen for new action-required entities
    socket.on("v1:entity:new-action-required", handleNewActionRequired);

    // Listen for admin inbox refresh events
    socket.on("v1:admin-inbox:refresh", handleAdminInboxUpdate);

    // Listen for general user notifications
    socket.on("v1:user-notification:new", (notification: any) => {
      console.log("[NotificationProvider] New user notification received:", notification);
      
      // Dispatch a browser notification or update state if we had a user store
      // For now, we'll trigger a global event so UI components can react
      window.dispatchEvent(new CustomEvent("user-notification-received", { 
        detail: notification 
      }));

      // If we have a toast system, we could show it here
      // import { toast } from "@/components/ui/use-toast";
      // toast({ title: notification.title, description: notification.message });
    });

    // Listen for unread count updates
    socket.on("v1:user-notification:unread-count", (data: { count: number }) => {
      console.log("[NotificationProvider] User unread count updated:", data.count);
      window.dispatchEvent(new CustomEvent("user-unread-count-updated", { 
        detail: data.count 
      }));
    });

    // Listen for status changes
    socket.on("v1:entity:status-changed", (data?: any) => {
      console.log("[NotificationProvider] Entity status changed, refreshing...");
      refreshBadgeCounts();
      handleAdminInboxUpdate();
      
      // Dispatch global event
      window.dispatchEvent(new CustomEvent("admin-data-refresh", { 
        detail: { entityType: data?.entityType } 
      }));
    });

    // Connection error
    socket.on("connect_error", (error) => {
      console.error("[NotificationProvider] WebSocket connection error:", error);
      // Will automatically try polling transport then give up
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      stopPolling();
    };
  }, [
    adminId,
    handleBadgeCountUpdate,
    handleEntityViewed,
    handleNewActionRequired,
    handleAdminInboxUpdate,
    refreshBadgeCounts,
    startPolling,
    stopPolling,
    userId,
  ]);

  // If no identity provided, just use polling
  useEffect(() => {
    if (!adminId && !userId && !pollingIntervalRef.current) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [adminId, startPolling, stopPolling]);

  const value: NotificationContextType = {
    isConnected,
    transport,
    refreshBadgeCounts: refreshCounts, // Use store's refresh method
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification context
 */
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return default values if provider not present
    return {
      isConnected: false,
      transport: "http",
      refreshBadgeCounts: async () => {},
    };
  }
  return context;
}
