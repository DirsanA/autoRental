"use client";

import { DashboardSidebar } from "@/components/company/sidebar-02/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSyncUserRoleState } from "@/hooks/use-sync-user-role-state";
import { useUserRoleState } from "@/hooks/use-user-role-state";
import { useEffect, useState } from "react";
import {
  Clock,
  Mail,
  FileSearch,
  ShieldCheck,
  CheckCircle2,
  MessageCircleQuestion,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Application stages for pending approval UI
 */
const STAGES = [
  {
    icon: CheckCircle2,
    label: "Application received",
    description: "Your company data is safely in our system.",
    status: "complete",
  },
  {
    icon: FileSearch,
    label: "Document review",
    description: "Verifying TIN and commercial licenses.",
    status: "active",
  },
  {
    icon: ShieldCheck,
    label: "Final approval",
    description: "Finalizing your company account setup.",
    status: "pending",
  },
];

/**
 * Pending Approval Component
 */
function PendingApproval({ status }: { status: string }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-7 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-xl text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mx-auto h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8 rotate-3"
        >
          <Clock className="h-10 w-10 text-primary animate-pulse" />
        </motion.div>

        {/* Title */}
        <div className="space-y-3 mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Reviewing your company application
          </h1>
          <p className="text-muted-foreground">
            Your status is{" "}
            <span className="font-semibold text-foreground">{status}</span>.
            <br />
            We usually respond within 24–48 hours.
          </p>
        </div>

        {/* Stages */}
        <div className="text-left rounded-2xl border bg-card p-6 shadow-sm">
          {STAGES.map((stage) => (
            <div
              key={stage.label}
              className="flex items-start gap-4 mb-6 last:mb-0"
            >
              <stage.icon className="h-5 w-5 mt-1" />
              <div>
                <p className="font-semibold text-sm">{stage.label}</p>
                <p className="text-xs text-muted-foreground">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            You will be notified by email once approved
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/")}
            >
              Return Home
            </Button>

            <Button variant="ghost" size="sm">
              <MessageCircleQuestion className="mr-2 h-3 w-3" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Company Dashboard Layout
 */
export default function CompanyDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSyncing } = useSyncUserRoleState();
  const { activeRole, roles, companyStatus } = useUserRoleState();

  const [isInitialSidebarLoading, setIsInitialSidebarLoading] = useState(true);

  const isSidebarLoading =
    isInitialSidebarLoading || isSyncing;

  /**
   * Smooth sidebar loading delay
   */
  useEffect(() => {
    if (isSyncing) return;

    const timeout = setTimeout(() => {
      setIsInitialSidebarLoading(false);
    }, 450);

    return () => clearTimeout(timeout);
  }, [isSyncing]);

  /**
   * Pending approval state
   */
  if (!isSyncing && companyStatus && companyStatus !== "ACTIVE") {
    return <PendingApproval status={companyStatus} />;
  }

  return (
    <ProtectedRoute allowedRoles={["company"]}>
      <SidebarProvider suppressHydrationWarning>
        <div className="relative flex w-full h-dvh">
          {/* Sidebar */}
          <DashboardSidebar isLoading={isSidebarLoading} />

          {/* Main content */}
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
    </ProtectedRoute>
  );
}
