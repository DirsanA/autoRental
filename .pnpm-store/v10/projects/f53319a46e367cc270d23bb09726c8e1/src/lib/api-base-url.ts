export function resolveApiBaseUrl() {
  // Supports either:
  // - NEXT_PUBLIC_API_BASE_URL="http://localhost:5000"  (we append /api)
  // - NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api" (we keep as-is)
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}
