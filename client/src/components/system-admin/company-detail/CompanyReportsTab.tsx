"use client";

import { useEffect, useState } from "react";
import { fetchCompanyReports } from "@/lib/admin-companies-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, AlertTriangle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function CompanyReportsTab({ companyId }: { companyId: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCompanyReports(companyId)
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  if (loading) return <div className="p-6 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading reports...</div>;
  if (error) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Reports</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
  if (reports.length === 0) return <div className="p-6 text-sm text-muted-foreground">No reports filed against this company.</div>;

  return (
    <div className="grid gap-4">
      {reports.map((report) => {
        const id = report._id || report.id;
        
        return (
          <Card key={id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold text-sm">{report.type?.replace(/_/g, " ")}</span>
                    <Badge variant={report.status === "OPEN" ? "destructive" : report.status === "RESOLVED" ? "default" : "secondary"}>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </p>
                </div>
                
                <Button variant="outline" size="sm" asChild className="shrink-0 gap-2">
                  <Link href={`/sysadmin/reports/${id}`}>
                    Moderate Report <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
