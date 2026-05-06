"use client";

import { useState, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  Clock,
  Download,
  Search,
  MoreHorizontal,
  FileText,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockTransactions,
  monthlyRevenue,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "./data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(cents) / 100);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<TransactionStatus, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

function TxnStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-normal capitalize", statusStyles[status])}
    >
      {status}
    </Badge>
  );
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const typeStyles: Record<TransactionType, string> = {
  subscription:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  rental:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  commission:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  refund: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function TxnTypeBadge({ type }: { type: TransactionType }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-normal capitalize", typeStyles[type])}
    >
      {type}
    </Badge>
  );
}

// ─── Sparkline bar ────────────────────────────────────────────────────────────

function RevenueSparkline() {
  const max = Math.max(...monthlyRevenue.map((m) => m.revenue));
  return (
    <div className="flex items-end gap-1 h-10">
      {monthlyRevenue.map((m) => (
        <div
          key={m.month}
          className="flex flex-col items-center gap-0.5 flex-1"
        >
          <div
            className="w-full rounded-sm bg-primary/70 transition-all"
            style={{ height: `${Math.round((m.revenue / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  highlight,
  negative,
}: {
  label: string;
  value: string;
  note?: string;
  icon: React.ElementType;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <Card
      className={cn(
        "shadow-sm hover:shadow-md transition-shadow",
        highlight && "border-primary/30",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div
          className={cn(
            "text-2xl font-bold tracking-tight",
            negative && "text-red-500",
          )}
        >
          {value}
        </div>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RevenuePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockTransactions.filter((t) => {
      const matchQ =
        !q ||
        t.companyName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.invoice.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchQ && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const totalRevenue = mockTransactions
    .filter((t) => t.status === "paid" && t.type !== "refund")
    .reduce((s, t) => s + t.amount, 0);

  const totalCommissions = mockTransactions
    .filter((t) => t.type === "commission" && t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);

  const totalRefunds = mockTransactions
    .filter((t) => t.status === "refunded")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const pendingAmount = mockTransactions
    .filter((t) => t.status === "pending")
    .reduce((s, t) => s + t.amount, 0);

  const handleExport = () => console.log("Export CSV");
  const handleViewInvoice = (t: Transaction) =>
    console.log("Invoice", t.invoice);
  const handleRetry = (t: Transaction) => console.log("Retry", t.id);

  return (
    <div className="relative flex h-full w-full  ">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Revenue
              </h1>
              <p className="text-muted-foreground max-w-2xl mt-1">
                Track subscription income, rental commissions, refunds, and
                pending payments across the platform.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2 shrink-0 mt-1"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={fmt(totalRevenue)}
              note="All paid transactions"
              icon={DollarSign}
              highlight
            />
            <StatCard
              label="Commissions"
              value={fmt(totalCommissions)}
              note="Platform + rental fees"
              icon={TrendingUp}
            />
            <StatCard
              label="Pending"
              value={fmt(pendingAmount)}
              note="Awaiting settlement"
              icon={Clock}
            />
            <StatCard
              label="Refunds"
              value={fmt(totalRefunds)}
              note="Issued this period"
              icon={ArrowDownRight}
              negative
            />
          </div>

          {/* Sparkline card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue (last 6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-16">
                {monthlyRevenue.map((m) => {
                  const max = Math.max(...monthlyRevenue.map((x) => x.revenue));
                  return (
                    <div
                      key={m.month}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <div
                        className="w-full rounded-sm bg-primary/80 hover:bg-primary transition-all cursor-default"
                        style={{
                          height: `${Math.round((m.revenue / max) * 100)}%`,
                          minHeight: 4,
                        }}
                        title={`${m.month}: ${fmt(m.revenue)}`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search company, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="sm:w-[160px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              {filtered.length} of {mockTransactions.length} transactions shown
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
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
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => (
                    <TableRow
                      key={t.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.invoice}
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.companyName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {t.description}
                      </TableCell>
                      <TableCell>
                        <TxnTypeBadge type={t.type} />
                      </TableCell>
                      <TableCell>
                        <TxnStatusBadge status={t.status} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold tabular-nums",
                          t.amount < 0 && "text-red-500",
                        )}
                      >
                        {t.amount < 0 ? `−${fmt(t.amount)}` : fmt(t.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDate(t.date)}
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
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewInvoice(t)}
                            >
                              <FileText className="mr-2 h-4 w-4" /> View invoice
                            </DropdownMenuItem>
                            {t.status === "failed" && (
                              <DropdownMenuItem onClick={() => handleRetry(t)}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Retry
                                charge
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
