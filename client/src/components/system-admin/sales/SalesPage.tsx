"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
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
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Eye,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockSales, Sale, SaleStatus } from "./data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ─── Status badge ─────────────────────────────────────────────────────────────

const saleStatusConfig: Record<
  SaleStatus,
  { label: string; icon: React.ElementType; cls: string }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  disputed: {
    label: "Disputed",
    icon: AlertTriangle,
    cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const { label, icon: Icon, cls } = saleStatusConfig[status];
  return (
    <Badge variant="outline" className={cn("gap-1 border-0 font-normal", cls)}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </Badge>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockSales.filter((s) => {
      const matchQ =
        !q ||
        s.bookingRef.toLowerCase().includes(q) ||
        s.renterName.toLowerCase().includes(q) ||
        s.vehicleTitle.toLowerCase().includes(q) ||
        s.companyName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [search, statusFilter]);

  const totalRevenue = mockSales
    .filter((s) => s.status === "completed")
    .reduce((a, s) => a + s.totalAmount, 0);
  const totalFees = mockSales
    .filter((s) => s.status === "completed")
    .reduce((a, s) => a + s.platformFee, 0);
  const totalSales = mockSales.length;
  const disputed = mockSales.filter((s) => s.status === "disputed").length;

  const handleView = (s: Sale) => console.log("View", s.id);
  const handleDispute = (s: Sale) => console.log("Review dispute", s.id);

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Sales
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Monitor all rental bookings and transactions. Review completed
              sales, pending orders, cancellations, and active disputes.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Bookings"
              value={String(totalSales)}
              icon={ShoppingCart}
            />
            <StatCard
              label="Gross Revenue"
              value={fmt(totalRevenue)}
              icon={CheckCircle2}
              sub="Completed only"
            />
            <StatCard
              label="Platform Fees"
              value={fmt(totalFees)}
              icon={Car}
              sub="10% of completed"
            />
            <StatCard
              label="Active Disputes"
              value={String(disputed)}
              icon={AlertTriangle}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search ref, renter, vehicle..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            {filtered.length} of {totalSales} sales shown
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Renter</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-8 w-8 opacity-30" />
                        <span>No sales found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow
                      key={s.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        {s.bookingRef}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {s.renterName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[130px]">
                          {s.renterEmail}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {s.vehicleTitle}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.companyName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {fmtDate(s.startDate)} → {fmtDate(s.endDate)}
                        <div className="text-muted-foreground/60">
                          {s.days} {s.days === 1 ? "day" : "days"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-sm">
                        {fmt(s.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                        {fmt(s.platformFee)}
                      </TableCell>
                      <TableCell>
                        <SaleStatusBadge status={s.status} />
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
                            <DropdownMenuItem onClick={() => handleView(s)}>
                              <Eye className="mr-2 h-4 w-4" /> View booking
                            </DropdownMenuItem>
                            {s.status === "disputed" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDispute(s)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <AlertTriangle className="mr-2 h-4 w-4" />{" "}
                                  Review dispute
                                </DropdownMenuItem>
                              </>
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
