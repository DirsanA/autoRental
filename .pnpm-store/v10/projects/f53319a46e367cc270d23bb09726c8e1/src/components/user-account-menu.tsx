"use client";

import Link from "next/link";
import {
  Loader2,
  LogOut,
  UserCircle2,
  LayoutDashboard,
  Car,
  Building2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use_auth";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import type {
  AuthSessionCompany,
  AuthSessionRole,
  AuthSessionUser,
} from "@/lib/auth-api";
import { logout } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

type UserAccountMenuProps = {
  triggerVariant?: "ghost" | "outline";
  className?: string;
};

type UserAccountMenuState = {
  user: AuthSessionUser | null;
  company: AuthSessionCompany | null;
  loading: boolean;
};

type ResolvedUserRole = {
  label: string | null;
  badgeClassName: string;
  profileHref: string;
};

function normalizeRoleNames(roles: AuthSessionUser["roles"]): string[] {
  if (!Array.isArray(roles)) return [];

  return roles
    .map((role) => {
      if (typeof role === "string") return role.trim().toLowerCase();
      return typeof role?.name === "string"
        ? role.name.trim().toLowerCase()
        : "";
    })
    .filter(Boolean);
}

function hasRole(roles: AuthSessionRole[] | undefined, name: string): boolean {
  return normalizeRoleNames(roles).includes(name.trim().toLowerCase());
}

function resolveUserRole(
  user: AuthSessionUser,
  company: AuthSessionCompany | null,
): ResolvedUserRole {
  if (user.accountType === "ADMIN" || hasRole(user.roles, "admin")) {
    return {
      label: "System Admin",
      badgeClassName:
        "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
      profileHref: "/sysadmin/profile",
    };
  }

  if (user.accountType === "COMPANY" || company?.status === "ACTIVE") {
    return {
      label: "Company",
      badgeClassName:
        "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
      profileHref: "/company/profile",
    };
  }

  if (
    user.verificationLevel === "PEER_HOST" ||
    hasRole(user.roles, "peerhost")
  ) {
    return {
      label: "Peer Host",
      badgeClassName:
        "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      profileHref: "/renter/profile-verification",
    };
  }

  if (
    user.accountType === "USER" ||
    user.verificationLevel === "LICENSE_VERIFIED" ||
    user.verificationLevel === "ID_VERIFIED" ||
    user.verificationLevel === "NONE" ||
    !user.accountType
  ) {
    if (user.verificationLevel === "LICENSE_VERIFIED") {
      return {
        label: "License Verified Renter",
        badgeClassName:
          "border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
        profileHref: "/renter/profile-verification",
      };
    }

    if (user.verificationLevel === "ID_VERIFIED") {
      return {
        label: "ID Verified Renter",
        badgeClassName:
          "border-transparent bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
        profileHref: "/renter/profile-verification",
      };
    }

    return {
      label: null,
      badgeClassName:
        "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
      profileHref: "/renter/profile-verification",
    };
  }

  return {
    label: "No Role",
    badgeClassName:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    profileHref: "/",
  };
}

function buildDisplayName(user: AuthSessionUser): string {
  const composedName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return user.name || composedName || user.email || "Account";
}

function buildInitials(user: AuthSessionUser): string {
  const source = buildDisplayName(user);
  const parts = source
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "AR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function UserAccountMenu({
  triggerVariant = "ghost",
  className,
}: UserAccountMenuProps) {
  const auth = useAuth();

  return (
    <UserAccountMenuContent
      triggerVariant={triggerVariant}
      className={className}
      auth={auth}
    />
  );
}

type UserAccountMenuContentProps = UserAccountMenuProps & {
  auth: UserAccountMenuState;
};

export function UserAccountMenuContent({
  triggerVariant = "ghost",
  className,
  auth,
}: UserAccountMenuContentProps) {
  const { user, company, loading } = auth;
  const { roles } = useUserRoleState();

  const isAdmin =
    user?.accountType === "ADMIN" || hasRole(user?.roles, "admin");
  const isCompany =
    company?.status === "ACTIVE" || user?.accountType === "COMPANY";
  const isPeerHost = roles?.peerhost;
  const isVerified =
    user?.verificationLevel === "ID_VERIFIED" ||
    user?.verificationLevel === "LICENSE_VERIFIED";

  const shouldShowBecomePeerHost = isVerified && !isPeerHost && !isCompany && !isAdmin;
  const shouldShowRegisterCompany =
    user?.accountType === "USER" &&
    !roles.company &&
    !roles.peerhost &&
    !isAdmin &&
    isVerified;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.assign("/");
    }
  };

  if (loading) {
    return (
      <Button
        variant={triggerVariant}
        className={cn("h-10 rounded-full px-2", className)}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) return null;

  const role = resolveUserRole(user, company);
  const dashboardHref =
    isAdmin ? "/sysadmin/dashboard" : isCompany ? "/company/dashboard" : "/renter/dashboard";
  const displayName = buildDisplayName(user);
  const initials = buildInitials(user);
  const shouldShowBadge = Boolean(role.label);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={triggerVariant}
          className={cn("h-10 gap-2 rounded-full px-1.5 pr-3", className)}
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8 border border-border/60">
            {user.image ? (
              <AvatarImage src={user.image} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-muted text-foreground font-medium text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {shouldShowBadge ? (
            <Badge
              className={cn(
                "rounded-full px-2 py-0 text-[11px]",
                role.badgeClassName,
              )}
            >
              {role.label}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/60">
              {user.image ? (
                <AvatarImage src={user.image} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-none">
                {displayName}
              </p>
              <p className="truncate pt-1 text-xs leading-none text-muted-foreground">
                {user.email || "No email available"}
              </p>
              {shouldShowBadge ? (
                <Badge
                  className={cn(
                    "mt-2 rounded-full px-2 py-0 text-[11px]",
                    role.badgeClassName,
                  )}
                >
                  {role.label}
                </Badge>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={role.profileHref}>
            <UserCircle2 className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        {/* Dashboard links (role-aware) */}
        {isPeerHost ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/renter/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                My Renter Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/peerhost/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                My Peer Host Dashboard
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={dashboardHref}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              My Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {shouldShowBecomePeerHost && (
          <DropdownMenuItem asChild>
            <Link href="/peerhost/become">
              <Car className="mr-2 h-4 w-4" />
              Become a Peer Host
            </Link>
          </DropdownMenuItem>
        )}

        {shouldShowRegisterCompany && (
          <DropdownMenuItem asChild>
            <Link href="/company/register">
              <Building2 className="mr-2 h-4 w-4" />
              Register Company
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
