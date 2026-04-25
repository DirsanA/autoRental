"use client";

import { DashboardSidebar } from "@/components/company/sidebar-02/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSyncUserRoleState } from "@/hooks/use-sync-user-role-state";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function companyDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSyncing } = useSyncUserRoleState();
  const { activeRole, roles } = useUserRoleState();

  useEffect(() => {
    if (isSyncing) return;
    if (!roles.company || activeRole !== "company") {
      router.replace("/dashboard");
    }
  }, [activeRole, isSyncing, roles.company, router]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex w-full h-dvh">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
          <Header />
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto p-4 md:p-6 w-full max-w-[1600px]">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

