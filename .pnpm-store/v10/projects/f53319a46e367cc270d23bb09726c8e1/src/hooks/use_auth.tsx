import { useEffect, useState } from "react";
import {
  type AuthSessionCompany,
  type AuthSessionUser,
  fetchCurrentSession,
  isUnauthorizedError,
  readCachedAuthSession,
} from "@/lib/auth-api";
import { AUTH_TOKEN_CHANGED_EVENT, readAuthToken } from "@/lib/auth-token";

export function useAuth() {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [company, setCompany] = useState<AuthSessionCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const syncAuthState = async () => {
      const token = readAuthToken();
      const cachedSession = readCachedAuthSession();

      if (!token) {
        if (!active) return;
        setUser(null);
        setCompany(null);
        setLoading(false);
        return;
      }

      if (active && !cachedSession?.user) {
        setLoading(true);
      }

      if (active && cachedSession) {
        setUser(cachedSession.user || null);
        setCompany(cachedSession.company || null);
      }

      try {
        const data = await fetchCurrentSession();
        if (!active) return;
        setUser(data?.user || null);
        setCompany(data?.company || null);
      } catch (error) {
        if (!active) return;
        if (isUnauthorizedError(error)) {
          setUser(null);
          setCompany(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const handleAuthChange = () => {
      void syncAuthState();
    };

    void syncAuthState();
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return {
    user,
    company,
    loading,
    isLoggedIn: !!user,
  };
}
