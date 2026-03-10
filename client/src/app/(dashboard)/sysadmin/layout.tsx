"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar-02/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function SysAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider suppressHydrationWarning>
      <div className="relative flex h-dvh w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}


