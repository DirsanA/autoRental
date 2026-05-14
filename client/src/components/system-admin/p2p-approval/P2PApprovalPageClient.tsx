"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Handshake,
  Loader2,
  MoreHorizontal,
  Search,
  ThumbsDown,
  ThumbsUp,
  XCircle,
  Ban,
} from "lucide-react";
import { ExportButton } from "@/components/system-admin/export/ExportButton";
import { exportP2PHostsToExcel } from "@/components/system-admin/export/export-utils";
import { usePageViewTracking } from "@/hooks/use-action-badges";
import { useRealTimeRefresh } from "@/hooks/use-real-time-refresh";
import { useActionBadgesStore } from "@/stores/action-badges-store";
import { ActionBadge } from "@/components/action-badges/action-badge";
import { cn } from "@/lib/utils";
import { RecordBadge } from "@/components/action-badges/record-badge";
import { AdminListPageSkeleton } from "@/components/system-admin/sysadmin-page-skeletons";
import {
  fetchP2PHosts,
  reviewP2PHost,
  type P2PHostListResult,
  type P2PHostStatus,
  type P2PHostSummary,
} from "@/lib/admin-p2p-api";
import { updateAdminUserStatus } from "@/lib/admin-users-api";
import { markCategoriesAsRead } from "@/lib/admin-notifications-api";

const PAGE_SIZE = 20;

const p2pStatusConfig: Record<
  P2PHostStatus,
  { label: string; icon: React.ElementType; cls: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  flagged: {
    label: "Flagged",
    icon: Flag,
    cls: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

function P2PStatusBadge({ host }: { host: P2PHostSummary }) {
  if (host.accountStatus === "SUSPENDED") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-0 font-normal bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      >
        <Ban className="h-3.5 w-3.5" /> Suspended
      </Badge>
    );
  }
  const { label, icon: Icon, cls } = p2pStatusConfig[host.status];
  return (
    <Badge variant="outline" className={cn("gap-1 border-0 font-normal", cls)}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </Badge>
  );
}

function DocCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        ok
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      {ok ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {label}
    </span>
  );
}

