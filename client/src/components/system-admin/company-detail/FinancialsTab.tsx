"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingDown, Clock, ArrowRightLeft } from "lucide-react";
import type { FinancialSummary } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(val);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ─── Sparkline bar chart ─────────────────────────────────────────────────────

function MonthlyRevenueChart({
  revenueByMonth,
}: {
  revenueByMonth: FinancialSummary["revenueByMonth"];
}) {
  if (revenueByMonth.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center text-sm text-muted-foreground w-full">
        No revenue data available
      </div>
    );
  }

  const max = Math.max(...revenueByMonth.map((m) => m.revenue));

  return (
    <div className="flex items-end gap-1.5 h-20 w-full pt-4">
      {revenueByMonth.map((m) => (
        <div
          key={m.month}
          className="flex flex-col items-center gap-1 flex-1 h-full justify-end"
        >
          <div
            className="w-full rounded-sm bg-primary/80 hover:bg-primary transition-all cursor-default"
            style={{
              height: `${Math.max((m.revenue / max) * 100, 4)}%`,
            }}
            title={`${m.month}: ${fmt(m.revenue)} (${m.bookings} bookings)`}
          />
          <span className="text-[10px] text-muted-foreground hidden sm:block">
            {m.month}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
  negative,
}: {
  label: string;
  value: string;
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
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold tracking-tight",
            negative && "text-amber-600 dark:text-amber-500",
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Financials Tab ──────────────────────────────────────────────────────────

interface FinancialsTabProps {
  financials: FinancialSummary;
}

export function FinancialsTab({ financials }: FinancialsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Key Metrics Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Lifetime Revenue"
          value={fmt(financials.totalRevenue)}
          icon={DollarSign}
          highlight
        />
        <StatCard
          label="Pending Payouts"
          value={fmt(financials.pendingPayments)}
          icon={Clock}
          negative={financials.pendingPayments > 0}
        />
        <StatCard
          label="Completed Payouts"
          value={fmt(financials.completedPayments)}
          icon={TrendingDown}
        />
        <StatCard
          label="Avg. Booking Value"
          value={fmt(financials.avgBookingValue)}
          icon={ArrowRightLeft}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Monthly Revenue Chart (spans 1 col) ────────────────────── */}
        <Card className="shadow-sm lg:col-span-1 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyRevenueChart revenueByMonth={financials.revenueByMonth} />
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
              <div>
                <span className="font-semibold text-foreground">
                  {financials.revenueByMonth.reduce(
                    (acc, curr) => acc + curr.bookings,
                    0,
                  )}
                </span>{" "}
                bookings
              </div>
              <div className="h-4 w-[1px] bg-border" />
              <div>Last 6 months</div>
            </div>
          </CardContent>
        </Card>

        {/* ── Recent Transactions (spans 2 cols) ────────────────────── */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Vehicle & Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financials.recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No recent transactions
                    </TableCell>
                  </TableRow>
                ) : (
                  financials.recentTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/50">
                      {/* Date */}
                      <TableCell className="text-sm font-medium">
                        {fmtDate(tx.date)}
                      </TableCell>

                      {/* Info limit */}
                      <TableCell>
                        <div className="font-medium text-sm">
                          {tx.vehicleName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.customerName}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-normal border-0",
                            tx.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : tx.status === "pending"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                          )}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right pr-6 font-medium tabular-nums">
                        {fmt(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
