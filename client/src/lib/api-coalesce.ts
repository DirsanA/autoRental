/**
 * Utility to deduplicate and cache API requests in flight on the client side.
 * This prevents "request spam" where multiple components trigger the same
 * API call simultaneously (e.g. during page load or re-renders).
 */

const inFlight = new Map<string, Promise<unknown>>();
const lastResults = new Map<string, { data: unknown; time: number }>();

export async function coalesceRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5000,
): Promise<T> {
  const isClient = typeof window !== "undefined";

  // SSR: No caching/coalescing to avoid cross-user pollution in Node.js process memory
  if (!isClient) {
    return fetcher();
  }

  const now = Date.now();

  // 1. Check for a very recent successful result
  const cached = lastResults.get(key);
  if (cached && now - cached.time < ttl) {
    return cached.data as T;
  }

  // 2. Check if the same request is already in flight
  const existing = inFlight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  // 3. Start a new request
  const promise = fetcher()
    .then((result) => {
      lastResults.set(key, { data: result, time: Date.now() });
      inFlight.delete(key);
      return result;
    })
    .catch((error) => {
      inFlight.delete(key);
      throw error;
    });

  inFlight.set(key, promise);
  return promise;
}
