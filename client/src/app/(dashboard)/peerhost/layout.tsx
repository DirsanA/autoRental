"use client";

import { PeerToPeerSidebar } from "@/components/peer-host/sidebar-02/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSyncUserRoleState } from "@/hooks/use-sync-user-role-state";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PeerHostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSyncing } = useSyncUserRoleState();
  const { activeRole, roles } = useUserRoleState();

  useEffect(() => {
    if (isSyncing) return;

    const isOnboardingPage = pathname === "/peerhost/become-host";
    if (!roles.peerhost && !isOnboardingPage) {
      router.replace("/renter/dashboard");
      return;
    }

    if (roles.peerhost && activeRole !== "peerhost" && !isOnboardingPage) {
      router.replace("/renter/dashboard");
    }
  }, [activeRole, isSyncing, pathname, roles.peerhost, router]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex h-dvh w-full">
        <PeerToPeerSidebar />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}


