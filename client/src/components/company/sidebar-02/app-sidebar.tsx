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
  ArrowLeftRight,
  Building2,
  Handshake,
  Landmark,
  LayoutDashboard,
  MessageCircleCheckIcon,
  UserCheck,
} from "lucide-react";
import { Logo } from "@/components/dashboard/sidebar-02/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/dashboard/sidebar-02/nav-main";
import { NotificationsPopover } from "@/components/dashboard/sidebar-02/nav-notifications";
import { TeamSwitcher } from "@/components/dashboard/sidebar-02/team-switcher";
import { useRouter } from "next/navigation";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { writeUserRoleState } from "@/lib/role-store";

const sampleNotifications = [
  {
    id: "1",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
  {
    id: "2",
    fallback: "JL",
    text: "Server upgrade completed.",
    time: "1h ago",
  },
  {
    id: "3",
    fallback: "HH",
    text: "New user signed up.",
    time: "2h ago",
  },
];

const dashboardRoutes: Route[] = [
  {
    id: "Dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    link: "/company/dashboard",
  },
  {
    id: "Fleet",
    title: "Fleet Management",
    icon: <UserCheck className="size-4" />,
    link: "/company/fleetmangment",
    // subs: [
    //   {
    //     title: "Catalogue",
    //     link: "#",
    //     icon: <Package2 className="size-4" />,
    //   },
    //   {
    //     title: "Checkout Links",
    //     link: "#",
    //     icon: <LinkIcon className="size-4" />,
    //   },
    //   {
    //     title: "Discounts",
    //     link: "#",
    //     icon: <Percent className="size-4" />,
    //   },
    // ],
  },
  {
    id: "Bookings",
    title: "Bookings",
    //company icon
    icon: <Building2 className="size-4" />,
    link: "/company/bookings",
    // subs: [
    //   {
    //     title: "Meters",
    //     link: "#",
    //     icon: <PieChart className="size-4" />,
    //   },
    //   {
    //     title: "Events",
    //     link: "#",
    //     icon: <Activity className="size-4" />,
    //   },
    // ],
  },
  {
    id: "Earnings",
    title: "Earnings",
    icon: <Handshake className="size-4" />,
    link: "/company/earnings",  
  },
  // {
  //   id: "customers",
  //   title: "Customers",
  //   icon: <Users className="size-4" />,
  //   link: "#",
  // },
  {
    id: "reviews",
    title: "Reviews",
    icon: <Landmark className="size-4" />,
    link: "/company/reviews",
  },
  {
    id: "Profile",
    title: "Profile",
    icon: <MessageCircleCheckIcon className="size-4" />,
    link: "/company/profile ",
    // subs: [
    //   {
    //     title: "Orders",
    //     link: "#",
    //     icon: <ShoppingBag className="size-4" />,
    //   },
    //   {
    //     title: "Subscriptions",
    //     link: "#",
    //     icon: <Infinity className="size-4" />,
    //   },
    // ],
  },
];

const teams = [
  { id: "1", name: "Alpha Inc.", logo: Logo, plan: "Free" },
  { id: "2", name: "Beta Corp.", logo: Logo, plan: "Free" },
  { id: "3", name: "Gamma Tech", logo: Logo, plan: "Free" },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();
  const roleState = useUserRoleState();

  function switchToRenter() {
    writeUserRoleState({ ...roleState, activeRole: "renter" });
    router.push("/renter/dashboard");
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
              Acme
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
        <div className="space-y-2">
          <TeamSwitcher teams={teams} />
          <button
            type="button"
            onClick={switchToRenter}
            className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span>Switch to renter</span>
            <ArrowLeftRight className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
