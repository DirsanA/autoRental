"use client";

import { PeerToPeerSidebar } from "@/components/peer-host/sidebar-02/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PeerHostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { activeRole } = useUserRoleState();

  useEffect(() => {
    if (activeRole !== "peerhost") router.replace("/renter/dashboard");
  }, [activeRole, router]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex h-dvh w-full">
        <PeerToPeerSidebar />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}


