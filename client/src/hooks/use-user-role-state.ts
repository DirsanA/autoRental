"use client";

import { useSyncExternalStore } from "react";
import {
  readUserRoleState,
  subscribeToRoleStateChanges,
  type UserRoleState,
} from "@/lib/role-store";

const getServerSnapshot = (): UserRoleState => ({
  roles: { peerhost: true, renter: true },
  activeRole: "peerhost",
});

export function useUserRoleState(): UserRoleState {
  return useSyncExternalStore(
    subscribeToRoleStateChanges,
    readUserRoleState,
    getServerSnapshot,
  );
}

