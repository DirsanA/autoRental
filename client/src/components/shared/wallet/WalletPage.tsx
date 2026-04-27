"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  createPayoutRequest,
  fetchMyPayouts,
  fetchMyWallet,
  type Payout,
  type PayoutMethod,
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

  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayoutMethod>("BANK_TRANSFER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

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
  const canWithdraw = useMemo(() => available > 0, [available]);

  async function onSubmitWithdraw() {
    setSubmitError(null);
    setSubmitSuccess(null);

    const parsedAmount = Number(amount);
    if (!bookingId.trim()) {
      setSubmitError("Booking ID is required for withdraw requests.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSubmitError("Enter a valid withdraw amount.");
      return;
    }
    if (wallet && parsedAmount > wallet.availableBalance) {
      setSubmitError("Requested amount exceeds available balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPayoutRequest({
        bookingId: bookingId.trim(),
        amount: parsedAmount,
        payoutMethod: method,
        ownerType,
      });
      setSubmitSuccess("Withdraw request submitted.");
      setAmount("");
      setBookingId("");
      await refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create payout request",
      );
    } finally {
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
              <CardTitle className="text-base">Withdraw</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Booking ID</div>
                <Input
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="e.g. 6812f... (booking mongo id)"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Amount ({currency})</div>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1200"
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Method</div>
                <Select value={method} onValueChange={(v) => setMethod(v as PayoutMethod)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="TELEBIRR">Telebirr</SelectItem>
                    <SelectItem value="CHAPA">Chapa</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {submitError && (
                <div className="text-xs text-red-600 dark:text-red-400">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="text-xs text-emerald-700 dark:text-emerald-400">
                  {submitSuccess}
                </div>
              )}

              <Button
                className="w-full"
                onClick={onSubmitWithdraw}
                disabled={isSubmitting || isLoading || !wallet || !canWithdraw}
              >
                {isSubmitting ? "Submitting..." : "Request withdraw"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Withdraw requests will be reviewed by admins.
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

