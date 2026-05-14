"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Logo } from "@/components/logo";
import { UserAccountMenuContent } from "@/components/user-account-menu";
import { useAuth } from "@/hooks/use_auth";
import { Button } from "@/components/ui/button";

import { ModeToggle } from "./mode-toggle";
import { UserNotificationsBell } from "./dashboard/sidebar-02/user-notifications-bell";

function resolveNotificationsHref(accountType?: string): string {
  if (accountType === "COMPANY") return "/company/notifications";
  if (accountType === "ADMIN")   return "/sysadmin/notifications";
  return "/renter/notifications"; // covers USER / PEERHOST / default
}

const Navbar = () => {
  const { user, company, loading } = useAuth();
  const notificationsHref = resolveNotificationsHref(user?.accountType);

  return (
    <nav className="h-16 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-3">
          {loading ? (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Loading user menu"
              disabled
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : null}

          {!loading && !user ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </>
          ) : null}

          {!loading && user ? (
            <>
              <UserNotificationsBell href={notificationsHref} />
              <UserAccountMenuContent
                triggerVariant="outline"
                auth={{ user, company, loading }}
              />
            </>
          ) : null}

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
