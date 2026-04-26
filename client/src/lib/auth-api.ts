import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader, writeAuthToken } from "@/lib/auth-token";
import { resetUserRoleState } from "@/lib/role-store";

const API_BASE_URL = resolveApiBaseUrl();

async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  return payload?.error?.message || `Request failed (HTTP ${response.status})`;
}

export type AuthSessionRole = string | { name?: string } | null;

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

export type AuthSessionCompany = {
  status?: string | null;
} & Record<string, unknown>;

export type AuthSessionData = {
  user?: AuthSessionUser;
  session?: Record<string, unknown>;
  company?: AuthSessionCompany | null;
};

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

export async function fetchCurrentSession() {
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
    data?: AuthSessionData;
  };

  return payload.data || null;
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
  resetUserRoleState();

  if (!response.ok) throw new Error(await parseError(response));

  const payload = (await response.json().catch(() => null)) as
    | { data?: { message?: string } }
    | null;

  return payload?.data || null;
}
