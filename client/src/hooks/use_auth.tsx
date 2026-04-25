import { useEffect, useState } from "react";
import { fetchCurrentSession } from "@/lib/auth-api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSession()
      .then((data) => {
        setUser(data?.user || null);
        setCompany(data?.company || null);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    company,
    loading,
    isLoggedIn: !!user,
  };
}
