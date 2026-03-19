"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Car, Contact2, Key, Menu, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const pathname = usePathname();
  const isDetailPage =
    pathname.includes("/detail") || pathname.split("/").length > 2;
  const isWhyChoosePage = pathname === "/why-choose-us";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 mx-auto h-16 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="font-semibold text-black dark:text-white text-lg">
            <Logo />
          </div>

          {isDetailPage && (
            <div className="hidden lg:flex items-center gap-3 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md px-4 py-2 border rounded-full transition cursor-pointer">
              <span className="pr-3 border-r font-bold text-sm">
                Addis Ababa
              </span>
              <span className="px-1 text-muted-foreground text-sm">
                03/27 - 03/30
              </span>
            </div>
          )}
        </div>

        {/* Right-side menu */}
        <div className="flex items-center gap-3">
          {!isDetailPage && (
            <Button
              variant="ghost"
              onClick={() =>
                (window.location.href = isWhyChoosePage
                  ? "/become-a-host"
                  : "/why-choose-us")
              }
              className="hidden rounded-xl sm:inline-flex font-semibold"
            >
              {isWhyChoosePage ? "Become a host" : "Why choose Auto-rent?"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-3 hover:shadow-md px-3 py-6 border-gray-300 rounded-full transition-all"
              >
                <Menu size={20} />
                <div className="bg-zinc-800 p-1 rounded-full text-white">
                  <User size={18} />
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="bg-white dark:bg-black shadow-xl p-2 border border-border/50 rounded-2xl w-[280px]"
            >
              <DropdownMenuGroup>
                {/* Updated links */}
                <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-muted cursor-pointer">
                  <Link href="/auth/signin" className="w-full">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-muted cursor-pointer">
                  <Link href="/auth/signup" className="w-full">
                    Sign Up
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2 hover:bg-muted px-3 py-3 rounded-lg text-md">
                    <Car size={18} />
                    Become a host
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="p-2 rounded-xl w-48">
                      <DropdownMenuItem className="px-3 py-2 rounded-lg text-md">
                        Peer To Peer
                      </DropdownMenuItem>
                      <DropdownMenuItem className="px-3 py-2 rounded-lg text-md">
                        Register Company
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-3 py-3 text-md hover:bg-muted">
                  <Link href="/why-choose-us" className="flex items-center gap-2">
                    <Key size={18} />
                    How Auto-rent works
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted px-3 py-3 rounded-lg text-md">
                  <Contact2 size={18} />
                  Contact Support
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="hover:bg-red-50 px-3 py-3 rounded-lg text-md text-red-500">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
