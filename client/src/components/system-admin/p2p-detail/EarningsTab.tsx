"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Banknote,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarned: number;
  currency: string;
}

interface LedgerEntry {
  id: string;
  entryType: string;
  amount: number;
  balanceField: string;
  before: number;
  after: number;
  createdAt: string;
  metadata?: any;
}

export function WalletTab({ 
  wallet, 
  ledger 
}: { 
  wallet: WalletData | null;
  ledger: LedgerEntry[];
}) {
  const formatMoney = (amount: number, currency: string = "ETB") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "ETB",
    }).format(amount);
  };

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case "ESCROW_HOLD":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "ESCROW_RELEASE":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "PAYOUT_DEBIT":
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
      case "REFUND_DEBIT":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Banknote className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEntryTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getDescription = (entry: LedgerEntry) => {
    const meta = entry.metadata || {};
    switch (entry.entryType) {
      case "ESCROW_HOLD":
        return meta.listingName ? `Hold: ${meta.listingName}` : "Booking payment held";
      case "ESCROW_RELEASE":
        return meta.listingName ? `Earned: ${meta.listingName}` : "Booking earnings released";
      case "PAYOUT_DEBIT":
        return meta.bankName ? `Withdrawal: ${meta.bankName}` : "Funds withdrawn to bank";
      case "REFUND_DEBIT":
        return "Refunded to customer";
      case "COMMISSION_DEBIT":
        return "Platform fee deduction";
      default:
        return getEntryTypeLabel(entry.entryType);
    }
  };

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border">
        <Wallet className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-lg font-semibold text-muted-foreground">No Wallet Found</h3>
        <p className="text-sm text-muted-foreground/60 max-w-xs text-center">
          This host hasn't performed any financial transactions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="shadow-sm border-t-4 border-t-primary rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Available Balance
                </p>
                <h3 className="text-3xl font-black text-foreground">
                  {formatMoney(wallet.availableBalance, wallet.currency)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-4 text-[10px] uppercase font-bold text-muted-foreground/60">
              Immediate Withdrawal Available
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-blue-500 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Pending (Escrow)
                </p>
                <h3 className="text-3xl font-black text-foreground">
                  {formatMoney(wallet.pendingBalance, wallet.currency)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="mt-4 text-[10px] uppercase font-bold text-muted-foreground/60">
              Awaiting Booking Completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <History className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Recent Transactions</h2>
          </div>
          <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
            Full Ledger
          </Badge>
        </div>

        <Card className="shadow-sm border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-bold text-foreground h-12">Date</TableHead>
                <TableHead className="font-bold text-foreground h-12">Activity</TableHead>
                <TableHead className="font-bold text-foreground h-12">Wallet</TableHead>
                <TableHead className="text-right font-bold text-foreground h-12">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground font-medium"
                  >
                    No transaction history found.
                  </TableCell>
                </TableRow>
              ) : (
                ledger.map((entry) => {
                  const isDebit = ["PAYOUT_DEBIT", "REFUND_DEBIT", "COMMISSION_DEBIT"].includes(entry.entryType);
                  return (
                    <TableRow key={entry.id} className="hover:bg-muted/30 border-b last:border-0">
                      <TableCell className="font-medium whitespace-nowrap text-sm">
                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 p-1.5 bg-background rounded-full border shadow-sm">
                            {getEntryTypeIcon(entry.entryType)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm truncate">
                              {getDescription(entry)}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">
                              {getEntryTypeLabel(entry.entryType)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge 
                          variant="secondary" 
                          className={cn(
                            "rounded-md px-1.5 py-0 text-[10px] font-bold uppercase",
                            entry.balanceField === "pendingBalance" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-green-100 text-green-700"
                          )}
                        >
                          {entry.balanceField.replace("Balance", "")}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-bold tabular-nums text-sm",
                        isDebit ? "text-red-600" : "text-green-600"
                      )}>
                        {isDebit ? "-" : "+"}{formatMoney(entry.amount, wallet.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