function PromotionReadiness({
  canPromote,
  blockerCount,
}: {
  canPromote: boolean;
  blockerCount: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        canPromote
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      )}
    >
      {canPromote ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {canPromote
        ? "Ready to promote"
        : `${blockerCount} blocker${blockerCount === 1 ? "" : "s"}`}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  cls,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  cls?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        cls,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

const EMPTY_RESULT: P2PHostListResult = {
  hosts: [],
  pagination: {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  },
};

type DialogType =
  | "approve"
  | "reject"
  | "blockers"
  | "suspend"
  | "reactivate"
  | null;

interface DialogState {
  type: DialogType;
  host: P2PHostSummary | null;
  reason: string;
}

const DEFAULT_DIALOG: DialogState = {
  type: null,
  host: null,
  reason: "",
};

export function P2PApprovalPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hostsData, setHostsData] = useState<P2PHostListResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [dialog, setDialog] = useState<DialogState>(DEFAULT_DIALOG);
  const isViewed = useActionBadgesStore((state) => state.isViewed);
  const { trackPageView } = usePageViewTracking("P2P_HOST");

  const currentFilters = useMemo(
    () => ({
      status: (searchParams.get("status") as P2PHostStatus | "all") || "all",
      search: searchParams.get("search") || "",
      page: Number(searchParams.get("page") || "1") || 1,
      limit:
        Number(searchParams.get("limit") || String(PAGE_SIZE)) || PAGE_SIZE,
    }),
    [searchParams],
  );

  useEffect(() => {
    setSearchInput(currentFilters.search);
  }, [currentFilters.search]);

  const stats = useMemo(
    () => ({
      pending: hostsData.hosts.filter((host) => host.status === "pending")
        .length,
      approved: hostsData.hosts.filter((host) => host.status === "approved")
        .length,
      flagged: hostsData.hosts.filter((host) => host.status === "flagged")
        .length,
      rejected: hostsData.hosts.filter((host) => host.status === "rejected")
        .length,
    }),
    [hostsData.hosts],
  );

  const pushFilters = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const loadHosts = useCallback(async () => {
    setLoading(true);

    try {
      const result = await fetchP2PHosts(currentFilters);
      setHostsData(result);
      setError(null);

      // Mark loaded hosts as viewed (for badge tracking)
      const hostIds = result.hosts.map((h) => h.id);
      trackPageView(hostIds);
    } catch (cause) {
      setHostsData(EMPTY_RESULT);
      setError(
        cause instanceof Error ? cause.message : "Failed to load P2P hosts",
      );
    } finally {
      setLoading(false);
    }
  }, [currentFilters, trackPageView]);

  // Subscribe to real-time refreshes
  useRealTimeRefresh(loadHosts, "P2P_HOST");

  useEffect(() => {
    void loadHosts();
  }, [loadHosts]);

  const refreshCounts = useActionBadgesStore((state) => state.refreshCounts);

  useEffect(() => {
    // Clear P2P related notifications to remove sidebar badge when visiting the page
    markCategoriesAsRead(["P2P_ACTIVITY", "VEHICLE_ACTIVITY", "VERIFICATION_ACTIVITY"])
      .then(() => refreshCounts())
      .catch((err) => console.error("Failed to clear P2P notifications", err));
  }, [refreshCounts]);

  const handleView = (host: P2PHostSummary) => {
    router.push(`/sysadmin/p2p/${host.id}`);
  };

  const openApproveDialog = (host: P2PHostSummary) => {
    if (!host.reviewReadiness.canPromote) {
      setDialog({ type: "blockers", host, reason: "" });
      return;
    }
    setDialog({ type: "approve", host, reason: "" });
  };

  const openRejectDialog = (host: P2PHostSummary) => {
    setDialog({ type: "reject", host, reason: "" });
  };

  const openSuspendDialog = (host: P2PHostSummary) => {
    setDialog({ type: "suspend", host, reason: "" });
  };

  const openReactivateDialog = (host: P2PHostSummary) => {
    setDialog({ type: "reactivate", host, reason: "" });
  };

  const executeApprove = async () => {
    if (!dialog.host) return;
    setActionInProgress(dialog.host.id);
    try {
      await reviewP2PHost(dialog.host.id, { status: "approved" });
      await loadHosts();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to approve host",
      );
    } finally {
      setActionInProgress(null);
      setDialog(DEFAULT_DIALOG);
    }
  };

  const executeReject = async () => {
    if (!dialog.host) return;
    setActionInProgress(dialog.host.id);
    try {
      await reviewP2PHost(dialog.host.id, {
        status: "rejected",
        adminComment: dialog.reason || undefined,
      });
      await loadHosts();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to reject host",
      );
    } finally {
      setActionInProgress(null);
      setDialog(DEFAULT_DIALOG);
    }
  };

  const executeSuspend = async () => {
    if (!dialog.host) return;
    setActionInProgress(dialog.host.id);
    try {
      await updateAdminUserStatus(dialog.host.userId, "SUSPENDED");
      await loadHosts();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to suspend host",
      );
    } finally {
      setActionInProgress(null);
      setDialog(DEFAULT_DIALOG);
    }
  };

  const executeReactivate = async () => {
    if (!dialog.host) return;
    setActionInProgress(dialog.host.id);
    try {
      await updateAdminUserStatus(dialog.host.userId, "ACTIVE");
      await loadHosts();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to reactivate host",
      );
    } finally {
      setActionInProgress(null);
      setDialog(DEFAULT_DIALOG);
    }
  };

  const fmtDate = (value: string | null) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderHostActions = (
    host: P2PHostSummary,
    triggerClassName?: string,
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 opacity-60 transition-opacity hover:opacity-100",
            triggerClassName,
          )}
          disabled={actionInProgress === host.id}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleView(host)}>
          <Eye className="mr-2 h-4 w-4" /> View details
        </DropdownMenuItem>
        {host.status !== "approved" && (
          <DropdownMenuItem
            onClick={() => openApproveDialog(host)}
            disabled={
              actionInProgress === host.id || !host.reviewReadiness.canPromote
            }
          >
            <ThumbsUp className="mr-2 h-4 w-4" /> Approve
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {host.status !== "approved" && host.status !== "rejected" && (
          <DropdownMenuItem
            onClick={() => openRejectDialog(host)}
            className="text-red-600 focus:text-red-600"
            disabled={actionInProgress === host.id}
          >
            <ThumbsDown className="mr-2 h-4 w-4" /> Reject
          </DropdownMenuItem>
        )}
        {host.status === "approved" && host.accountStatus !== "SUSPENDED" && (
          <DropdownMenuItem
            onClick={() => openSuspendDialog(host)}
            className="text-orange-600 focus:text-orange-600"
            disabled={actionInProgress === host.id}
          >
            <AlertTriangle className="mr-2 h-4 w-4" /> Suspend
          </DropdownMenuItem>
        )}
        {host.accountStatus === "SUSPENDED" && (
          <DropdownMenuItem
            onClick={() => openReactivateDialog(host)}
            className="text-green-600 focus:text-green-600"
            disabled={actionInProgress === host.id}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Reactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading && hostsData.hosts.length === 0) {
    return <AdminListPageSkeleton stats={4} columns={8} rows={6} showHelperCard={false} />;
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <Header />
      <Main className="gap-6 p-6 md:p-8 pb-20">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              P2P Approval
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Review renters who submitted vehicles and verification documents
              for peer-host approval.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Pending Review"
              value={stats.pending}
              icon={Clock}
              cls="border-yellow-200 dark:border-yellow-900/50"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon={CheckCircle2}
              cls="border-green-200 dark:border-green-900/50"
            />
            <StatCard
              label="Flagged"
              value={stats.flagged}
              icon={AlertTriangle}
            />
            <StatCard label="Rejected" value={stats.rejected} icon={XCircle} />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-medium">Error loading hosts</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          )}

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search host name, email..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onBlur={() =>
                      pushFilters({
                        search: searchInput.trim() || undefined,
                        page: 1,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        pushFilters({
                          search: searchInput.trim() || undefined,
                          page: 1,
                        });
                      }
                    }}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={currentFilters.status}
                  onValueChange={(value) =>
                    pushFilters({
                      status: value === "all" ? undefined : value,
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <ExportButton
                  onExport={() => exportP2PHostsToExcel(hostsData.hosts)}
                  disabled={loading || hostsData.hosts.length === 0}
                />
                <Button
                  variant="outline"
                  onClick={() => void loadHosts()}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            {hostsData.hosts.length} hosts shown
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
              <Table className="w-full">
              <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/85">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[20%]">Host</TableHead>
                  <TableHead className="w-[18%]">Contact</TableHead>
                  <TableHead className="w-[16%]">Verification</TableHead>
                  <TableHead className="w-[12%]">Vehicles</TableHead>
                  <TableHead className="w-[14%]">Documents</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[8%]">Submitted</TableHead>
                  <TableHead className="w-[2%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-16 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                        <span>Loading applications...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : hostsData.hosts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-16 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Handshake className="h-8 w-8 opacity-30" />
                        <span>No P2P host applications found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  hostsData.hosts.map((host) => (
                    <TableRow
                      key={host.id}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="align-top">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{host.name}</div>
                          {!isViewed("P2P_HOST", host.id) && (
                            <RecordBadge show={true} variant="signal" />
                          )}
                        </div>
                        <div className="max-w-[180px] truncate text-xs text-muted-foreground">
                          Level: {host.verificationLevel.replaceAll("_", " ")}
                        </div>
                        <div className="mt-2">
                          <PromotionReadiness
                            canPromote={host.reviewReadiness.canPromote}
                            blockerCount={host.reviewReadiness.blockerCount}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="max-w-[180px] break-words text-sm text-muted-foreground">
                          {host.email}
                        </div>
                        {host.phoneNumber && (
                          <div className="text-xs text-muted-foreground">
                            {host.phoneNumber}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-xs text-muted-foreground">
                          {host.verificationStatus || "N/A"}
                        </div>
                        {(host.reviewReadiness.pendingVerificationCount > 0 ||
                          host.reviewReadiness.pendingVehicleCount > 0) && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {host.reviewReadiness.pendingVerificationCount} doc
                            pending · {host.reviewReadiness.pendingVehicleCount}{" "}
                            vehicle pending
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-sm">
                          {host.vehiclesOwned} total
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {host.vehiclesPendingApproval} pending ·{" "}
                          {host.vehiclesApproved} approved
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1">
                          <DocCheck ok={host.hasIdDocument} label="ID" />
                          <DocCheck
                            ok={host.hasDriverLicense}
                            label="License"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-center gap-2">
                          <P2PStatusBadge host={host} />
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {fmtDate(host.submittedAt)}
                      </TableCell>
                      <TableCell className="align-top">
                        {renderHostActions(
                          host,
                          "group-hover:opacity-100 focus-visible:opacity-100",
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>

          {hostsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {hostsData.pagination.page} of{" "}
                {hostsData.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || hostsData.pagination.page <= 1}
                  onClick={() =>
                    pushFilters({ page: hostsData.pagination.page - 1 })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    loading ||
                    hostsData.pagination.page >= hostsData.pagination.totalPages
                  }
                  onClick={() =>
                    pushFilters({ page: hostsData.pagination.page + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Main>
    

      {/* Approve Confirmation Dialog */}
      <AlertDialog
        open={dialog.type === "approve"}
        onOpenChange={(open) => !open && setDialog(DEFAULT_DIALOG)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve P2P Host</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.host &&
                `Promote ${dialog.host.name} to peer host? Their pending vehicles will stay in review until you approve them separately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialog(DEFAULT_DIALOG)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeApprove}
              disabled={actionInProgress !== null}
            >
              {actionInProgress !== null && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog
        open={dialog.type === "reject"}
        onOpenChange={(open) => !open && setDialog(DEFAULT_DIALOG)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject P2P Host</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.host &&
                `Reject ${dialog.host.name}'s host application? Their pending vehicles will be marked rejected.`}
            </AlertDialogDescription>
            <div className="mt-4">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                value={dialog.reason}
                onChange={(e) =>
                  setDialog({ ...dialog, reason: e.target.value })
                }
                placeholder="Enter rejection reason..."
                className="mt-1"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialog(DEFAULT_DIALOG)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeReject}
              disabled={actionInProgress !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionInProgress !== null && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog
        open={dialog.type === "suspend"}
        onOpenChange={(open) => !open && setDialog(DEFAULT_DIALOG)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend P2P Host</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.host &&
                `Are you sure you want to suspend ${dialog.host.name}'s account? This will prevent them from accessing the platform.`}
            </AlertDialogDescription>
            <div className="mt-4">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                value={dialog.reason}
                onChange={(e) =>
                  setDialog({ ...dialog, reason: e.target.value })
                }
                placeholder="Enter suspension reason..."
                className="mt-1"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialog(DEFAULT_DIALOG)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSuspend}
              disabled={actionInProgress !== null}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {actionInProgress !== null && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog
        open={dialog.type === "reactivate"}
        onOpenChange={(open) => !open && setDialog(DEFAULT_DIALOG)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate P2P Host</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.host &&
                `Are you sure you want to reactivate ${dialog.host.name}'s account? This will restore their access to the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialog(DEFAULT_DIALOG)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeReactivate}
              disabled={actionInProgress !== null}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {actionInProgress !== null && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Blockers Info Dialog */}
      <AlertDialog
        open={dialog.type === "blockers"}
        onOpenChange={(open) => !open && setDialog(DEFAULT_DIALOG)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Promotion Blocked
            </AlertDialogTitle>
            <AlertDialogDescription>
              This applicant still has review blockers. Open the detail page to
              finish reviewing their documents and vehicle submissions.
            </AlertDialogDescription>
            {(dialog.host?.reviewReadiness?.blockerCount ?? 0) > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                {dialog.host?.reviewReadiness?.blockerCount} blocker(s)
                remaining.
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialog(DEFAULT_DIALOG)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
