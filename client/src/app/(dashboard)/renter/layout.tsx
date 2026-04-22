"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (isSyncing) return;
    if (activeRole !== "renter") router.replace("/peerhost/dashboard");
  }, [activeRole, isSyncing, router]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex h-dvh w-full">
        <RenterSidebar />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

