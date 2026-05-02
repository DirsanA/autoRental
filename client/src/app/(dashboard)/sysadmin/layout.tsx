"use client";

import { useEffect, useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/sidebar-02/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SysAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsSidebarLoading(false);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <SidebarProvider suppressHydrationWarning>
        <div className="relative flex h-dvh w-full">
          <DashboardSidebar isLoading={isSidebarLoading} />
          <SidebarInset className="flex flex-col">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
