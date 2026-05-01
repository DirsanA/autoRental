"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RenterSidebar } from "@/components/renter/sidebar/app-sidebar";
import { useSyncUserRoleState } from "@/hooks/use-sync-user-role-state";
import { useUserRoleState } from "@/hooks/use-user-role-state";

export default function RenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSyncing } = useSyncUserRoleState();
  const { activeRole } = useUserRoleState();
  const [isInitialSidebarLoading, setIsInitialSidebarLoading] = useState(true);
  const isRedirecting = !isSyncing && activeRole !== "renter";
  const isSidebarLoading = isInitialSidebarLoading || isSyncing || isRedirecting;

  useEffect(() => {
    if (isSyncing) return;

    const timeout = window.setTimeout(() => {
      setIsInitialSidebarLoading(false);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [isSyncing]);

  useEffect(() => {
    if (isSyncing) return;
    if (activeRole === "peerhost") {
      router.replace("/peerhost/dashboard");
      return;
    }

    if (activeRole === "company") {
      router.replace("/company/dashboard");
    }
  }, [activeRole, isSyncing, router]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex h-dvh w-full">
        <RenterSidebar isLoading={isSidebarLoading} />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

