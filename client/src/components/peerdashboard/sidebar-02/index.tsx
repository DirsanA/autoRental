import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/peerdashboard/sidebar-02/app-sidebar";

export default function Sidebar02() {
  return (
    <SidebarProvider>
      <div className="relative flex w-full h-dvh">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col" />
      </div>
    </SidebarProvider>
  );
}
