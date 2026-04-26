"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/hooks/use_auth";
import { UserAccountMenuContent } from "@/components/user-account-menu";

const Navbar = () => {
  const { user, company, loading } = useAuth();

  return (
    <nav className="h-16 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-3">
          {!loading && !user && (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}

          {!loading && user && (
            <UserAccountMenuContent
              triggerVariant="outline"
              auth={{ user, company, loading }}
            />
          )}

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
