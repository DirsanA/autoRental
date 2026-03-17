"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, BadgeCheck, BookOpen, Home, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { writeUserRoleState } from "@/lib/role-store";

export function RenterSidebar() {
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  const router = useRouter();
  const roleState = useUserRoleState();

  function switchToPeerHost() {
    const next = { ...roleState, activeRole: "peerhost" as const };
    writeUserRoleState(next);
    router.push("/peerhost/dashboard");
  }

  function becomePeerHost() {
    const next = {
      ...roleState,
      roles: { ...roleState.roles, peerhost: true },
      activeRole: "peerhost" as const,
    };
    writeUserRoleState(next);
    router.push("/peerhost/become-host");
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between",
        )}
      >
        <Link href="/renter/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-semibold">
            AR
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              AutoRent
            </span>
          )}
        </Link>

        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Dashboard" asChild>
              <Link
                href="/renter/dashboard"
                prefetch={true}
                className={cn(
                  "flex items-center hover:bg-sidebar-muted px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                  isCollapsed && "justify-center",
                )}
              >
                <Home className="size-4" />
                {!isCollapsed && (
                  <span className="ml-2 font-medium text-sm">Dashboard</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Booking History" asChild>
              <Link
                href="/renter/booking-history"
                prefetch={true}
                className={cn(
                  "flex items-center hover:bg-sidebar-muted px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                  isCollapsed && "justify-center",
                )}
              >
                <BookOpen className="size-4" />
                {!isCollapsed && (
                  <span className="ml-2 font-medium text-sm">
                    Booking History
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile & Verification" asChild>
              <Link
                href="/renter/profile-verification"
                prefetch={true}
                className={cn(
                  "flex items-center hover:bg-sidebar-muted px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                  isCollapsed && "justify-center",
                )}
              >
                <User className="size-4" />
                {!isCollapsed && (
                  <span className="ml-2 font-medium text-sm">
                    Profile &amp; Verification
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={roleState.roles.peerhost ? "Switch to Peer Host" : "Become Peer Host"}
              onClick={
                roleState.roles.peerhost ? switchToPeerHost : becomePeerHost
              }
              className={cn(
                "flex items-center hover:bg-sidebar-muted px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                isCollapsed && "justify-center",
              )}
            >
              {roleState.roles.peerhost ? (
                <ArrowLeftRight className="size-4" />
              ) : (
                <BadgeCheck className="size-4" />
              )}
              {!isCollapsed && (
                <span className="ml-2 font-medium text-sm">
                  {roleState.roles.peerhost ? "Switch to Peer Host" : "Become Peer Host"}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => {
                const next = {
                  ...roleState,
                  activeRole: "peerhost" as const,
                };
                // If they tap the footer action, just switch to peerhost dashboard.
                writeUserRoleState(next);
                router.push("/peerhost/dashboard");
              }}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-foreground">
                <ArrowLeftRight className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Switch Role</span>
                <span className="truncate text-xs">Go to peer host</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

