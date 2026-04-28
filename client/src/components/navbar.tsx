"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Car,
  Loader2,
  LayoutDashboard,
  LogOut,
  User,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/hooks/use_auth";
import { UserAccountMenuContent } from "@/components/user-account-menu";

const Navbar = () => {
  const { user, company, loading } = useAuth();

  const handleRegisterCompany = () => {
    router.push("/auth/becomehost");
  };

  const handleBecomePeerHost = () => {
    router.push("/peerhost/become-host");
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };


  const companyStatus = company?.status;
  const companyMenuLabel =
    companyStatus === "ACTIVE"
      ? "Company Dashboard"
      : companyStatus === "PENDING_APPROVAL"
        ? "Company Application Pending"
        : "Register Company";

  return (
    <nav className="h-16 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-3">
          {loading && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Loading user menu"
              disabled
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          )}

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
