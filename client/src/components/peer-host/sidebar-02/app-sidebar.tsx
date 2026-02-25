"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
} from "lucide-react";
import { Logo } from "@/components/peer-host/sidebar-02/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/peer-host/sidebar-02/nav-main";
import { NotificationsPopover } from "@/components/peer-host/sidebar-02/nav-notifications";
import { TeamSwitcher } from "@/components/peer-host/sidebar-02/team-switcher";

const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "NR",
    text: "New booking request for Tesla Model 3",
    time: "5m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "JD",
    text: "Booking accepted: BMW X5",
    time: "2h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
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
    link: "#",
  },
  {
    id: "my-vehicles",
    title: "My Vehicles",
    icon: <Car className="size-4" />,
    link: "#",
  },
  {
    id: "booking-requests",
    title: "Booking Requests",
    icon: <ClipboardCheck className="size-4" />,
    link: "#",
  },
  {
    id: "earnings",
    title: "Earnings",
    icon: <DollarSign className="size-4" />,
    link: "#",
  },
  {
    id: "reviews",
    title: "Reviews",
    icon: <Star className="size-4" />,
    link: "#",
  },
  {
    id: "profile-verification",
    title: "Profile & Verification",
    icon: <Shield className="size-4" />,
    link: "#",
  },
  {
    id: "messages",
    title: "Messages",
    icon: <MessageSquare className="size-4" />,
    link: "#",
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="size-4" />,
    link: "#",
  },
];

const teams = [
  { id: "1", name: "My Host Account", logo: Logo, plan: "Verified Host" },
  { id: "2", name: "Business Profile", logo: Logo, plan: "Pending" },
  { id: "3", name: "Premium Vehicles", logo: Logo, plan: "Basic" },
];

export function PeerToPeerSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
              AutoRent Host
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
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      
      <SidebarFooter className="px-2">
        <TeamSwitcher teams={teams} />
      </SidebarFooter>
    </Sidebar>
  );
}