"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  Handshake,
  Landmark,
  LayoutDashboard,
  MessageCircleCheckIcon,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/dashboard/sidebar-02/nav-main";
import { NotificationsPopover } from "@/components/dashboard/sidebar-02/nav-notifications";
import { useRouter } from "next/navigation";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { writeUserRoleState } from "@/lib/role-store";
import { SidebarLoadingSkeleton } from "@/components/sidebar-loading";
import { ReportIssueModal } from "@/components/shared/report/ReportIssueModal";

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
    id: "Wallet",
    title: "Wallet",
    icon: <DollarSign className="size-4" />,
    link: "/company/wallet",
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

export function DashboardSidebar({ isLoading = false }: { isLoading?: boolean }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();
  const roleState = useUserRoleState();

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
        <Link href="/" className="flex items-center gap-2">
          <Logo
            className={cn(isCollapsed ? "h-10 w-10" : "h-11 w-[144px]")}
            textWeight="800"
          />
        </Link>

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
      <SidebarFooter className="px-2 pb-4">
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
