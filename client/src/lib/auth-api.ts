import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader, writeAuthToken } from "@/lib/auth-token";
import { resetUserRoleState } from "@/lib/role-store";

const API_BASE_URL = resolveApiBaseUrl();
const AUTH_SESSION_STORAGE_KEY = "autorent.authSession";

async function parseError(response: Response) {
  const payload = await response.json().catch(() => null);
  if (payload) {
    return JSON.stringify(payload);
  }

  return JSON.stringify({
    error: {
      message: `Request failed (HTTP ${response.status})`,
    },
  });
}


export type AuthSessionUser = {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  accountType?: string;
  roles?: AuthSessionRole[];
  verificationLevel?: string;
  status?: string;
} & Record<string, unknown>;

export type AuthSessionRole = {
  name?: string;
} & Record<string, unknown>;

export type AuthSessionCompany = {
  status?: string | null;
} & Record<string, unknown>;

export type AuthSessionSnapshot = {
  user?: AuthSessionUser | null;
  session?: Record<string, unknown>;
  company?: Record<string, unknown> | null;
};

export type AuthSessionData = AuthSessionSnapshot;

export function readCachedAuthSession(): AuthSessionSnapshot | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSessionSnapshot;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

export function writeCachedAuthSession(session: AuthSessionSnapshot | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function loginWithEmail(input: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error(await parseError(response));

  type AuthUser = Record<string, unknown>;

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { token?: string; user?: AuthUser; message?: string };
  };

  if (!payload?.data?.token) {
    throw new Error("Login succeeded but token was missing.");
  }

  return payload.data;
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error(await parseError(response));

  type AuthUser = Record<string, unknown>;

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { message?: string; user?: AuthUser };
  };

  return payload.data;
}

let _clientSessionPromise: Promise<AuthSessionData | null> | null = null;
let _clientSessionPromiseTime = 0;

export async function fetchCurrentSession() {
  const isClient = typeof window !== "undefined";
  const now = Date.now();

  if (
    isClient &&
    _clientSessionPromise &&
    now - _clientSessionPromiseTime < 5000
  ) {
    return _clientSessionPromise;
  }

  const doFetch = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(await parseError(response));

    const payload = (await response.json()) as {
      success?: boolean;
      data?: AuthSessionSnapshot;
    };

    const data = payload.data || null;
    writeCachedAuthSession(data);
    return data;
  };

  const request = doFetch().catch((error) => {
    writeCachedAuthSession(null);
    throw error;
  });

  if (isClient) {
    _clientSessionPromise = request.finally(() => {
      _clientSessionPromise = null;
    });
    _clientSessionPromiseTime = now;
    return _clientSessionPromise;
  }

  return request;
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...buildAuthHeader(),
    },
  });

  writeAuthToken(null);
  writeCachedAuthSession(null);
  resetUserRoleState();

  if (!response.ok) throw new Error(await parseError(response));

  const payload = (await response.json().catch(() => null)) as
    | { data?: { message?: string } }
    | null;

  return payload?.data || null;
}
