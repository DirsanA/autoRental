"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PeerToPeerSidebar } from "@/components/peer-host/sidebar-02/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSyncUserRoleState } from "@/hooks/use-sync-user-role-state";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { writeUserRoleState } from "@/lib/role-store";

export default function PeerHostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSyncing } = useSyncUserRoleState();
  const { activeRole, companyStatus, roles } = useUserRoleState();

  useEffect(() => {
    if (isSyncing) return;

    if (roles.peerhost && activeRole !== "peerhost") {
      writeUserRoleState({
        roles,
        activeRole: "peerhost",
        companyStatus,
      });
      return;
    }

    if (!roles.peerhost) {
      router.replace("/renter/dashboard");
    }
  }, [activeRole, companyStatus, isSyncing, roles, router]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex h-dvh w-full">
        <PeerToPeerSidebar />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
