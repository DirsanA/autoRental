import { buildAuthHeader } from "@/lib/auth-token";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = resolveApiBaseUrl();

function buildRequestInit(init?: RequestInit): RequestInit {
  return {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      ...buildAuthHeader(),
      ...(init?.headers || {}),
    },
  };
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  isRead: boolean;
  actionUrl?: string;
  relatedEntity?: {
    id: string;
    entityType: string;
  };
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: UserNotification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export async function getUserNotifications(params: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}) {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.isRead !== undefined) query.append("isRead", params.isRead.toString());

  const response = await fetch(`${API_BASE_URL}/notifications?${query.toString()}`, buildRequestInit());
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return (await response.json()) as NotificationsResponse;
}

export async function markNotificationAsRead(id: string) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, buildRequestInit({
    method: "PATCH",
  }));
  if (!response.ok) throw new Error("Failed to mark notification as read");
  return await response.json();
}

export async function markAllNotificationsAsRead() {
  const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, buildRequestInit({
    method: "POST",
  }));
  if (!response.ok) throw new Error("Failed to mark all as read");
  return await response.json();
}

export async function getUserUnreadCount() {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, buildRequestInit());
  if (!response.ok) throw new Error("Failed to fetch unread count");
  const data = await response.json();
  return data.data.unreadCount as number;
}

export async function deleteNotification(id: string) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, buildRequestInit({
    method: "DELETE",
  }));
  if (!response.ok) throw new Error("Failed to delete notification");
  return await response.json();
}

