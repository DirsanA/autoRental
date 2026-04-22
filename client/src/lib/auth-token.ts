const STORAGE_KEY = "autorent.authToken";

let cachedRaw: string | null | undefined = undefined;
let cachedToken: string | null = null;

export function readAuthToken() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cachedRaw !== undefined && raw === cachedRaw) return cachedToken;

  const token = raw && raw.trim() ? raw : null;
  cachedRaw = raw;
  cachedToken = token;
  return token;
}

export function writeAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  const next = token && token.trim() ? token.trim() : null;
  cachedRaw = next;
  cachedToken = next;

  if (!next) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, next);
}

export function buildAuthHeader(): Record<string, string> {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
