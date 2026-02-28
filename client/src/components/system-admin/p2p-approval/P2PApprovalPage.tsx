"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  Flag,
  Search,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockP2PListings, P2PListing, P2PStatus } from "./data";

// ─── Status badge ─────────────────────────────────────────────────────────────

const p2pStatusConfig: Record<
  P2PStatus,
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

function P2PStatusBadge({ status }: { status: P2PStatus }) {
  const { label, icon: Icon, cls } = p2pStatusConfig[status];
  return (
    <Badge variant="outline" className={cn("gap-1 border-0 font-normal", cls)}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </Badge>
  );
}

// ─── Doc check pill ───────────────────────────────────────────────────────────

function DocCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium",
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

// ─── Stat card ────────────────────────────────────────────────────────────────

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
        "rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow",
        cls,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function P2PApprovalPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockP2PListings.filter((l) => {
      const matchQ =
        !q ||
        l.ownerName.toLowerCase().includes(q) ||
        l.vehicleTitle.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [search, statusFilter]);

  const pending = mockP2PListings.filter((l) => l.status === "pending").length;
  const approved = mockP2PListings.filter(
    (l) => l.status === "approved",
  ).length;
  const flagged = mockP2PListings.filter((l) => l.status === "flagged").length;
  const rejected = mockP2PListings.filter(
    (l) => l.status === "rejected",
  ).length;

  const handleView = (l: P2PListing) => router.push(`/sysadmin/p2p/${l.id}`);
  const handleApprove = (l: P2PListing) => console.log("Approve", l.id);
  const handleReject = (l: P2PListing) => console.log("Reject", l.id);
  const handleFlag = (l: P2PListing) => console.log("Flag", l.id);

  const fmtRate = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              P2P Approval
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Review peer-to-peer vehicle listing submissions. Verify documents,
              insurance status, and approve or reject each host application.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Pending Review"
              value={pending}
              icon={Clock}
              cls="border-yellow-200 dark:border-yellow-900/50"
            />
            <StatCard
              label="Approved"
              value={approved}
              icon={CheckCircle2}
              cls="border-green-200 dark:border-green-900/50"
            />
            <StatCard label="Flagged" value={flagged} icon={AlertTriangle} />
            <StatCard label="Rejected" value={rejected} icon={XCircle} />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search owner, vehicle, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-[160px]">
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

          {/* Meta */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            {filtered.length} of {mockP2PListings.length} listings shown
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Handshake className="h-8 w-8 opacity-30" />
                        <span>No listings found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => (
                    <TableRow
                      key={l.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Car className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {l.vehicleTitle}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {l.vehicleType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{l.ownerName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {l.ownerEmail}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {l.location}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums text-sm">
                        {fmtRate(l.dailyRate)}/day
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <DocCheck ok={l.documentsVerified} label="ID" />
                          <DocCheck ok={l.insuranceValid} label="Insurance" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <P2PStatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDate(l.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(l)}>
                              <Eye className="mr-2 h-4 w-4" /> View listing
                            </DropdownMenuItem>
                            {l.status !== "approved" && (
                              <DropdownMenuItem
                                onClick={() => handleApprove(l)}
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                            )}
                            {l.status !== "flagged" && (
                              <DropdownMenuItem onClick={() => handleFlag(l)}>
                                <Flag className="mr-2 h-4 w-4" /> Flag
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {l.status !== "rejected" && (
                              <DropdownMenuItem
                                onClick={() => handleReject(l)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
