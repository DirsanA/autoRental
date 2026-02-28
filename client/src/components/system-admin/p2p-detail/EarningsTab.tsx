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
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2 } from "lucide-react";
import type { EarningTransaction } from "./types";
import { cn } from "@/lib/utils";

export function EarningsTab({ earnings }: { earnings: EarningTransaction[] }) {
  const totalPaid = earnings
    .filter((e) => e.payoutStatus === "paid")
    .reduce((s, e) => s + e.amount, 0);
  const totalPending = earnings
    .filter((e) => e.payoutStatus === "processing")
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Paid
              </p>
              <h3 className="text-2xl font-bold">
                ${totalPaid.toLocaleString()}
              </h3>
            </div>
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-yellow-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Processing
              </p>
              <h3 className="text-2xl font-bold">
                ${totalPending.toLocaleString()}
              </h3>
            </div>
            <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <CardHeader className="py-4 border-b bg-muted/20">
          <CardTitle className="text-base font-semibold">
            Payout History
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/50 hidden sm:table-header-group">
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earnings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  No earnings data available yet.
                </TableCell>
              </TableRow>
            ) : (
              earnings.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/50 group">
                  <TableCell className="font-medium text-sm whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {e.listingName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-normal border-0 capitalize",
                        e.payoutStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : e.payoutStatus === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800",
                      )}
                    >
                      {e.payoutStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-sm">
                    ${e.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden group-hover:inline-flex h-8 px-2 text-xs"
                    >
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
