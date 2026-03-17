"use client";

import { DashboardSidebar } from "@/components/company/sidebar-02/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function companyDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex w-full h-dvh">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}


