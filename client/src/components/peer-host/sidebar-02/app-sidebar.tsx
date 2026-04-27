"use client";

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
import { motion } from "framer-motion";
import {
  Car,
  DollarSign,
  Home,
  Settings,
  Calendar,
  Star,
  MessageSquare,
  LogOut,
  Users,
  Shield,
  ClipboardCheck,
  ArrowLeftRight,
} from "lucide-react";
import { Logo } from "@/components/peer-host/sidebar-02/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/peer-host/sidebar-02/nav-main";
import { NotificationsPopover } from "@/components/peer-host/sidebar-02/nav-notifications";
import { useRouter } from "next/navigation";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { toggleActiveRole, writeUserRoleState } from "@/lib/role-store";

const sampleNotifications = [
  {
    id: "1",
    fallback: "NR",
    text: "New booking request for Tesla Model 3",
    time: "5m ago",
  },
  {
    id: "2",
    fallback: "JD",
    text: "Booking accepted: BMW X5",
    time: "2h ago",
  },
  {
    id: "3",
    fallback: "MK",
    text: "Document verification pending",
    time: "5h ago",
  },
];

const dashboardRoutes: Route[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <Home className="size-4" />,
    link: "/peerhost/dashboard",
  },
  {
    id: "my-vehicles",
    title: "My Vehicles",
    icon: <Car className="size-4" />,
    link: "/peerhost/vehicles",
  },
  {
    id: "booking-requests",
    title: "Booking History",
    icon: <ClipboardCheck className="size-4" />,
    link: "/peerhost/booking-history",
  },
  {
    id: "reviews",
    title: "Reviews",
    icon: <Star className="size-4" />,
    link: "/peerhost/reviews",
  },
  {
    id: "become-a-host",
    title: "Become a Host",
    icon: <MessageSquare className="size-4" />,
    link: "/peerhost/become-host",
  },
];

export function PeerToPeerSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();
  const roleState = useUserRoleState();
  const routes = roleState.roles.peerhost
    ? dashboardRoutes
    : dashboardRoutes.filter((route) => route.id === "become-a-host");

  function handleSwitchRole() {
    if (!roleState.roles.peerhost) {
      router.push("/renter/dashboard");
      return;
    }

    const next = toggleActiveRole(roleState);
    writeUserRoleState(next);
    router.push(next.activeRole === "peerhost" ? "/peerhost/dashboard" : "/renter/dashboard");
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
        <a href="#" className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              AutoRent 
            </span>
          )}
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <NotificationsPopover notifications={sampleNotifications} />
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      
      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={routes} />
      </SidebarContent>
      
      <SidebarFooter className="px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={handleSwitchRole}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-foreground">
                <ArrowLeftRight className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Switch Role</span>
                <span className="truncate text-xs">
                  {roleState.roles.peerhost
                    ? roleState.activeRole === "peerhost"
                      ? "Go to renter"
                      : "Go to peer host"
                    : "Back to renter"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
