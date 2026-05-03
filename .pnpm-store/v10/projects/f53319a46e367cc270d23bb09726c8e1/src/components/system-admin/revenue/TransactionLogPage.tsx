"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  fetchAdminTransactions,
  type AdminTransaction,
  type AdminTransactionStatus,
  type AdminTransactionType,
} from "@/lib/admin-transactions-api";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  HELD_IN_ESCROW:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  REFUNDED: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

function fmtMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function TransactionLogPage() {
  const [items, setItems] = useState<AdminTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AdminTransactionStatus | "all">("all");
  const [type, setType] = useState<AdminTransactionType | "all">("all");

  const activeFilters = useMemo(
    () => ({
      page,
      limit: 50,
      ...(q.trim() ? { q: q.trim() } : {}),
      ...(status !== "all" ? { status } : {}),
      ...(type !== "all" ? { type } : {}),
    }),
    [page, q, status, type],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAdminTransactions(activeFilters);
        if (cancelled) return;
        setItems(data.transactions || []);
        setTotalPages(data.pagination.totalPages || 1);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load transactions");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activeFilters]);

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <div className="relative flex h-full w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transaction Log</h1>
              <p className="text-muted-foreground mt-1">
                View and filter platform transactions (live).
              </p>
            </div>
            <Button variant="outline" onClick={() => resetToFirstPage()} disabled={isLoading}>
              Refresh
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20">
              <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">
                {error}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:max-w-sm w-full">
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetToFirstPage();
                }}
                placeholder="Search id, booking id, gateway id..."
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as any);
                resetToFirstPage();
              }}
            >
              <SelectTrigger className="sm:w-[200px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="HELD_IN_ESCROW">HELD_IN_ESCROW</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
                <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as any);
                resetToFirstPage();
              }}
            >
              <SelectTrigger className="sm:w-[220px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="RENTAL_FEE">RENTAL_FEE</SelectItem>
                <SelectItem value="COMMISSION">COMMISSION</SelectItem>
                <SelectItem value="ESCROW_HOLD">ESCROW_HOLD</SelectItem>
                <SelectItem value="ESCROW_RELEASE">ESCROW_RELEASE</SelectItem>
                <SelectItem value="PAYOUT">PAYOUT</SelectItem>
                <SelectItem value="REFUND">REFUND</SelectItem>
                <SelectItem value="REFUND_REVERSAL">REFUND_REVERSAL</SelectItem>
                <SelectItem value="COLLATERAL_DEPOSIT">COLLATERAL_DEPOSIT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((t) => {
                    const statusValue = t.status || "PENDING";
                    return (
                      <TableRow key={t.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm text-muted-foreground">
                          {fmtDate(t.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">{t.type || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("border-0 font-normal", statusStyles[statusValue] || "")}
                          >
                            {statusValue}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {t.bookingId}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {fmtMoney(t.amount, t.currency || "ETB")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={isLoading || page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={isLoading || page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Main>
      </div>
    </div>
  );
}

