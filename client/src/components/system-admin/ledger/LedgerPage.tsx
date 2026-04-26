"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  approvePayout,
  getPlatformLedger,
  listPayoutRequests,
  type PayoutRequest,
} from "@/lib/admin-wallet-api";

function formatMoney(amount: number, currency = "ETB") {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function LedgerPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ledger, setLedger] = useState<Awaited<ReturnType<typeof getPlatformLedger>> | null>(null);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [l, r] = await Promise.all([
        getPlatformLedger("ETB"),
        listPayoutRequests("PENDING"),
      ]);
      setLedger(l || null);
      setRequests(r);
    } catch (e) {
      toast({
        title: "Admin ledger error",
        description: e instanceof Error ? e.message : "Failed to load admin ledger",
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

  async function onApprove(id: string) {
    setApprovingId(id);
    try {
      await approvePayout(id);
      toast({ title: "Payout approved" });
      await reload();
    } catch (e) {
      toast({
        title: "Approve failed",
        description: e instanceof Error ? e.message : "Could not approve payout",
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  }

  const currency = ledger?.currency || "ETB";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Platform Ledger</h2>
          <p className="text-slate-500">Commission, collections, and payouts (no admin wallet).</p>
        </div>
        <Button variant="outline" onClick={reload} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total collected</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : formatMoney(ledger?.totalCollected ?? 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total commission</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : formatMoney(ledger?.totalCommission ?? 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total paid out</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : formatMoney(ledger?.totalPaidOut ?? 0, currency)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout requests (pending)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {requests.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending payout requests.</div>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-lg p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {r.ownerType} {r.ownerId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.requestedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.status}</Badge>
                    <div className="font-semibold">{formatMoney(r.amount, r.currency)}</div>
                    <Button
                      onClick={() => onApprove(r.id)}
                      disabled={approvingId === r.id}
                    >
                      {approvingId === r.id ? "Approving..." : "Approve"}
                    </Button>
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

