"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      const [walletSnapshot, payoutList] = await Promise.all([
        fetchMyWallet({ ownerType }),
        fetchMyPayouts({ page: 1, limit: 20, ownerType }),
      ]);
      setWallet(walletSnapshot);
      setPayouts(payoutList.payouts || []);
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
      <Header />
      <Main className="gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">
              Track escrow funds, available balance, and request withdrawals.
            </p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
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

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Balances</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Escrow (Pending)
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums">
                  {isLoading || !wallet
                    ? "—"
                    : formatMoney(pending, currency)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Funds locked until completion or admin release.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Available
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums">
                  {isLoading || !wallet
                    ? "—"
                    : formatMoney(available, currency)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
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
                <div className="text-sm font-medium">Amount ({currency})</div>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1200 (Min. 500)"
                  inputMode="decimal"
                />
              </div>

              {submitError && (
                <div className="text-xs text-red-600 dark:text-red-400">
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

              <p className="text-xs text-muted-foreground">
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
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : payouts.length === 0 ? (
              <div className="text-sm text-muted-foreground">
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
                      className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
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
                        <div className="mt-1 text-xs text-muted-foreground">
                          Requested: {formatDate(payout.createdAt)}{" "}
                          {payout.payoutMethod ? `• ${payout.payoutMethod}` : ""}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
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
