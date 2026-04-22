"use client";

import { useEffect, useState } from "react";
import { fetchCurrentSession } from "@/lib/auth-api";
import {
  buildUserRoleState,
  readUserRoleState,
  resetUserRoleState,
  writeUserRoleState,
} from "@/lib/role-store";

/**
 * Keeps the client-side dashboard role state aligned with the real session user.
 */
export function useSyncUserRoleState() {
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentSession()
      .then((session) => {
        if (cancelled) return;
        writeUserRoleState(
          buildUserRoleState(session?.user, readUserRoleState()),
        );
      })
      .catch(() => {
        if (cancelled) return;
        resetUserRoleState();
      })
      .finally(() => {
        if (cancelled) return;
        setIsSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isSyncing };
}
