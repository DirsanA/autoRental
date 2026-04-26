"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getMyWallet,
  listMyWalletTransactions,
  requestPayout,
  type WalletTransaction,
} from "@/lib/wallet-api";
import { useToast } from "@/hooks/use-toast";

function formatMoney(amount: number, currency = "ETB") {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function WalletPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Awaited<ReturnType<typeof getMyWallet>> | null>(null);
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [amountStr, setAmountStr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currency = wallet?.currency || "ETB";

  async function reload() {
    setLoading(true);
    try {
      const [w, t] = await Promise.all([getMyWallet(), listMyWalletTransactions()]);
      setWallet(w);
      setTxns(t);
    } catch (e) {
      toast({
        title: "Wallet error",
        description: e instanceof Error ? e.message : "Failed to load wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payoutAmount = useMemo(() => Number(amountStr), [amountStr]);

  async function onRequestPayout() {
    if (!Number.isFinite(payoutAmount) || payoutAmount <= 0) {
      toast({ title: "Invalid amount", description: "Enter a positive number", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await requestPayout(payoutAmount);
      toast({ title: "Payout requested", description: "Your request was submitted for approval." });
      setAmountStr("");
      await reload();
    } catch (e) {
      toast({
        title: "Payout request failed",
        description: e instanceof Error ? e.message : "Could not request payout",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Wallet</h2>
        <p className="text-slate-500">Escrow earnings become available after booking completion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : formatMoney(wallet?.availableBalance ?? 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending (escrow)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : formatMoney(wallet?.pendingBalance ?? 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Currency</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{currency}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="w-full md:w-64">
            <div className="text-sm text-muted-foreground mb-2">Amount</div>
            <Input
              inputMode="decimal"
              placeholder="e.g. 500"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
            />
          </div>
          <Button onClick={onRequestPayout} disabled={submitting || loading}>
            {submitting ? "Submitting..." : "Request payout"}
          </Button>
          <Button variant="outline" onClick={reload} disabled={loading || submitting}>
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {txns.length === 0 ? (
            <div className="text-sm text-muted-foreground">No wallet transactions yet.</div>
          ) : (
            <div className="space-y-2">
              {txns.slice(0, 50).map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.description || t.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}{" "}
                      {t.bookingId ? `• booking ${t.bookingId}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t.type}</Badge>
                    <Badge variant="secondary">{t.status}</Badge>
                    <div className="font-semibold">{formatMoney(t.amount, t.currency)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

