"use client";

import Link from "next/link";
import { BookOpen, Home, User, AlertCircle } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarLoadingSkeleton } from "@/components/sidebar-loading";
import { cn } from "@/lib/utils";
import { ReportIssueModal } from "@/components/shared/report/ReportIssueModal";
import { SidebarFooter } from "@/components/ui/sidebar";

export function RenterSidebar({ isLoading = false }: { isLoading?: boolean }) {
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";

  if (isLoading) {
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarLoadingSkeleton />
      </Sidebar>
    );
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground font-semibold text-background">
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
                  "flex items-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-sidebar-muted hover:text-foreground",
                  isCollapsed && "justify-center",
                )}
              >
                <Home className="size-4" />
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium">Dashboard</span>
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
                  "flex items-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-sidebar-muted hover:text-foreground",
                  isCollapsed && "justify-center",
                )}
              >
                <BookOpen className="size-4" />
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium">
                    Booking History
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile Settings" asChild>
              <Link
                href="/renter/profile-verification"
                prefetch={true}
                className={cn(
                  "flex items-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-sidebar-muted hover:text-foreground",
                  isCollapsed && "justify-center",
                )}
              >
                <User className="size-4" />
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium">
                    Profile Settings
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <ReportIssueModal 
          trigger={
            <SidebarMenuButton 
              tooltip="Report a Problem"
              className="w-full justify-start gap-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
            >
              <AlertCircle className="size-4" />
              {!isCollapsed && <span>Report a Problem</span>}
            </SidebarMenuButton>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
