"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Car, Contact2, Key, Menu, Notebook, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";
import { AuthModal } from "@/components/auth-modal";

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
  const [authOpen, setAuthOpen] = useState(false);

  const pathname = usePathname();
  const isDetailPage =
    pathname.includes("/detail") || pathname.split("/").length > 2;

  return (
    <nav className="top-0 z-50 fixed inset-x-0 bg-background/80 backdrop-blur-xl mx-auto border-border/40 border-b w-full h-16 transition-all">
      <div className="flex justify-between items-center mx-auto px-6 max-w-7xl h-full">
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
              <div className="bg-[#593CFB] p-1.5 rounded-full text-white">
                <Search size={14} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isDetailPage && (
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/why-choose-us")}
              className="hidden sm:inline-flex rounded-xl font-semibold"
            >
              Why choose Auto-rent?
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
                <DropdownMenuItem
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 hover:bg-muted px-3 py-3 rounded-lg font-semibold text-md cursor-pointer"
                >
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 hover:bg-muted px-3 py-3 rounded-lg font-medium text-md cursor-pointer"
                >
                  Sign Up
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

                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted px-3 py-3 rounded-lg text-md">
                  <Key size={18} />
                  How Auto-rent works
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
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </nav>
  );
};

export default Navbar;
