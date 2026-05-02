"use client";

import { useEffect, useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RenterSidebar } from "@/components/renter/sidebar/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSyncUserRoleState } from "@/hooks/use-sync-user-role-state";
import { useUserRoleState } from "@/hooks/use-user-role-state";

export default function RenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSyncing } = useSyncUserRoleState();
  const { activeRole } = useUserRoleState();
  const [isInitialSidebarLoading, setIsInitialSidebarLoading] = useState(true);
  const isSidebarLoading = isInitialSidebarLoading || isSyncing;

  useEffect(() => {
    if (isSyncing) return;

    const timeout = window.setTimeout(() => {
      setIsInitialSidebarLoading(false);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [isSyncing]);

  return (
    <ProtectedRoute allowedRoles={["renter", "peerhost"]}>
      <SidebarProvider suppressHydrationWarning>
        <div className="relative flex h-dvh w-full">
          <RenterSidebar isLoading={isSidebarLoading} />
          <SidebarInset className="flex flex-col">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
