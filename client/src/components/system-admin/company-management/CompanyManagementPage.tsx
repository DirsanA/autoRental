"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";
import { CompanyFilters } from "./CompanyFilters";
import { CompanyTable } from "./CompanyTable";
import type { Company } from "./data";
import {
  approveAdminCompany,
  fetchAdminCompanies,
  suspendAdminCompany,
} from "./api";
import { useToast } from "@/hooks/use-toast";
import type {
  AdminCompanyApiStatus,
  AdminCompaniesPagination,
} from "@/lib/admin-companies-api";

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
 * Admin company management page backed by the live company moderation API.
 */
export default function CompanyManagementPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<AdminCompaniesPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<Company | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Company | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

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

    fetchAdminCompanies({
      search: search || undefined,
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as AdminCompanyApiStatus),
      page,
      limit: PAGE_SIZE,
    })
      .then((result) => {
        if (cancelled) return;
        setCompanies(result.companies);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof Error ? cause.message : "Failed to load companies",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, search, statusFilter]);

  const refreshCompanies = () => setReloadKey((value) => value + 1);

  const handleView = (company: Company) =>
    router.push(`/sysadmin/companies/${company.id}`);

  const handleApprove = (company: Company) => {
    setApproveTarget(company);
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setPendingCompanyId(approveTarget.id);

    try {
      const updated = await approveAdminCompany(approveTarget.id);
      setCompanies((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      toast({
        title:
          approveTarget.statusValue === "SUSPENDED"
            ? "Company reactivated"
            : "Company approved",
        description: `${updated.name} is now active.`,
      });
      setApproveTarget(null);
    } catch (cause: unknown) {
      toast({
        title: "Company update failed",
        description:
          cause instanceof Error ? cause.message : "Failed to update company",
        variant: "destructive",
      });
    } finally {
      setPendingCompanyId(null);
    }
  };

  const handleSuspend = (company: Company) => {
    setSuspendTarget(company);
    setSuspendReason("");
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    if (!suspendReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a suspension reason for the company.",
        variant: "destructive",
      });
      return;
    }

    setPendingCompanyId(suspendTarget.id);

    try {
      const updated = await suspendAdminCompany(
        suspendTarget.id,
        suspendReason.trim(),
      );
      setCompanies((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      toast({
        title: "Company suspended",
        description: `${updated.name} is now suspended.`,
      });
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (cause: unknown) {
      toast({
        title: "Suspension failed",
        description:
          cause instanceof Error ? cause.message : "Failed to suspend company",
        variant: "destructive",
      });
    } finally {
      setPendingCompanyId(null);
    }
  };

  const activeCompanies = companies.filter((company) => company.status === "active").length;
  const pendingCompanies = companies.filter((company) => company.status === "pending").length;
  const suspendedCompanies = companies.filter(
    (company) => company.status === "suspended",
  ).length;
  const verifiedCompanies = companies.filter((company) => company.isVerified).length;

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <Main className="gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Company Management
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Moderate registered companies, approve business onboarding, and
              manage company-level access separately from people accounts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard
              title="Companies On This Page"
              value={companies.length}
              icon={Building2}
              note="Current results after company filters are applied."
            />
            <SummaryCard
              title="Active"
              value={activeCompanies}
              icon={CheckCircle2}
              note="Businesses currently active in this result set."
            />
            <SummaryCard
              title="Pending Review"
              value={pendingCompanies}
              icon={ShieldCheck}
              note="Companies waiting for approval."
            />
            <SummaryCard
              title="Suspended"
              value={suspendedCompanies}
              icon={ShieldBan}
              note={`Verified on this page: ${verifiedCompanies}`}
            />
          </div>

          <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            Company entities are managed here so user administration stays focused
            on people and internal staff accounts.
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CompanyFilters
              search={searchInput}
              onSearchChange={setSearchInput}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            />

            <Button
              variant="outline"
              onClick={refreshCompanies}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Showing {companies.length} of {pagination.total} matching companies
            </div>
            <div>
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card p-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              <div>{error}</div>
              <Button
                variant="outline"
                onClick={refreshCompanies}
                className="mt-4"
              >
                Try again
              </Button>
            </div>
          ) : (
            <>
              <CompanyTable
                companies={companies}
                pendingCompanyId={pendingCompanyId}
                onView={handleView}
                onApprove={handleApprove}
                onSuspend={handleSuspend}
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

      <Dialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendTarget(null);
            setSuspendReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Company</DialogTitle>
            <DialogDescription>
              Provide the reason that explains why this company is being suspended.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="suspension-reason">Suspension reason</Label>
            <Textarea
              id="suspension-reason"
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
              placeholder="Explain why the company is being suspended..."
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmSuspend}
              disabled={pendingCompanyId === suspendTarget?.id}
            >
              {pendingCompanyId === suspendTarget?.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Suspend company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approveTarget?.statusValue === "SUSPENDED"
                ? "Reactivate company"
                : "Approve company"}
            </DialogTitle>
            <DialogDescription>
              {approveTarget?.statusValue === "SUSPENDED"
                ? `This will restore access for ${approveTarget?.name}.`
                : `This will approve ${approveTarget?.name} and activate their company account.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={pendingCompanyId === approveTarget?.id}
              className="gap-2"
            >
              {pendingCompanyId === approveTarget?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {approveTarget?.statusValue === "SUSPENDED"
                ? "Reactivate"
                : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
