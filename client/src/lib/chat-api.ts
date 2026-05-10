import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";

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

export async function fetchChatHistory(bookingId: string) {
  const response = await fetch(`${API_BASE_URL}/chat/${bookingId}/history`, buildRequestInit());
  
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to fetch chat history");
  }
  
  const payload = await response.json();
  return payload.data;
}

export async function sendChatMessage(bookingId: string, content: string) {
  const response = await fetch(`${API_BASE_URL}/chat/${bookingId}/messages`, buildRequestInit({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  }));

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to send message");
  }

  return await response.json();
}

export async function chatLifecycleAction(bookingId: string, action: string, body?: any) {
  const response = await fetch(`${API_BASE_URL}/chat/${bookingId}/${action}`, buildRequestInit({
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  }));

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Action failed");
  }

  return await response.json();
}
