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

export async function fetchBookingDetail(bookingId: string) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}`,
    buildRequestInit({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch booking details: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function createBookingReview(
  bookingId: string,
  reviewData: {
    rating: number;
    comment?: string;
    images?: string[];
  },
) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}/reviews`,
    buildRequestInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to create review: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function updateBookingReview(
  bookingId: string,
  reviewId: string,
  reviewData: {
    rating?: number;
    comment?: string;
    images?: string[];
  },
) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}/reviews/${encodeURIComponent(reviewId)}`,
    buildRequestInit({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to update review: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function fetchBookingReviews(bookingId: string) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}/reviews`,
    buildRequestInit({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function deleteBookingReview(bookingId: string, reviewId: string) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}/reviews/${encodeURIComponent(reviewId)}`,
    buildRequestInit({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}
