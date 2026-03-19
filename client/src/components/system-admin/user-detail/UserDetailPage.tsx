"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, ShieldAlert, KeyRound } from "lucide-react";

import { UserSidebar } from "./UserSidebar";
import { ActivityTab } from "./ActivityTab";
import { SecurityTab } from "./SecurityTab";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "@/hooks/use-toast";

import { getUserData } from "./data";
import type { ConfirmationConfig, UserStatus } from "./types";

export function UserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const initialData = useMemo(() => getUserData(userId), [userId]);

  const [user, setUser] = useState(initialData.user);
  const [activities] = useState(initialData.activities);
  const [securityEvents] = useState(initialData.securityEvents);
  const { toast } = useToast();
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(
    null,
  );

  const wait = () => new Promise((resolve) => setTimeout(resolve, 800));
  const showSuccess = (title: string, msg: string) =>
    toast({ title, description: msg });

  // ─── Actions ───

  const handleStatusChange = (newStatus: UserStatus) => {
    let title = "Update User Status";
    let desc = `Change the account status to ${newStatus}?`;
    let variant: "default" | "destructive" = "default";

    if (newStatus === "suspended" || newStatus === "inactive") {
      title = `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Account`;
      desc = `Are you sure? They will immediately lose access to the system.`;
      variant = "destructive";
    }

    setModalConfig({
      title,
      description: desc,
      confirmLabel: "Confirm",
      variant,
      onConfirm: async () => {
        await wait();
        setUser((prev) => ({ ...prev, status: newStatus }));
        showSuccess("Account Updated", `User is now ${newStatus}.`);
      },
    });
  };

  const handleDelete = () => {
    setModalConfig({
      title: "Delete System User",
      description:
        "Permanently delete this administrative profile? This cannot be undone.",
      confirmLabel: "Delete Permanently",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        toast({ title: "User Deleted", description: "Redirecting..." });
        setTimeout(() => router.push("/sysadmin/user-management"), 1000);
      },
    });
  };

  const handleForceReset = () => {
    setModalConfig({
      title: "Force Password Reset",
      description: "Invalidate the current password and email a reset link?",
      confirmLabel: "Send Reset Link",
      variant: "default",
      onConfirm: async () => {
        await wait();
        showSuccess(
          "Link Sent",
          `A password reset link has been sent to ${user.email}.`,
        );
      },
    });
  };

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push("/sysadmin/user-management")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to User Management
              </button>

              <button
                onClick={handleForceReset}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-md transition-colors"
              >
                <KeyRound className="h-4 w-4" /> Force Auth Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-8 items-start">
              {/* Left Sidebar Layout */}
              <UserSidebar
                user={user}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />

              {/* Main Content Area */}
              <div className="w-full flex-1 min-w-0">
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 mb-6 bg-muted/60">
                    <TabsTrigger value="activity" className="gap-2">
                      <Activity className="h-4 w-4 hidden sm:block" />
                      App Activity
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                      <ShieldAlert className="h-4 w-4 hidden sm:block" />
                      Security Logs
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-0">
                    <TabsContent
                      value="activity"
                      className="mt-0 focus-visible:ring-0"
                    >
                      <ActivityTab activities={activities} />
                    </TabsContent>

                    <TabsContent
                      value="security"
                      className="mt-0 focus-visible:ring-0"
                    >
                      <SecurityTab events={securityEvents} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </Main>
      </div>

      <ConfirmationModal
        config={modalConfig}
        onClose={() => setModalConfig(null)}
      />
    </div>
  );
}
