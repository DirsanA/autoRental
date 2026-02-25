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
  Plus,
  Users,
  Menu,
  Wrench,
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
    text: "BMW X5 maintenance completed",
    time: "2h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "MK",
    text: "Payment received: $1,250",
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
    id: "my-cars",
    title: "My Cars",
    icon: <Car className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Available",
        link: "#",
        icon: <Car className="size-4" />,
      },
      {
        title: "Rented Out",
        link: "#",
        icon: <Users className="size-4" />,
      },
      {
        title: "Under Maintenance",
        link: "#",
        icon: <Wrench className="size-4" />,
      },
    ],
  },
  {
    id: "manage-listings",
    title: "Manage Listings",
    icon: <Menu className="size-4" />,
    link: "#",
  },
  {
    id: "bookings",
    title: "Bookings",
    icon: <Calendar className="size-4" />,
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
    id: "messages",
    title: "Messages",
    icon: <MessageSquare className="size-4" />,
    link: "#",
  },
  {
    id: "profile-settings",
    title: "Profile & Settings",
    icon: <Settings className="size-4" />,
    link: "#",
  },
];

const teams = [
  { id: "1", name: "AutoRent", logo: Logo, plan: "Pro" },
  { id: "2", name: "Premium Fleet", logo: Logo, plan: "Business" },
  { id: "3", name: "Economy Cars", logo: Logo, plan: "Basic" },
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
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      
      <SidebarFooter className="px-2">
        <TeamSwitcher teams={teams} />
      </SidebarFooter>
    </Sidebar>
  );
}