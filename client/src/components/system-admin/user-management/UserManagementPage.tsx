"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCcw, ShieldCheck, UserCog, Users } from "lucide-react";
import { ExportButton } from "@/components/system-admin/export/ExportButton";
import { exportUsersToExcel } from "@/components/system-admin/export/export-utils";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import type { User } from "./data";
import { deleteAdminUser, fetchAdminUsers, updateAdminUserStatus } from "./api";
import { useToast } from "@/hooks/use-toast";
import { usePageViewTracking } from "@/hooks/use-action-badges";
import { useRealTimeRefresh } from "@/hooks/use-real-time-refresh";
import type {
  AdminUserAccountType,
  AdminUserApiStatus,
  AdminUsersPagination,
  AdminUserSummary,
} from "@/lib/admin-users-api";
import { ActionBadge } from "@/components/action-badges/action-badge";

const PAGE_SIZE = 20;

function SummaryCard({
  title,
  value,
  icon: Icon,
  note,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  note: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Admin user management page focused on people and admin accounts only.
 */
export default function UserManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { trackPageView } = usePageViewTracking("USER");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<AdminUsersPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    fetchAdminUsers({
      search: search || undefined,
      scope: "PEOPLE",
      accountType:
        accountTypeFilter === "all"
          ? undefined
          : (accountTypeFilter as AdminUserAccountType),
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as AdminUserApiStatus),
      page,
      limit: PAGE_SIZE,
    })
      .then((result) => {
        if (cancelled) return;
        setUsers(result.users);
        setPagination(result.pagination);
        setError(null);

        // Mark loaded users as viewed (for badge tracking)
        const userIds = result.users.map((u) => u.id);
        trackPageView(userIds);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof Error ? cause.message : "Failed to load users",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accountTypeFilter, page, reloadKey, search, statusFilter, trackPageView]);

  const refreshUsers = () => setReloadKey((value) => value + 1);

  // Subscribe to real-time refreshes
  useRealTimeRefresh(refreshUsers, "USER");

  const handleView = (user: User) => router.push(`/sysadmin/users/${user.id}`);

  const applyStatusUpdate = async (
    user: User,
    status: AdminUserApiStatus,
    successTitle: string,
    successDescription: string,
  ) => {
    setPendingUserId(user.id);

    try {
      const updated = await updateAdminUserStatus(user.id, status);
      setUsers((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      toast({
        title: successTitle,
        description: successDescription.replace("{name}", updated.name),
      });
    } catch (cause: unknown) {
      toast({
        title: "Update failed",
        description:
          cause instanceof Error ? cause.message : "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setPendingUserId(null);
    }
  };

  const handleActivate = (user: User) =>
    applyStatusUpdate(user, "ACTIVE", "User updated", "{name} is now active.");

  const handleSuspend = (user: User) =>
    applyStatusUpdate(
      user,
      "SUSPENDED",
      "User suspended",
      "{name} is now suspended.",
    );

  const handleDeleteClick = (user: User) => {
    setDeleteDialogUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialogUser) return;

    setPendingUserId(deleteDialogUser.id);

    try {
      await deleteAdminUser(deleteDialogUser.id);
      toast({
        title: "User deleted",
        description: `${deleteDialogUser.name} removed successfully.`,
      });

      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        refreshUsers();
      }
    } catch (cause: unknown) {
      toast({
        title: "Delete failed",
        description:
          cause instanceof Error ? cause.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setPendingUserId(null);
      setDeleteDialogUser(null);
    }
  };

  const activeUsers = users.filter((user) => user.status === "active").length;
  const pendingUsers = users.filter(
    (user) => user.status === "inactive" || user.status === "invited",
  ).length;
  const adminUsers = users.filter(
    (user) => user.accountType === "ADMIN",
  ).length;

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="flex flex-1 flex-col min-h-0">
        <Header />

        <Main className="gap-6 p-6 md:p-8 pb-20">
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              User Management
              <ActionBadge entityType="USER" className="h-6 min-w-[24px] text-sm" />
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Manage people accounts and internal admins. Company entities are
              handled separately in Company Management.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              title="People On This Page"
              value={users.length}
              icon={Users}
              note="Current results after search and status filters."
            />
            <SummaryCard
              title="Active Accounts"
              value={activeUsers}
              icon={ShieldCheck}
              note="Currently active within the loaded page."
            />
            <SummaryCard
              title="Admin Accounts"
              value={adminUsers}
              icon={UserCog}
              note="Internal admin accounts in the current result set."
            />
          </div>

          <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            This directory intentionally excludes company records so admin user
            actions stay focused on platform people and staff accounts.
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <UserFilters
              search={searchInput}
              onSearchChange={setSearchInput}
              accountTypeFilter={accountTypeFilter}
              onAccountTypeFilterChange={(value) => {
                setAccountTypeFilter(value);
                setPage(1);
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            />

            <div className="flex gap-2">
              <ExportButton
                onExport={() => exportUsersToExcel(users as AdminUserSummary[])}
                disabled={loading || users.length === 0}
              />
              <Button
                variant="outline"
                onClick={refreshUsers}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Showing {users.length} of {pagination.total} matching accounts
            </div>
            <div>
              Pending on this page: {pendingUsers} / Page {pagination.page} of{" "}
              {pagination.totalPages}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card p-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              <div>{error}</div>
              <Button variant="outline" onClick={refreshUsers} className="mt-4">
                Try again
              </Button>
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                pendingUserId={pendingUserId}
                onView={handleView}
                onActivate={handleActivate}
                onSuspend={handleSuspend}
                onDelete={handleDeleteClick}
                showActionBadges={true}
              />

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={loading || pagination.page <= 1}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  {pagination.total === 0
                    ? "No results"
                    : `Page ${pagination.page} of ${pagination.totalPages}`}
                </span>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1),
                    )
                  }
                  disabled={
                    loading ||
                    pagination.total === 0 ||
                    pagination.page >= pagination.totalPages
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </Main>
      </div>

      <AlertDialog
        open={!!deleteDialogUser}
        onOpenChange={(open) => !open && setDeleteDialogUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialogUser?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
