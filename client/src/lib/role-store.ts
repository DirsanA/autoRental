export type ActiveRole = "peerhost" | "renter" | "company";

export type Roles = {
  peerhost: boolean;
  renter: boolean;
  company: boolean;
};

export type UserRoleState = {
  roles: Roles;
  activeRole: ActiveRole;
  companyStatus: string | null;
};

export type RoleStateSourceUser = {
  accountType?: string | null;
  roles?: unknown;
  verificationLevel?: string | null;
};

type RoleStateSource =
  | (RoleStateSourceUser & {
      company?: { status?: string | null } | null;
      user?: undefined;
    })
  | {
      user?: RoleStateSourceUser | null;
      company?: { status?: string | null } | null;
    };

const STORAGE_KEY = "autorent.userRoleState";
const ROLE_CHANGE_EVENT = "autorent:role-changed";

const DEFAULT_STATE: UserRoleState = {
  roles: { peerhost: false, renter: true, company: false },
  activeRole: "renter",
  companyStatus: null,
};

function extractUser(source: RoleStateSource | null | undefined) {
  if (!source) return null;
  if ("user" in source) return source.user || null;
  return source;
}

function extractCompanyStatus(source: RoleStateSource | null | undefined) {
  if (!source || !("company" in source)) return null;
  return typeof source.company?.status === "string" ? source.company.status : null;
}

function hasPeerHostAccess(source: RoleStateSource | null | undefined) {
  const user = extractUser(source);
  if (!user || user.accountType !== "USER") {
    return false;
  }

  const roleNames = Array.isArray(user.roles)
    ? user.roles.filter((role): role is string => typeof role === "string")
    : [];

  return (
    user.verificationLevel === "PEER_HOST" ||
    roleNames.some((role) => role.toLowerCase() === "peerhost")
  );
}

function hasCompanyAccess(source: RoleStateSource | null | undefined) {
  return extractCompanyStatus(source) === "ACTIVE";
}

let cachedRaw: string | null | undefined = undefined;
let cachedState: UserRoleState = DEFAULT_STATE;

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isUserRoleState(value: unknown): value is UserRoleState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<UserRoleState>;
  if (
    v.activeRole !== "peerhost" &&
    v.activeRole !== "renter" &&
    v.activeRole !== "company"
  ) {
    return false;
  }
  if (!v.roles || typeof v.roles !== "object") return false;
  const r = v.roles as Partial<Roles>;
  if (typeof r.peerhost !== "boolean") return false;
  if (typeof r.renter !== "boolean") return false;
  if (typeof r.company !== "boolean") return false;
  if (v.companyStatus !== null && typeof v.companyStatus !== "string") return false;
  return true;
}

export function readUserRoleState(): UserRoleState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cachedRaw !== undefined && raw === cachedRaw) return cachedState;

  const parsed = safeParse(raw);
  const next = isUserRoleState(parsed) ? parsed : DEFAULT_STATE;
  cachedRaw = raw;
  cachedState = next;
  return next;
}

export function writeUserRoleState(next: UserRoleState) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(next);
  cachedRaw = raw;
  cachedState = next;
  window.localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));
}

export function buildUserRoleState(
  source: RoleStateSource | null | undefined,
  current: UserRoleState = DEFAULT_STATE,
): UserRoleState {
  const peerhost = hasPeerHostAccess(source);
  const company = hasCompanyAccess(source);
  const companyStatus = extractCompanyStatus(source);

  const activeRole =
    current.activeRole === "company" && company
      ? "company"
      : current.activeRole === "peerhost" && peerhost
        ? "peerhost"
        : "renter";

  return {
    roles: {
      renter: true,
      peerhost,
      company,
    },
    activeRole,
    companyStatus,
  };
}

export function resetUserRoleState() {
  writeUserRoleState(DEFAULT_STATE);
}

export function toggleActiveRole(state: UserRoleState): UserRoleState {
  if (state.activeRole === "peerhost") {
    return {
      ...state,
      activeRole: state.roles.company ? "company" : "renter",
    };
  }

  if (state.activeRole === "company") {
    return {
      ...state,
      activeRole: "renter",
    };
  }

  return {
    ...state,
    activeRole: state.roles.peerhost
      ? "peerhost"
      : state.roles.company
        ? "company"
        : "renter",
  };
}

export function subscribeToRoleStateChanges(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    if (e.type === ROLE_CHANGE_EVENT) callback();
    if (e.type === "storage") callback();
  };

  window.addEventListener(ROLE_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(ROLE_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
