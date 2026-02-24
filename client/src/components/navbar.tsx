"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Car, Contact2, Key, Menu, Notebook, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const pathname = usePathname();
  // Check if we are on a detail page (e.g., /cars/123 or /detail/123)
  const isDetailPage =
    pathname.includes("/detail") || pathname.split("/").length > 2;

  return (
    <nav className="fixed inset-x-0 top-0 z-50 mx-auto h-16 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* LEFT SIDE: Logo & Search (Search only shows on Detail Page) */}
        <div className="flex items-center gap-6">
          <div className="text-black text-lg font-semibold dark:text-white">
            <Logo />
          </div>

          {isDetailPage && (
            <div className="hidden lg:flex items-center gap-3 border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition cursor-pointer bg-white dark:bg-zinc-900">
              <span className="text-sm font-bold border-r pr-3">
                Addis Ababa
              </span>
              <span className="text-sm text-muted-foreground px-1">
                03/27 - 03/30
              </span>
              <div className="bg-[#593CFB] p-1.5 rounded-full text-white">
                <Search size={14} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Menu & Toggle */}
        <div className="flex items-center gap-3">
          {/* Only show "Why Choose" if NOT on detail page */}
          {!isDetailPage && (
            <Button
              variant="ghost"
              className="hidden rounded-xl sm:inline-flex font-semibold"
            >
              Why choose Auto-rent?
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-3 rounded-full border-gray-300 py-6 px-3 hover:shadow-md transition-all"
              >
                <Menu size={20} />
                <div className="bg-zinc-800 text-white p-1 rounded-full">
                  <User size={18} />
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-[280px] rounded-2xl border border-border/50 bg-white p-2 shadow-xl dark:bg-black"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="flex text-md font-semibold items-center gap-2 rounded-lg px-3 py-3 hover:bg-muted cursor-pointer">
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center text-md font-medium gap-2 rounded-lg px-3 py-3 hover:bg-muted cursor-pointer">
                  Sign Up
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center text-md gap-2 rounded-lg px-3 py-3 hover:bg-muted">
                    <Car size={18} />
                    Become a host
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-xl p-2 w-48">
                      <DropdownMenuItem className="rounded-lg px-3 py-2 text-md">
                        Peer To Peer
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg px-3 py-2 text-md">
                        Register Company
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-3 py-3 text-md hover:bg-muted">
                  <Key size={18} />
                  How Auto-rent works
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-3 py-3 text-md hover:bg-muted">
                  <Contact2 size={18} />
                  Contact Support
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="rounded-lg px-3 py-3 text-md text-red-500 hover:bg-red-50">
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
