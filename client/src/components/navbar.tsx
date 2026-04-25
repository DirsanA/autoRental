"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Car,
  LayoutDashboard,
  LogOut,
  User,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/hooks/use_auth";
import { logout } from "@/lib/auth-api";

const Navbar = () => {
  const router = useRouter();
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
    } finally {
      router.push("/");
      router.refresh();
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label="Open user menu"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[260px]">
                <DropdownMenuItem asChild>
                  <Link href="/renter/profile-verification">
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/renter/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Renter Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleBecomePeerHost}>
                  <Car className="mr-2 h-4 w-4" />
                  Become a Peer Host
                </DropdownMenuItem>

                {companyStatus === "ACTIVE" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/company/dashboard">
                      <Building2 className="mr-2 h-4 w-4" />
                      {companyMenuLabel}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleRegisterCompany}
                    disabled={companyStatus === "PENDING_APPROVAL"}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {companyMenuLabel}
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
