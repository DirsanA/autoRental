export type ActiveRole = "peerhost" | "renter";

export type Roles = {
  peerhost: boolean;
  renter: boolean;
};

export type UserRoleState = {
  roles: Roles;
  activeRole: ActiveRole;
};

const STORAGE_KEY = "autorent.userRoleState";
const ROLE_CHANGE_EVENT = "autorent:role-changed";

const DEFAULT_STATE: UserRoleState = {
  roles: { peerhost: true, renter: true },
  activeRole: "peerhost",
};

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
  if (v.activeRole !== "peerhost" && v.activeRole !== "renter") return false;
  if (!v.roles || typeof v.roles !== "object") return false;
  const r = v.roles as Partial<Roles>;
  if (typeof r.peerhost !== "boolean") return false;
  if (typeof r.renter !== "boolean") return false;
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

export function toggleActiveRole(state: UserRoleState): UserRoleState {
  return {
    ...state,
    activeRole: state.activeRole === "peerhost" ? "renter" : "peerhost",
  };
}

export function subscribeToRoleStateChanges(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    // React to both same-tab custom event and cross-tab localStorage changes.
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

