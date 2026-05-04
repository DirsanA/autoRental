"use client";

import { useEffect, useState } from "react";
import { fetchCurrentSession, isUnauthorizedError } from "@/lib/auth-api";
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
          buildUserRoleState(session, readUserRoleState()),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        if (isUnauthorizedError(error)) {
          resetUserRoleState();
        }
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
