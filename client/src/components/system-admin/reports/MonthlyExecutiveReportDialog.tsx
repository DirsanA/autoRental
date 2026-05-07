"use client";

import { useMemo, useState } from "react";
import { Download, FileDown, CalendarDays, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  fetchMonthlyExecutiveReport,
  monthlyExecutiveReportCsvUrl,
  monthlyExecutiveReportPdfUrl,
  type MonthlyExecutiveReport,
} from "@/lib/admin-reports-api";
import { buildAuthHeader } from "@/lib/auth-token";

function currentUtcMonth() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function monthLabel(month: number) {
  const d = new Date(Date.UTC(2020, month - 1, 1));
  return d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
}

function formatMoney(amount: number, currency = "ETB") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Number(amount || 0).toLocaleString()} ${currency}`;
  }
}

export function MonthlyExecutiveReportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const now = useMemo(() => currentUtcMonth(), []);
  const [year, setYear] = useState<number>(now.year);
  const [month, setMonth] = useState<number>(now.month);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<MonthlyExecutiveReport | null>(null);

  const years = useMemo(() => {
    const y = now.year;
    return [y - 2, y - 1, y, y + 1];
  }, [now.year]);

  const csvUrl = useMemo(() => monthlyExecutiveReportCsvUrl(year, month), [year, month]);
  const pdfUrl = useMemo(() => monthlyExecutiveReportPdfUrl(year, month), [year, month]);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    try {
      const report = await fetchMonthlyExecutiveReport(year, month);
      setPreview(report);
    } catch (cause) {
      setPreview(null);
      setError(cause instanceof Error ? cause.message : "Unable to load report preview");
    } finally {
      setLoading(false);
    }
  }

  function openCsvDownload() {
    // Must include auth for Bearer-token flows.
    // Use fetch+blob to preserve headers & allow cross-origin credentials.
    setLoading(true);
    setError(null);
    fetch(csvUrl, {
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("CSV export failed");
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `monthly-executive-report-${year}-${String(month).padStart(2, "0")}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "CSV export failed");
      })
      .finally(() => setLoading(false));
  }

  function downloadPdf() {
    setLoading(true);
    setError(null);
    fetch(pdfUrl, {
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("PDF export failed");
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `monthly-executive-report-${year}-${String(month).padStart(2, "0")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "PDF export failed");
      })
      .finally(() => setLoading(false));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-6 text-left border-b bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(135deg,#0f172a,#0b1220_55%,#0f172a)]">
          <DialogTitle className="text-white text-xl">Monthly Executive Report</DialogTitle>
          <DialogDescription className="text-slate-300">
            Generate a data-driven report for a specific month and year.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" /> Year
              </Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" /> Month
              </Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {monthLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={loadPreview} disabled={loading} className="h-11">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Preview
            </Button>
            <Button
              variant="secondary"
              onClick={openCsvDownload}
              disabled={loading}
              className="h-11"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={downloadPdf}
              disabled={loading}
              className="h-11"
            >
              <FileDown className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">
              {error}
            </div>
          ) : null}

          <Card className={cn("p-4", preview ? "border-slate-200" : "border-dashed")}> 
            {!preview ? (
              <div className="text-sm text-slate-600">Preview will appear here.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border bg-white p-3">
                  <div className="text-[11px] text-slate-500">Gross Revenue</div>
                  <div className="mt-1 font-bold text-slate-900">{formatMoney(preview.overview.grossRevenue)}</div>
                </div>
                <div className="rounded-xl border bg-white p-3">
                  <div className="text-[11px] text-slate-500">Users (New)</div>
                  <div className="mt-1 font-bold text-slate-900">{preview.users.newThisMonth.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border bg-white p-3">
                  <div className="text-[11px] text-slate-500">Companies (Pending)</div>
                  <div className="mt-1 font-bold text-slate-900">{preview.companies.pendingApproval.toLocaleString()}</div>
                </div>
              </div>
            )}
          </Card>

          <div className="text-xs text-slate-500">
            Notes: peer-host count uses `verificationLevel = PEER_HOST`. Revenue uses paid bookings created in the selected month.
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
