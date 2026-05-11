"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use_auth"; // Assuming this hook provides auth state
import { useUserRoleState } from "@/hooks/use-user-role-state";
import type { ActiveRole } from "@/lib/role-store";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /**
   * When provided, only users whose effective roles include at least one of the
   * listed roles may view the children. Users without a matching role are
   * redirected to the dashboard that matches their actual role.
   *
   * When omitted the component behaves as a plain authentication gate (any
   * logged-in user is allowed through).
   */
  allowedRoles?: ActiveRole[];
};

/**
 * Maps a user's primary role to the dashboard they should land on.
 */
function getDefaultDashboard(
  roles: Record<string, boolean>,
  activeRole: ActiveRole,
): string {
  if (roles.admin) return "/sysadmin/dashboard";
  if (roles.company) return "/company/dashboard";
  if (activeRole === "peerhost" && roles.peerhost)
    return "/peerhost/dashboard";
  return "/renter/dashboard";
}

function getPortalForRoles(allowedRoles?: ActiveRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) return "user";
  if (allowedRoles.includes("admin")) return "admin";
  if (allowedRoles.includes("company")) return "company";
  return "user";
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isLoggedIn } = useAuth();
  const { roles, activeRole } = useUserRoleState();

  useEffect(() => {
    if (loading) {
      // Optionally show a loading spinner or state
      return;
    }

    if (!isLoggedIn) {
      // Redirect to the login page if not authenticated
      const portal = getPortalForRoles(allowedRoles);
      const nextPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      router.push(
        `/auth/signin?portal=${portal}&next=${encodeURIComponent(nextPath)}`,
      );
      return;
    }

    // Role gating — only applies when allowedRoles is specified
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some((role) => roles[role]);
      if (!hasAccess) {
        router.replace(getDefaultDashboard(roles, activeRole));
      }
    }
  }, [isLoggedIn, loading, router, allowedRoles, roles, activeRole]);

  // Render children only if authenticated, otherwise null or a loading indicator
  if (loading) {
    return null; // Or a loading component
  }

  if (!isLoggedIn) return null;

  // If role gating is active and user lacks access, render nothing while redirecting
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some((role) => roles[role]);
    if (!hasAccess) return null;
  }

  return <>{children}</>;
}
