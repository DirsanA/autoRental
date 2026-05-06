"use client";

import { useEffect, useState } from "react";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Shield,
  Info,
  ExternalLink,
  Monitor,
  Clock,
  Bug,
  UserX,
  Car,
  Building2,
  HelpCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Phone,
  Mail,
  Hash,
  Globe,
  Maximize2,
  Calendar,
  Gavel,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  evidenceUrls: string[];
  reportedBy: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  subjectId?: any;
  subjectModel?: string;
  metadata?: {
    userAgent?: string;
    url?: string;
    screenSize?: string;
    timestamp?: string;
  };
  internalNotes: {
    authorId: string;
    content: string;
    createdAt: string;
  }[];
  adminResolution?: {
    resolutionNotes: string;
    actionTaken: string;
    resolvedAt: string;
  };
  createdAt: string;
}

// ─── Type helpers ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  SYSTEM_GLITCH: { icon: Bug, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
  USER_BEHAVIOR: { icon: UserX, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  VEHICLE_ISSUE: { icon: Car, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  COMPANY_ISSUE: { icon: Building2, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
  OTHER: { icon: HelpCircle, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" },
};

function typeLabel(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Status & Priority ─────────────────────────────────────────────────────────
function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const classes: Record<string, string> = {
    OPEN: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    CLOSED: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold uppercase",
        large ? "text-xs px-3 py-1" : "text-[10px]",
        classes[status]
      )}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const classes: Record<string, string> = {
    CRITICAL: "border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400",
    HIGH: "border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400",
    MEDIUM: "border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400",
    LOW: "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase", classes[priority])}>
      {priority}
    </Badge>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className={cn("text-sm", mono && "font-mono text-xs")}>{value || "N/A"}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ReportDetailPage({ id }: { id: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("NONE");
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();
  const apiBaseUrl = resolveApiBaseUrl();

  const fetchReport = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/reports/admin/${id}`, {
        headers: buildAuthHeader(),
      });
      const result = await response.json();
      if (response.ok) {
        setReport(result.data);
        setNewStatus(result.data.status);
        if (result.data.adminResolution) {
          setResolutionNotes(result.data.adminResolution.resolutionNotes);
          setActionTaken(result.data.adminResolution.actionTaken);
        }
      }
    } catch (error) {
      console.error("Failed to fetch report detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${apiBaseUrl}/reports/admin/${id}/action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeader(),
        },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes,
          actionTaken,
        }),
      });

      if (response.ok) {
        toast({
          title: "Report updated",
          description: "Status and resolution have been saved.",
        });
        fetchReport();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Main>
        </div>
      </div>
    );
  }

  // Not found
  if (!report) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="items-center justify-center gap-3">
            <AlertTriangle className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-lg font-semibold">Report not found</p>
            <Button variant="outline" asChild>
              <Link href="/sysadmin/reports">Back to Reports</Link>
            </Button>
          </Main>
        </div>
      </div>
    );
  }

  const typeConf = TYPE_CONFIG[report.type] || TYPE_CONFIG.OTHER;
  const TypeIcon = typeConf.icon;

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* Back + Header */}
          <div className="flex flex-col gap-4">
            <Button variant="ghost" size="sm" className="w-fit gap-2 text-muted-foreground" asChild>
              <Link href="/sysadmin/reports">
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Link>
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", typeConf.bg)}>
                  <TypeIcon className={cn("h-5 w-5", typeConf.color)} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{typeLabel(report.type)}</h1>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Reported {format(new Date(report.createdAt), "PPP 'at' p")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={report.priority} />
                <StatusBadge status={report.status} large />
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ─── Left Column ─────────────────────────────────────────── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Description Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Issue Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                    {report.description}
                  </div>
                </CardContent>
              </Card>

              {/* Evidence Gallery */}
              {report.evidenceUrls.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Evidence
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {report.evidenceUrls.length} attachment{report.evidenceUrls.length > 1 ? "s" : ""}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {report.evidenceUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-video overflow-hidden rounded-xl border bg-muted/20 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary/30"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${i + 1}`}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <ExternalLink className="h-5 w-5 text-white" />
                          </div>
                          <span className="absolute bottom-1.5 left-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                            {i + 1}/{report.evidenceUrls.length}
                          </span>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Context */}
              {report.metadata && (
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Monitor className="h-4 w-4 text-primary" />
                      Technical Context
                    </CardTitle>
                    <CardDescription>
                      Automatically captured from the reporter&apos;s browser session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      <InfoRow icon={Globe} label="Browser / OS" value={report.metadata.userAgent || ""} />
                      <InfoRow icon={Maximize2} label="Screen Size" value={report.metadata.screenSize || ""} />
                      <div className="sm:col-span-2">
                        <div className="flex items-start gap-2.5 py-1.5">
                          <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-muted-foreground">Page URL</p>
                            <a
                              href={report.metadata.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-sm text-primary hover:underline"
                            >
                              {report.metadata.url}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Resolution */}
              <Card
                className={cn(
                  "transition-colors",
                  report.status === "RESOLVED" && "border-emerald-200 dark:border-emerald-900"
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Gavel className="h-4 w-4 text-primary" />
                    Admin Resolution
                  </CardTitle>
                  <CardDescription>
                    Update the report status and document the action taken
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Action Taken
                      </Label>
                      <Select value={actionTaken} onValueChange={setActionTaken}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">No Action</SelectItem>
                          <SelectItem value="WARNING">Issue Warning</SelectItem>
                          <SelectItem value="SUSPENSION">User Suspension</SelectItem>
                          <SelectItem value="BAN">Permanent Ban</SelectItem>
                          <SelectItem value="BUG_FIXED">Bug / Glitch Fixed</SelectItem>
                          <SelectItem value="REFUND">Refund Issued</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Resolution Notes
                      <span className="ml-1 text-[10px] font-normal normal-case text-muted-foreground/60">
                        (visible to the reporter)
                      </span>
                    </Label>
                    <Textarea
                      placeholder="Explain how the issue was investigated and resolved..."
                      className="min-h-[100px] resize-none rounded-xl bg-muted/20 transition-colors focus:bg-background"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleUpdateStatus}
                    className="w-full gap-2 rounded-xl font-semibold shadow-sm"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Resolution
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ─── Right Column ────────────────────────────────────────── */}
            <div className="space-y-5">
              {/* Reporter Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reporter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{report.reportedBy.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{report.reportedBy.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <InfoRow icon={Hash} label="User ID" value={report.reportedBy.id || (report.reportedBy as any)._id?.toString() || "N/A"} mono />
                    <InfoRow icon={Phone} label="Phone" value={report.reportedBy.phoneNumber} />
                  </div>

                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/sysadmin/users/${report.reportedBy.id || (report.reportedBy as any)._id}`}>View Full Profile</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Subject Card */}
              {report.subjectId && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reported Subject
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow
                      icon={report.subjectModel === "Vehicle" ? Car : report.subjectModel === "Company" ? Building2 : User}
                      label="Type"
                      value={report.subjectModel || "Unknown"}
                    />
                    <InfoRow
                      icon={Hash}
                      label="Subject ID"
                      value={report.subjectId._id || report.subjectId}
                      mono
                    />
                    <Button variant="outline" size="sm" className="w-full">
                      Inspect Subject
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <div className="relative border-l-2 border-border pl-4">
                    <div className="relative pb-4">
                      <div className="absolute -left-[1.3rem] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-background" />
                      <p className="text-xs font-semibold">Report Submitted</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(report.createdAt), "PPP 'at' p")}
                      </p>
                    </div>

                    {report.status === "UNDER_REVIEW" && (
                      <div className="relative pb-4">
                        <div className="absolute -left-[1.3rem] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-amber-500 bg-background" />
                        <p className="text-xs font-semibold">Under Review</p>
                        <p className="text-[11px] text-muted-foreground">Currently being reviewed</p>
                      </div>
                    )}

                    {report.adminResolution?.resolvedAt && (
                      <div className="relative pb-4">
                        <div className="absolute -left-[1.3rem] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-background" />
                        <p className="text-xs font-semibold">Resolved</p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(report.adminResolution.resolvedAt), "PPP 'at' p")}
                        </p>
                      </div>
                    )}

                    {(report.status === "OPEN" || report.status === "UNDER_REVIEW") && (
                      <div className="relative">
                        <div className="absolute -left-[1.3rem] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-dashed border-muted-foreground/40 bg-background" />
                        <p className="text-xs text-muted-foreground/60">Awaiting resolution…</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Tip */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
                  <Info className="h-3.5 w-3.5" />
                  Admin Tip
                </h4>
                <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-400">
                  {report.type === "SYSTEM_GLITCH"
                    ? "Check the Technical Context panel above to identify the exact browser and URL where this issue happened."
                    : "Review the reporter's profile history for any prior complaints or patterns before taking action."}
                </p>
              </div>
            </div>
          </div>
        </Main>
      </div>
    </div>
  );
}
