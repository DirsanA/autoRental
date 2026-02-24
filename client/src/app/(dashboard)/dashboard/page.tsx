import { Dashboard } from "@/components/dashboard";
import { DashboardSidebar } from "@/components/dashboard/sidebar-02/app-sidebar";

export default function SystemAdminDashboard() {
  return (
    <div className="relative flex h-dvh w-full">
      <DashboardSidebar />
      <Dashboard />
    </div>
  );
}
