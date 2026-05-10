"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  AlertCircle,
  Bug,
  UserX,
  Car,
  Building2,
  HelpCircle,
  FileQuestion,
  Clock3,
  CheckCircle2,
  Loader2,
  XCircle,
  RefreshCcw,
  Inbox,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminListPageSkeleton } from "@/components/system-admin/sysadmin-page-skeletons";

interface Report {
  id: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  reportedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

// ─── Summary stat card ─────────────────────────────────────────────────────────
function StatCard({
  label,
  count,
  icon: Icon,
  colorClass,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className={`rounded-lg p-2 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{count}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Type icon helper ──────────────────────────────────────────────────────────
function TypeIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    SYSTEM_GLITCH: { icon: Bug, color: "text-rose-500" },
    USER_BEHAVIOR: { icon: UserX, color: "text-amber-600" },
    VEHICLE_ISSUE: { icon: Car, color: "text-blue-500" },
    COMPANY_ISSUE: { icon: Building2, color: "text-violet-500" },
    OTHER: { icon: HelpCircle, color: "text-slate-400" },
  };
  const entry = map[type] || map.OTHER;
  const Icon = entry.icon;
  return <Icon className={cn("h-4 w-4 shrink-0", entry.color)} />;
}

function typeLabel(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Badge helpers ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    OPEN: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    UNDER_REVIEW:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    RESOLVED:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    CLOSED:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase", classes[status])}>
      {status.replace("_", " ")}
    </Badge>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    CRITICAL: "bg-rose-500",
    HIGH: "bg-orange-400",
    MEDIUM: "bg-blue-400",
    LOW: "bg-slate-400",
  };

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className={cn("inline-block h-2 w-2 rounded-full", colors[priority] || colors.MEDIUM)} />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ReportManagementPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const apiBaseUrl = resolveApiBaseUrl();

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.append("status", statusFilter);
      if (typeFilter !== "all") query.append("type", typeFilter);

      const response = await fetch(`${apiBaseUrl}/reports/admin?${query.toString()}`, {
        headers: buildAuthHeader(),
      });
      const result = await response.json();
      if (response.ok) {
        setReports(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, statusFilter, typeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Client-side text search
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.type.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.reportedBy?.name?.toLowerCase().includes(q) ||
        r.reportedBy?.email?.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const countByStatus = (s: string) => reports.filter((r) => r.status === s).length;

  if (isLoading && reports.length === 0) {
    return <AdminListPageSkeleton stats={4} columns={6} rows={6} showHelperCard={false} />;
  }

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* Page header */}
          <div className="flex flex-col gap-1">
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Reports
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Review system glitches, user complaints, and platform-wide reports from all users.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Open"
              count={countByStatus("OPEN")}
              icon={FileQuestion}
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            />
            <StatCard
              label="Under Review"
              count={countByStatus("UNDER_REVIEW")}
              icon={Clock3}
              colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
            />
            <StatCard
              label="Resolved"
              count={countByStatus("RESOLVED")}
              icon={CheckCircle2}
              colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
            />
            <StatCard
              label="Closed"
              count={countByStatus("CLOSED")}
              icon={XCircle}
              colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by reporter, description..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SYSTEM_GLITCH">System Glitch</SelectItem>
                  <SelectItem value="USER_BEHAVIOR">User Behavior</SelectItem>
                  <SelectItem value="VEHICLE_ISSUE">Vehicle Issue</SelectItem>
                  <SelectItem value="COMPANY_ISSUE">Company Issue</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchReports} disabled={isLoading}>
                <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Count info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {filteredReports.length} of {reports.length} reports shown
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Type</TableHead>
                  <TableHead className="w-[200px]">Reporter</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[130px]">Submitted</TableHead>
                  <TableHead className="w-[100px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading reports...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Inbox className="h-8 w-8 text-muted-foreground/40" />
                        <div>
                          <p className="text-sm font-medium">No reports found</p>
                          <p className="text-xs">Try adjusting your filters</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <TypeIcon type={report.type} />
                          <span className="text-sm font-medium">{typeLabel(report.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {report.reportedBy?.name || "Unknown"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {report.reportedBy?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityDot priority={report.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(report.createdAt), "MMM d, yyyy · h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-60 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link href={`/sysadmin/reports/${report.id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Main>
      </div>
    </div>
  );
}
