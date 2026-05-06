"use client";

/**
 * Formats a currency-like number for admin detail views.
 */
export function formatMoney(value: number | null, currency = "USD") {
  if (typeof value !== "number") return "Not available";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a date-time value into a readable admin-facing label.
 */
export function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

/**
 * Formats a date-only value for compact summary sections.
 */
export function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not available";
}

/**
 * Converts enum-like strings into readable labels.
 */
export function formatLabel(value: string | null | undefined) {
  if (!value) return "Not available";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Masks sensitive identifiers while keeping the trailing characters visible.
 */
export function maskIdentity(value: string | null) {
  if (!value) return "Not provided";
  if (value.length <= 4) return value;
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}
