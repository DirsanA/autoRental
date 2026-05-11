import { resolveApiBaseUrl } from "./api-base-url";
import { buildAuthHeader } from "./auth-token";

const API_BASE = resolveApiBaseUrl();

export type AdminNotificationCategory =
  | "USER_ACTIVITY"
  | "COMPANY_ACTIVITY"
  | "VEHICLE_ACTIVITY"
  | "VERIFICATION_ACTIVITY"
  | "P2P_ACTIVITY"
  | "SYSTEM_ALERT";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  category: AdminNotificationCategory;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  entityType: string;
  entityId: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminNotificationListResult {
  notifications: AdminNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export async function fetchAdminNotifications(params?: {
  page?: number;
  limit?: number;
  category?: string;
  priority?: string;
  isRead?: boolean;
}): Promise<AdminNotificationListResult> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.category) searchParams.set("category", params.category);
  if (params?.priority) searchParams.set("priority", params.priority);
  if (typeof params?.isRead === "boolean") {
    searchParams.set("isRead", String(params.isRead));
  }

  const response = await fetch(
    `${API_BASE}/admin/notifications?${searchParams.toString()}`,
    {
      headers: buildAuthHeader(),
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }

  return response.json();
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await fetch(`${API_BASE}/admin/notifications/unread-count`, {
    headers: buildAuthHeader(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch unread count: ${response.status}`);
  }

  const data = await response.json();
  return data.unreadCount;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/notifications/${id}/read`, {
    method: "PATCH",
    headers: buildAuthHeader(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to mark as read: ${response.status}`);
  }
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const response = await fetch(`${API_BASE}/admin/notifications/mark-all-read`, {
    method: "POST",
    headers: buildAuthHeader(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to mark all as read: ${response.status}`);
  }

  const data = await response.json();
  return data.count;
}

export async function markCategoriesAsRead(categories: AdminNotificationCategory[]): Promise<number> {
  const response = await fetch(`${API_BASE}/admin/notifications/mark-categories-read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    credentials: "include",
    body: JSON.stringify({ categories }),
  });

  if (!response.ok) {
    throw new Error(`Failed to mark categories as read: ${response.status}`);
  }

  const data = await response.json();
  return data.count;
}

export async function deleteNotification(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/notifications/${id}`, {
    method: "DELETE",
    headers: buildAuthHeader(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.status}`);
  }
}

export async function generateNotificationsFromPendingItems(): Promise<number> {
  const response = await fetch(`${API_BASE}/admin/notifications/generate`, {
    method: "POST",
    headers: buildAuthHeader(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to generate notifications: ${response.status}`);
  }

  const data = await response.json();
  return data.count;
}
