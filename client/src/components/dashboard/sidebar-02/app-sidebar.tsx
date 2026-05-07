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
  Building2,
  Handshake,
  Landmark,
  LayoutDashboard,
  MessageCircleCheckIcon,
  ShoppingCart,
  Store,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Logo } from "@/components/dashboard/sidebar-02/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/dashboard/sidebar-02/nav-main";
import { NotificationsPopover } from "@/components/dashboard/sidebar-02/nav-notifications";
import { SidebarLoadingSkeleton } from "@/components/sidebar-loading";

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
    id: "Overview",
    title: "Overview",
    icon: <LayoutDashboard className="size-4" />,
    link: "/sysadmin/dashboard",
  },
  {
    id: "Users",
    title: "Users",
    icon: <UserCheck className="size-4" />,
    link: "/sysadmin/users",
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
    id: "Companies",
    title: "Companies",
    //company icon
    icon: <Building2 className="size-4" />,
    link: "/sysadmin/companies",
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
    id: "P2P Hosts",
    title: "P2P Hosts",
    icon: <Handshake className="size-4" />,
    link: "/sysadmin/p2p",
  },
  // {
  //   id: "customers",
  //   title: "Customers",
  //   icon: <Users className="size-4" />,
  //   link: "#",
  // },
  {
    id: "Revenue",
    title: "Revenue",
    icon: <Landmark className="size-4" />,
    link: "/sysadmin/revenue",
    subs: [
      {
        title: "Transaction Log",
        link: "/sysadmin/revenue/transactions",
      },
    ],
  },
  // {
  //   id: "Disputes",
  //   title: "Disputes",
  //   icon: <MessageCircleCheckIcon className="size-4" />,
  //   link: "/sysadmin/disputes",
  //   // subs: [
  //   //   {
  //   //     title: "Orders",
  //   //     link: "#",
  //   //     icon: <ShoppingBag className="size-4" />,
  //   //   },
  //   //   {
  //   //     title: "Subscriptions",
  //   //     link: "#",
  //   //     icon: <Infinity className="size-4" />,
  //   //   },
  //   // ],
  // },
  {
    id: "Reports",
    title: "Reports",
    icon: <AlertCircle className="size-4" />,
    link: "/sysadmin/reports",
  },
];

export function DashboardSidebar({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
      <SidebarFooter className="px-2"></SidebarFooter>
    </Sidebar>
  );
}
