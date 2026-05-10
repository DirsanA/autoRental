"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchAdminTransactionDetail,
  refundEscrowToSystemWallet,
  type AdminTransactionDetail,
} from "@/lib/admin-transactions-api";

const statusStyles: Record<string, string> = {
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  HELD_IN_ESCROW:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  REFUNDED:
    "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  CANCELLED:
    "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
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

function DetailCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-background/80 p-4 shadow-sm", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-2.5 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className={cn("text-sm text-foreground sm:max-w-[60%] sm:text-right", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

export function TransactionDetailPage({
  transactionId,
}: {
  transactionId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [detail, setDetail] = useState<AdminTransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAdminTransactionDetail(transactionId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setDetail(null);
        setLoadError(
          err instanceof Error ? err.message : "Failed to load transaction details",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  async function handleRefundToSystemWallet() {
    if (!detail?.actions.canRefundToSystemWallet) return;

    setIsRefunding(true);
    try {
      const result = await refundEscrowToSystemWallet({
        transactionId,
        reason: refundReason,
      });

      toast({
        title: "Refund completed",
        description: `${fmtMoney(result.amount, result.currency)} was moved to the system wallet.`,
      });

      router.push("/sysadmin/wallet");
    } catch (err) {
      toast({
        title: "Refund failed",
        description:
          err instanceof Error ? err.message : "Unable to refund this escrow transaction.",
        variant: "destructive",
      });
      setIsRefunding(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <Main className="gap-6 p-4 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-fit px-0 text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/sysadmin/revenue/transactions")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Transaction Details
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review this transaction and recover escrow to the system wallet when needed.
              </p>
            </div>
          </div>

          {detail?.transaction ? (
            <div className="rounded-2xl border bg-background px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Transaction ID
              </div>
              <div className="mt-1 font-mono text-xs text-foreground sm:text-sm">
                {detail.transaction.id}
              </div>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <Card className="rounded-3xl border-dashed">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              Loading transaction details...
            </CardContent>
          </Card>
        ) : loadError ? (
          <Card className="border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20">
            <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">
              {loadError}
            </CardContent>
          </Card>
        ) : detail ? (
          <div className="space-y-5">
            <section className="rounded-3xl border bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-sm dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Transaction Summary
                  </div>
                  <div className="mt-2 text-lg font-semibold sm:text-2xl">
                    {detail.booking?.bookingId || detail.transaction.bookingId || EMPTY_VALUE}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {detail.vehicle?.label || "Vehicle details unavailable"}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[20rem]">
                  <div className="rounded-2xl border bg-background/85 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Amount
                    </div>
                    <div className="mt-1 font-semibold tabular-nums sm:text-lg">
                      {fmtMoney(
                        detail.transaction.amount,
                        detail.transaction.currency || "ETB",
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-background/85 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Status
                    </div>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 font-normal",
                          statusStyles[detail.transaction.status || ""] || "",
                        )}
                      >
                        {detail.transaction.status || EMPTY_VALUE}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
              <DetailCard title="Transaction">
                <DetailRow
                  label="Type"
                  value={detail.transaction.type || EMPTY_VALUE}
                  valueClassName="font-medium"
                />
                <DetailRow
                  label="Gateway ref"
                  value={detail.transaction.paymentGatewayId || EMPTY_VALUE}
                  valueClassName="font-mono text-xs break-all"
                />
                <DetailRow
                  label="Created"
                  value={fmtDate(detail.transaction.createdAt)}
                />
              </DetailCard>

              <DetailCard title="Booking Context">
                <DetailRow
                  label="Booking ref"
                  value={detail.booking?.bookingId || detail.transaction.bookingId || EMPTY_VALUE}
                  valueClassName="font-mono text-xs"
                />
                <DetailRow
                  label="Booking status"
                  value={detail.booking?.status || EMPTY_VALUE}
                  valueClassName="font-medium"
                />
                <DetailRow
                  label="Payment"
                  value={detail.booking?.paymentStatus || EMPTY_VALUE}
                  valueClassName="font-medium"
                />
                <DetailRow label="Start" value={fmtDate(detail.booking?.startTime || null)} />
                <DetailRow label="End" value={fmtDate(detail.booking?.endTime || null)} />
              </DetailCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <DetailCard title="Vehicle and Owner">
                <DetailRow
                  label="Vehicle"
                  value={detail.vehicle?.label || EMPTY_VALUE}
                  valueClassName="font-medium"
                />
                <DetailRow label="Plate" value={detail.vehicle?.plate || EMPTY_VALUE} />
                <DetailRow
                  label="Owner type"
                  value={detail.vehicle?.ownerType || EMPTY_VALUE}
                />
                <DetailRow
                  label="Owner"
                  value={detail.vehicle?.ownerName || EMPTY_VALUE}
                />
              </DetailCard>

              <DetailCard title="Renter and Wallet">
                <DetailRow
                  label="Renter"
                  value={detail.renter?.name || EMPTY_VALUE}
                />
                <DetailRow
                  label="Email"
                  value={detail.renter?.email || EMPTY_VALUE}
                  valueClassName="break-all"
                />
                <DetailRow
                  label="Owner escrow"
                  value={
                    detail.ownerWallet
                      ? fmtMoney(
                          detail.ownerWallet.pendingBalance,
                          detail.ownerWallet.currency,
                        )
                      : EMPTY_VALUE
                  }
                  valueClassName="font-semibold tabular-nums"
                />
                <DetailRow
                  label="Owner available"
                  value={
                    detail.ownerWallet
                      ? fmtMoney(
                          detail.ownerWallet.availableBalance,
                          detail.ownerWallet.currency,
                        )
                      : EMPTY_VALUE
                  }
                  valueClassName="font-semibold tabular-nums"
                />
              </DetailCard>
            </div>

            <DetailCard
              title="System Wallet Recovery"
              className="border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/30"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-base font-semibold">
                    <Wallet className="h-4 w-4" />
                    Refund to System Wallet
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Use this only when the escrow should be recovered from a
                    peer host or company and credited to the system admin wallet.
                  </p>
                </div>
                {detail.actions.canRefundToSystemWallet ? (
                  <Badge className="w-fit bg-emerald-600 text-white hover:bg-emerald-600">
                    Eligible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="w-fit border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300">
                    Not Eligible
                  </Badge>
                )}
              </div>

              {detail.actions.canRefundToSystemWallet ? (
                <div className="mt-4 space-y-3">
                  <Textarea
                    className="min-h-28 resize-none rounded-2xl bg-background"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Optional reason for the recovery action"
                    maxLength={300}
                  />
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                    This will debit the owner&apos;s escrow balance and then
                    redirect you to the system admin wallet after the refund succeeds.
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm leading-6 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  {detail.actions.ineligibleReason ||
                    "This transaction is not eligible for a system wallet refund."}
                </div>
              )}
            </DetailCard>

            <div className="flex flex-col-reverse gap-3 rounded-3xl border bg-background p-4 shadow-sm sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/sysadmin/revenue/transactions")}
                disabled={isRefunding}
              >
                Back to Transactions
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={handleRefundToSystemWallet}
                disabled={isRefunding || !detail.actions.canRefundToSystemWallet}
              >
                {isRefunding ? "Refunding..." : "Refund to System Wallet"}
              </Button>
            </div>
          </div>
        ) : null}
      </Main>
    </div>
  );
}
