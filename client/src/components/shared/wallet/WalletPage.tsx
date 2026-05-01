"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  createPayoutRequest,
  fetchMyPayouts,
  fetchMyWallet,
  type Payout,
  type WalletOwnerType,
  type WalletSnapshot,
} from "@/lib/wallet-api";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function WalletAmountSkeleton() {
  return <Skeleton className="mt-2 h-8 w-36 bg-black/15 dark:bg-white/15" />;
}

function PayoutListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 p-3 border rounded-lg"
        >
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28 bg-black/15 dark:bg-white/15" />
              <Skeleton className="h-5 w-20 rounded-full bg-black/15 dark:bg-white/15" />
            </div>
            <Skeleton className="h-3 w-56 max-w-full bg-black/15 dark:bg-white/15" />
          </div>
          <Skeleton className="h-3 w-32 bg-black/15 dark:bg-white/15" />
        </div>
      ))}
    </div>
  );
}

const payoutStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  PROCESSING:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

export function WalletPage({
  title,
  ownerType,
}: {
  title: string;
  ownerType: WalletOwnerType;
}) {
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setError(null);
    try {
      const [walletResult, payoutResult] = await Promise.allSettled([
        fetchMyWallet({ ownerType }),
        fetchMyPayouts({ page: 1, limit: 20, ownerType }),
      ]);

      if (walletResult.status === "fulfilled") {
        setWallet(walletResult.value);
      } else {
        setWallet(null);
      }

      if (payoutResult.status === "fulfilled") {
        setPayouts(payoutResult.value.payouts || []);
      } else {
        setPayouts([]);
      }

      if (walletResult.status === "rejected") {
        throw walletResult.reason;
      }

      if (payoutResult.status === "rejected") {
        setError(
          payoutResult.reason instanceof Error
            ? payoutResult.reason.message
            : "Failed to load payout history",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const currency = wallet?.currency || "ETB";
  const available = wallet?.availableBalance || 0;
  const pending = wallet?.pendingBalance || 0;
  const canWithdraw = useMemo(() => available >= 500, [available]);

  async function onSubmitWithdraw() {
    setSubmitError(null);

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 500) {
      setSubmitError("Minimum withdrawal amount is 500 ETB.");
      return;
    }
    if (wallet && parsedAmount > wallet.availableBalance) {
      setSubmitError("Requested amount exceeds available balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPayoutRequest({
        amount: parsedAmount,
        payoutMethod: "CHAPA",
        ownerType,
      });
      
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setSubmitError("No checkout URL returned from Chapa");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Withdrawal request failed",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Main className="gap-6 p-6 md:p-8">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-2">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
            <p className="mt-1 text-muted-foreground">
              Track escrow funds, available balance, and request withdrawals.
            </p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40">
            <CardContent className="py-4 text-red-700 dark:text-red-300 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="gap-6 grid lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Balances</CardTitle>
            </CardHeader>
            <CardContent className="gap-4 grid sm:grid-cols-2">
              <div className="bg-card p-4 border rounded-lg">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                  Escrow (Pending)
                </div>
                <div className="mt-2 font-bold tabular-nums text-2xl">
                  {isLoading || !wallet ? (
                    <WalletAmountSkeleton />
                  ) : (
                    formatMoney(pending, currency)
                  )}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Funds locked until completion or admin release.
                </p>
              </div>

              <div className="bg-card p-4 border rounded-lg">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                  Available
                </div>
                <div className="mt-2 font-bold tabular-nums text-2xl">
                  {isLoading || !wallet ? (
                    <WalletAmountSkeleton />
                  ) : (
                    formatMoney(available, currency)
                  )}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Withdrawable balance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Withdraw via Chapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <div className="font-medium text-sm">Amount ({currency})</div>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1200 (Min. 500)"
                  inputMode="decimal"
                />
              </div>

              {submitError && (
                <div className="text-red-600 dark:text-red-400 text-xs">
                  {submitError}
                </div>
              )}

              <Button
                className="w-full"
                onClick={onSubmitWithdraw}
                disabled={isSubmitting || isLoading || !wallet || !canWithdraw}
              >
                {isSubmitting ? "Redirecting to Chapa..." : "Withdraw"}
              </Button>

              <p className="text-muted-foreground text-xs">
                You will be redirected to Chapa to process the withdrawal request.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Payout Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PayoutListSkeleton />
            ) : payouts.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No payout requests yet.
              </div>
            ) : (
              <div className="space-y-2">
                {payouts.map((payout) => {
                  const id = payout.id || payout._id || "";
                  const status = payout.status || "PENDING";
                  return (
                    <div
                      key={id}
                      className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 p-3 border rounded-lg"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium tabular-nums">
                            {formatMoney(payout.amount, payout.currency || currency)}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("border-0", payoutStatusStyles[status] || "")}
                          >
                            {status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-muted-foreground text-xs">
                          Requested: {formatDate(payout.createdAt)}{" "}
                          {payout.payoutMethod ? `• ${payout.payoutMethod}` : ""}
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Paid at: {formatDate(payout.paidAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </div>
  );
}
