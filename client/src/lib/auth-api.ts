import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { coalesceRequest } from "@/lib/api-coalesce";
import {
  buildAuthHeader,
  readAuthToken,
  writeAuthToken,
} from "@/lib/auth-token";
import { resetUserRoleState } from "@/lib/role-store";

const API_BASE_URL = resolveApiBaseUrl();
const AUTH_SESSION_STORAGE_KEY = "autorent.authSession";

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof AuthApiError && error.status === 401;
}

async function parseError(response: Response) {
  try {
    const payload = await response.json();
    return (
      payload?.error?.message ||
      payload?.message ||
      `Request failed (HTTP ${response.status})`
    );
  } catch {
    return response.statusText || `Request failed (HTTP ${response.status})`;
  }
}

async function throwAuthApiError(response: Response): Promise<never> {
  throw new AuthApiError(await parseError(response), response.status);
}

function clearStoredAuthState() {
  writeAuthToken(null);
  writeCachedAuthSession(null);
  resetUserRoleState();
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

export type AuthSessionRole =
  | string
  | ({
      name?: string;
    } & Record<string, unknown>);

export type AuthSessionCompany = {
  status?: string | null;
} & Record<string, unknown>;

export type AuthSessionSnapshot = {
  user?: AuthSessionUser | null;
  session?: Record<string, unknown>;
  company?: AuthSessionCompany | null;
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

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export async function loginWithEmail(input: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) await throwAuthApiError(response);

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

  if (!response.ok) await throwAuthApiError(response);

  type AuthUser = Record<string, unknown>;

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { message?: string; user?: AuthUser };
  };

  return payload.data;
}

export async function fetchCurrentSession() {
  const tokenCacheKey = readAuthToken() || "cookie";

  return coalesceRequest(`auth-session:${tokenCacheKey}`, async () => {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearStoredAuthState();
      }
      await throwAuthApiError(response);
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: AuthSessionSnapshot;
    };

    const data = payload.data || null;
    writeCachedAuthSession(data);
    return data;
  });
}

export async function logout() {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    });
  } catch {
    clearStoredAuthState();
    return null;
  }

  clearStoredAuthState();

  if (!response.ok) await throwAuthApiError(response);

  const payload = (await response.json().catch(() => null)) as {
    data?: { message?: string };
  } | null;

  return payload?.data || null;
}

export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  image?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuthState();
    }
    await throwAuthApiError(response);
  }

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { user: AuthSessionUser };
  };

  return payload.data;
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuthState();
    }
    await throwAuthApiError(response);
  }

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { message: string };
  };

  return payload.data;
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) await throwAuthApiError(response);

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { message: string };
  };

  return payload.data;
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) await throwAuthApiError(response);

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { message: string };
  };

  return payload.data;
}
