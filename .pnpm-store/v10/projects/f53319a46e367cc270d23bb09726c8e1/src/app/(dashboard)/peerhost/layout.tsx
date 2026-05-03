"use client";

import { useEffect, useState } from "react";
import { PeerToPeerSidebar } from "@/components/peer-host/sidebar-02/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSyncUserRoleState } from "@/hooks/use-sync-user-role-state";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { writeUserRoleState } from "@/lib/role-store";

export default function PeerHostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSyncing } = useSyncUserRoleState();
  const { activeRole, companyStatus, roles } = useUserRoleState();
  const [isInitialSidebarLoading, setIsInitialSidebarLoading] = useState(true);
  const isCorrectingRole =
    !isSyncing && roles.peerhost && activeRole !== "peerhost";
  const isSidebarLoading =
    isInitialSidebarLoading || isSyncing || isCorrectingRole;

  useEffect(() => {
    if (isSyncing) return;

    const timeout = window.setTimeout(() => {
      setIsInitialSidebarLoading(false);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [isSyncing]);

  // Ensure the active role is set to peerhost when visiting this layout
  useEffect(() => {
    if (isSyncing) return;

    if (roles.peerhost && activeRole !== "peerhost") {
      writeUserRoleState({
        roles,
        activeRole: "peerhost",
        companyStatus,
      });
    }
  }, [activeRole, companyStatus, isSyncing, roles]);

  return (
    <ProtectedRoute allowedRoles={["peerhost"]}>
      <SidebarProvider suppressHydrationWarning>
        <div className="relative flex h-dvh w-full">
          <PeerToPeerSidebar isLoading={isSidebarLoading} />
          <SidebarInset className="flex flex-col">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
