"use client";

import { useSyncExternalStore } from "react";
import {
  readUserRoleState,
  subscribeToRoleStateChanges,
  type UserRoleState,
} from "@/lib/role-store";

// Cache the server snapshot so that getServerSnapshot
// returns a stable value and avoids React warnings.
const SERVER_SNAPSHOT: UserRoleState = {
  roles: { peerhost: false, renter: true, company: false },
  activeRole: "renter",
  companyStatus: null,
};

const getServerSnapshot = (): UserRoleState => SERVER_SNAPSHOT;

export function useUserRoleState(): UserRoleState {
  return useSyncExternalStore(
    subscribeToRoleStateChanges,
    readUserRoleState,
    getServerSnapshot,
  );
}

