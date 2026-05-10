"use client";

import { useEffect, useState } from "react";
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
  Star,
  ClipboardCheck,
  ArrowLeftRight,
  Plus,
  AlertCircle,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/peer-host/sidebar-02/nav-main";
import { NotificationsPopover } from "@/components/peer-host/sidebar-02/nav-notifications";
import { useRouter } from "next/navigation";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { toggleActiveRole, writeUserRoleState } from "@/lib/role-store";
import { SidebarLoadingSkeleton } from "@/components/sidebar-loading";
import { ReportIssueModal } from "@/components/shared/report/ReportIssueModal";
import { fetchPeerHostVehicles } from "@/components/peer-host/vehicles/api";

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

const getDashboardRoutes = (hasVehicles: boolean): Route[] => [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <Home className="size-4" />,
    link: "/peerhost/dashboard",
  },
  {
    id: "wallet",
    title: "Wallet",
    icon: <DollarSign className="size-4" />,
    link: "/peerhost/wallet",
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
    id: "messages",
    title: "Messages",
    icon: <MessageSquareText className="size-4" />,
    link: "/peerhost/messages",
  },
  // Show "Add Vehicle" if user has vehicles, otherwise show "Become a Host"
  hasVehicles
    ? {
      id: "add-vehicle",
      title: "Add Vehicle",
      icon: <Plus className="size-4" />,
      link: "/peerhost/add-vehicle",
    }
    : {
      id: "become-a-host",
      title: "Add Vehicle",
      icon: <Plus className="size-4" />,
      link: "/peerhost/add-vehicle",
    },
];

export function PeerToPeerSidebar({ isLoading = false }: { isLoading?: boolean }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();
  const roleState = useUserRoleState();
  const [hasVehicles, setHasVehicles] = useState(false);
  const [isCheckingVehicles, setIsCheckingVehicles] = useState(true);

  // Check if user has vehicles
  useEffect(() => {
    let cancelled = false;

    async function checkVehicles() {
      try {
        setIsCheckingVehicles(true);
        const vehicles = await fetchPeerHostVehicles();
        if (!cancelled) {
          setHasVehicles(vehicles.length > 0);
        }
      } catch {
        // If error, assume no vehicles
        if (!cancelled) {
          setHasVehicles(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingVehicles(false);
        }
      }
    }

    // Only check vehicles if user is a peerhost
    if (roleState.roles.peerhost) {
      void checkVehicles();
    } else {
      setIsCheckingVehicles(false);
    }

    return () => {
      cancelled = true;
    };
  }, [roleState.roles.peerhost]);

  if (isLoading || isCheckingVehicles) {
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarLoadingSkeleton />
      </Sidebar>
    );
  }

  const dashboardRoutes = getDashboardRoutes(hasVehicles);

  const routes = roleState.roles.peerhost
    ? dashboardRoutes
    : dashboardRoutes.filter((route) => route.id === "become-a-host" || route.id === "add-vehicle");

  function handleSwitchRole() {
    if (!roleState.roles.peerhost) {
      router.push("/renter/dashboard");
      return;
    }

    const next = toggleActiveRole(roleState);
    writeUserRoleState(next);
    if (next.activeRole === "peerhost") {
      router.push("/peerhost/dashboard");
      return;
    }

    if (next.activeRole === "company") {
      router.push("/company/dashboard");
      return;
    }

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
                      ? roleState.roles.company
                        ? "Go to company"
                        : "Go to renter"
                      : "Go to peer host"
                    : "Back to renter"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-2 pb-4">
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
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
