"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminListPageSkeleton } from "@/components/system-admin/sysadmin-page-skeletons";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchAdminDepositRefunds,
  settleHeldSecurityDeposit,
  type AdminDepositRefundItem,
  type AdminTransactionStatus,
} from "@/lib/admin-transactions-api";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  HELD_IN_ESCROW:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  REFUNDED: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  HELD_IN_ESCROW_DEPOSIT:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  UNDER_REVIEW:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  REFUNDED_TO_RENTER:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  RELEASED_TO_OWNER:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
};

const EMPTY_VALUE = "-";

function fmtMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : EMPTY_VALUE;
}

export default function DepositRefundsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<AdminDepositRefundItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AdminTransactionStatus | "all">("HELD_IN_ESCROW");
  const [q, setQ] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDepositRefunds({
        page,
        limit: 50,
        ...(status !== "all" ? { status } : {}),
      });
      setItems(data.items || []);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security deposits");
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) {
      return items;
    }

    return items.filter((item) =>
      [
        item.booking?.bookingId,
        item.renter?.name,
        item.renter?.email,
        item.vehicle?.label,
        item.vehicle?.plate,
        item.vehicle?.ownerName,
        item.transaction.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [items, q]);

  async function handleRefundToRenter(item: AdminDepositRefundItem) {
    if (!item.actions.canRefundDepositToRenter) return;

    setProcessingId(item.transaction.id);
    try {
      const result = await settleHeldSecurityDeposit({
        transactionId: item.transaction.id,
        action: "REFUND_TO_RENTER",
      });

      toast({
        title: "Deposit refunded",
        description: `${fmtMoney(result.amount, result.currency)} was moved to the renter wallet.`,
      });

      await loadItems();
    } catch (err) {
      toast({
        title: "Refund failed",
        description:
          err instanceof Error ? err.message : "Unable to refund this deposit to the renter wallet.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading && items.length === 0) {
    return <AdminListPageSkeleton stats={0} columns={7} rows={6} showHelperCard={false} />;
  }

  return (
    <div className="relative flex h-full w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Deposit Refunds</h1>
              <p className="mt-1 max-w-3xl text-muted-foreground">
                Track self-drive security deposits held by the platform and manually refund eligible deposits to the renter wallet when needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/sysadmin/revenue/transactions")}
              >
                Open Transaction Log
              </Button>
              <Button variant="outline" onClick={loadItems} disabled={isLoading}>
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20">
              <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">
                {error}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem_14rem]">
            <div className="w-full">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search booking, renter, vehicle, plate..."
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as AdminTransactionStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by transaction status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All deposit transactions</SelectItem>
                <SelectItem value="HELD_IN_ESCROW">Held in escrow</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="COMPLETED">Released / completed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end rounded-xl border bg-card px-4 text-sm text-muted-foreground">
              {filteredItems.length} shown
            </div>
          </div>

          <div className="max-h-[72vh] overflow-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Renter</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      Loading security deposits...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      No security deposit transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const bookingStatus = item.booking?.status || EMPTY_VALUE;
                    const depositStatus = item.booking?.depositStatus || item.transaction.status || EMPTY_VALUE;
                    return (
                      <TableRow key={item.transaction.id} className="align-top hover:bg-muted/50">
                        <TableCell className="text-sm text-muted-foreground">
                          {fmtDate(item.transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs text-foreground">
                            {item.booking?.bookingId || item.transaction.bookingId || EMPTY_VALUE}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Payment: {item.booking?.paymentStatus || EMPTY_VALUE}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.renter?.name || EMPTY_VALUE}</div>
                          <div className="mt-1 break-all text-xs text-muted-foreground">
                            {item.renter?.email || EMPTY_VALUE}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.vehicle?.label || EMPTY_VALUE}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {item.vehicle?.plate || EMPTY_VALUE}
                            {item.vehicle?.ownerName ? ` • ${item.vehicle.ownerName}` : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant="outline"
                              className={cn("w-fit border-0 font-normal", statusStyles[bookingStatus] || "")}
                            >
                              {bookingStatus}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn("w-fit border-0 font-normal", statusStyles[depositStatus] || "")}
                            >
                              {depositStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {fmtMoney(item.transaction.amount, item.transaction.currency || "ETB")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-stretch gap-2 sm:items-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/sysadmin/revenue/transactions/${item.transaction.id}`)
                              }
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => void handleRefundToRenter(item)}
                              disabled={
                                processingId === item.transaction.id ||
                                !item.actions.canRefundDepositToRenter
                              }
                            >
                              {processingId === item.transaction.id
                                ? "Refunding..."
                                : "Refund to Renter"}
                            </Button>
                            {!item.actions.canRefundDepositToRenter && (
                              <div className="max-w-[16rem] text-xs text-muted-foreground">
                                {item.actions.refundDepositIneligibleReason ||
                                  "This deposit cannot be refunded yet."}
                              </div>
                            )}
                          </div>
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
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={isLoading || page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
