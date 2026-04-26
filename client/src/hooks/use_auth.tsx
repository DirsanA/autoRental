import { useEffect, useState } from "react";
import type {
  AuthSessionCompany,
  AuthSessionUser,
} from "@/lib/auth-api";
import { fetchCurrentSession } from "@/lib/auth-api";

export function useAuth() {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [company, setCompany] = useState<AuthSessionCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentSession()
      .then((data) => {
        if (cancelled) return;
        setUser(data?.user || null);
        setCompany(data?.company || null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    company,
    loading,
    isLoggedIn: !!user,
  };
}
