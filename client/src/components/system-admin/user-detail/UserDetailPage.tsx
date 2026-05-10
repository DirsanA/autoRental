"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BarChart3,
  Ban,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { UserSidebar } from "./UserSidebar";
import { OverviewTab } from "./OverviewTab";
import { VerificationTab } from "./VerificationTab";
import { RelatedRecordsTab } from "./RelatedRecordsTab";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import { useDetailViewTracking } from "@/hooks/use-action-badges";
import type { ConfirmationConfig, UserFullDetail, UserStatus } from "./types";
import {
  deleteAdminUserDetail,
  fetchAdminUserDetail,
  updateAdminUserDetailStatus,
} from "./api";

/**
 * Admin user detail page backed only by currently available live records.
 */
export function UserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  // Mark user as viewed when detail page loads
  useDetailViewTracking("USER", userId);

  const [user, setUser] = useState<UserFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(
    null,
  );

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUserDetail(userId);
      setUser(data);
      setLoadError(null);
    } catch (cause: unknown) {
      setLoadError(
        cause instanceof Error ? cause.message : "Failed to load user",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    fetchAdminUserDetail(userId)
      .then((data) => {
        if (cancelled) return;
        setUser(data);
        setLoadError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoadError(
          cause instanceof Error ? cause.message : "Failed to load user",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleStatusChange = (nextStatus: UserStatus) => {
    const isDestructive = nextStatus === "suspended";

    setModalConfig({
      title: nextStatus === "active" ? "Activate User" : "Suspend User",
      description:
        nextStatus === "active"
          ? "Restore this user account and allow access again?"
          : "Suspend this user and remove platform access immediately?",
      confirmLabel: "Confirm",
      variant: isDestructive ? "destructive" : "default",
      onConfirm: async () => {
        try {
          const updated = await updateAdminUserDetailStatus(userId, nextStatus);
          setUser((current) =>
            current ? { ...current, ...updated } : current,
          );
          toast({
            title: "User updated",
            description: `User is now ${updated.status}.`,
          });
        } catch (cause: unknown) {
          toast({
            title: "Update failed",
            description:
              cause instanceof Error ? cause.message : "Failed to update user",
            variant: "destructive",
          });
        }
      },
    });
  };

  const handleDelete = () => {
    setModalConfig({
      title: "Delete User",
      description:
        "Permanently delete this user account? This action cannot be undone.",
      confirmLabel: "Delete Permanently",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteAdminUserDetail(userId);
          toast({ title: "User deleted", description: "Redirecting..." });
          setTimeout(() => router.push("/sysadmin/users"), 800);
        } catch (cause: unknown) {
          toast({
            title: "Delete failed",
            description:
              cause instanceof Error ? cause.message : "Failed to delete user",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <Main className="overflow-y-auto p-6 md:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => router.push("/sysadmin/users")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to User Management
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {user?.status !== "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleStatusChange("active")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Activate
                  </Button>
                ) : null}
                {user?.status !== "suspended" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleStatusChange("suspended")}
                  >
                    <Ban className="h-4 w-4" />
                    Suspend
                  </Button>
                ) : null}
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                Loading user...
              </div>
            ) : loadError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {loadError}
              </div>
            ) : user ? (
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[300px_1fr]">
                <UserSidebar
                  user={user}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />

                <div className="min-w-0 w-full flex-1">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1">
                      <TabsTrigger value="overview" className="gap-2">
                        <FileText className="hidden h-4 w-4 sm:block" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="verification" className="gap-2">
                        <ShieldCheck className="hidden h-4 w-4 sm:block" />
                        Verification
                      </TabsTrigger>
                      <TabsTrigger value="records" className="gap-2">
                        <BarChart3 className="hidden h-4 w-4 sm:block" />
                        Activity
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="overview"
                      className="mt-6 focus-visible:ring-0"
                    >
                      <OverviewTab user={user} />
                    </TabsContent>

                    <TabsContent
                      value="verification"
                      className="mt-6 focus-visible:ring-0"
                    >
                      <VerificationTab user={user} onUserRefresh={loadUser} />
                    </TabsContent>

                    <TabsContent
                      value="records"
                      className="mt-6 focus-visible:ring-0"
                    >
                      <RelatedRecordsTab user={user} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            ) : null}
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
