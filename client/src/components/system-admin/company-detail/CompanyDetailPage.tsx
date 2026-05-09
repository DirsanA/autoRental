"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDetailViewTracking } from "@/hooks/use-action-badges";
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  CircleUserRound,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  FileText,
  IdCard,
  CreditCard,
  Download,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  approveAdminCompany,
  fetchAdminCompanyDetail,
  type AdminCompanyDetail,
  suspendAdminCompany,
  approvePendingCompany,
  rejectPendingCompany,
} from "@/lib/admin-companies-api";
import { CompanyFleetTab } from "./CompanyFleetTab";
import { WalletTab } from "../p2p-detail/EarningsTab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

function formatMoney(value: number | null) {
  if (typeof value !== "number") return "Not available";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not available";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CO"
  );
}

function normalizeExternalUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed", error);
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
}

/**
 * Live company detail page for system-admin moderation workflows.
 */
export default function CompanyDetailPage({
  companyId,
}: {
  companyId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // Mark company as viewed when detail page loads
  useDetailViewTracking("COMPANY", companyId);

  const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [docPreview, setDocPreview] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [rejectPendingOpen, setRejectPendingOpen] = useState(false);
  const [rejectPendingReason, setRejectPendingReason] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    fetchAdminCompanyDetail(companyId)
      .then((data) => {
        if (cancelled) return;
        setCompany(data);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof Error ? cause.message : "Failed to load company",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const handleApprove = async () => {
    if (!company) return;

    setBusy(true);

    try {
      const updated = await approveAdminCompany(company.id);
      setCompany((current) =>
        current ? { ...current, ...updated, rejectionReason: null } : current,
      );
      toast({
        title:
          company.statusValue === "SUSPENDED"
            ? "Company reactivated"
            : "Company approved",
        description: `${updated.name} is now active.`,
      });
    } catch (cause: unknown) {
      toast({
        title: "Company update failed",
        description:
          cause instanceof Error ? cause.message : "Failed to update company",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSuspend = async () => {
    if (!company) return;
    if (!suspendReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a suspension reason for the company.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);

    try {
      const updated = await suspendAdminCompany(
        company.id,
        suspendReason.trim(),
      );
      setCompany((current) =>
        current
          ? { ...current, ...updated, rejectionReason: suspendReason.trim() }
          : current,
      );
      toast({
        title: "Company suspended",
        description: `${updated.name} is now suspended.`,
      });
      setSuspendOpen(false);
      setSuspendReason("");
    } catch (cause: unknown) {
      toast({
        title: "Suspension failed",
        description:
          cause instanceof Error ? cause.message : "Failed to suspend company",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };
  // this handles
  const handleApprovePendingChanges = async () => {
    if (!company) return;

    <AlertDialog>
      <AlertDialogTrigger>Open</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleApprovePendingChanges}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
    setBusy(true);

    try {
      const updatedCompany = await approvePendingCompany(company.id);
      setCompany(updatedCompany);
      toast({
        title: "Changes approved",
        description: `${company.name}'s profile has been updated.`,
      });
    } catch (cause: unknown) {
      toast({
        title: "Approval failed",
        description:
          cause instanceof Error ? cause.message : "Failed to approve changes",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRejectPendingChanges = async () => {
    if (!company) return;
    if (!rejectPendingReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejecting the changes.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);

    try {
      const updatedCompany = await rejectPendingCompany(
        company.id,
        rejectPendingReason.trim(),
      );
      setCompany(updatedCompany);
      toast({
        title: "Changes rejected",
        description: `${company.name}'s changes have been rejected.`,
      });
      setRejectPendingOpen(false);
      setRejectPendingReason("");
    } catch (cause: unknown) {
      toast({
        title: "Rejection failed",
        description:
          cause instanceof Error ? cause.message : "Failed to reject changes",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  function isImageUrl(value: unknown): value is string {
    return (
      typeof value === "string" &&
      (value.startsWith("http") || value.startsWith("/")) &&
      /\.(jpg|jpeg|png|webp|gif)/i.test(value)
    );
  }

  function formatPendingValue(value: unknown): string | ReactNode {
    if (!value) return "Not provided";

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    // Image support
    if (isImageUrl(value)) {
      return (
        <img
          src={value as string}
          alt="pending"
          className="max-h-40 w-full rounded-md border object-contain bg-white"
        />
      );
    }

    if (typeof value === "object") {
      return Object.entries(value as Record<string, unknown>)
        .map(([key, val]) => (val ? `${formatLabel(key)}: ${val}` : null))
        .filter(Boolean)
        .join(" • ");
    }

    return String(value);
  }

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <Main className="overflow-y-auto p-6 md:p-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push("/sysadmin/companies")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Company Management
              </button>

              {company ? (
                <div className="flex flex-wrap items-center gap-2">
                  {company.statusValue !== "ACTIVE" ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setApproveOpen(true)}
                      disabled={busy}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {company.statusValue === "SUSPENDED"
                        ? "Reactivate"
                        : "Approve"}
                    </Button>
                  ) : null}
                  {company.statusValue !== "SUSPENDED" ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setSuspendOpen(true)}
                      disabled={busy}
                    >
                      <Ban className="h-4 w-4" />
                      Suspend
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {loading ? (
              <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading company...
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : company ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="fleet">Fleet</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Company Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-lg font-semibold">
                        {formatLabel(company.statusValue)}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Verification
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2 text-lg font-semibold">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        {company.isVerified ? "Verified" : "Not verified"}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Wallet Balance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-lg font-semibold">
                        {company.wallet
                          ? formatMoney(company.wallet.availableBalance)
                          : formatMoney(company.walletBalance)}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Auth Account
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-lg font-semibold">
                        {company.authAccount?.name || "Not linked"}
                      </CardContent>
                    </Card>
                  </div>

                  {company.pendingChanges && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader>
                        <CardTitle className="text-orange-800">
                          Pending Changes
                        </CardTitle>
                        <div className="text-sm text-orange-600">
                          Submitted on{" "}
                          {formatDateTime(company.pendingChangesRequestedAt)}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {Object.entries(company.pendingChanges).map(
                          ([key, value]) => {
                            const currentValue = (
                              company as Record<string, unknown>
                            )[key];

                            const formattedCurrent =
                              formatPendingValue(currentValue);
                            const formattedNew = formatPendingValue(value);

                            const isChanged =
                              JSON.stringify(currentValue) !==
                              JSON.stringify(value);

                            return (
                              <div
                                key={key}
                                className="grid gap-4 md:grid-cols-2"
                              >
                                {/* NEW VALUE */}
                                <div className="space-y-1">
                                  <div className="text-xs font-bold text-orange-800 uppercase tracking-tight">
                                    Pending {formatLabel(key)}
                                  </div>

                                  <div
                                    className={`text-sm p-3 rounded-lg ${
                                      isChanged
                                        ? "bg-green-100 text-green-900 border border-green-200"
                                        : "bg-orange-100/50 text-orange-800"
                                    }`}
                                  >
                                    {formattedNew}
                                  </div>
                                </div>

                                {/* CURRENT VALUE */}
                                <div className="space-y-1">
                                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                                    Current {formatLabel(key)}
                                  </div>

                                  <div
                                    className={`text-sm p-3 rounded-lg ${
                                      isChanged
                                        ? "bg-red-50 text-red-900 border border-red-100"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {formattedCurrent}
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovePendingChanges()}
                            disabled={busy}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve Changes
                          </Button>

                          <Button
                            variant="destructive"
                            className="gap-2"
                            onClick={() => setRejectPendingOpen(true)}
                            disabled={busy}
                          >
                            <Ban className="h-4 w-4" />
                            Reject Changes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 md:col-span-2">
                          <Avatar className="h-20 w-20 rounded-2xl border bg-muted shadow-sm">
                            <AvatarImage
                              src={company.logoUrl || undefined}
                              alt={`${company.name} logo`}
                              className="object-cover"
                            />
                            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">
                              {company.name ? (
                                <span className="text-xl font-semibold">
                                  {getInitials(company.name)}
                                </span>
                              ) : (
                                <Building2 className="h-8 w-8" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm text-muted-foreground">
                              Company logo
                            </div>
                            <div className="truncate text-xl font-semibold">
                              {company.name}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Name
                          </div>
                          <div className="font-medium">{company.name}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            TIN number
                          </div>
                          <div className="font-medium">
                            {company.tinNumber || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Contact email
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {company.contactEmail || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Contact phone
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {company.contactPhone || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Website
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {company.website?.trim() ? (
                              <a
                                href={
                                  normalizeExternalUrl(company.website) ||
                                  undefined
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-4 hover:text-primary"
                              >
                                {company.website.trim()}
                              </a>
                            ) : (
                              "Not provided"
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Address
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {company.address || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <div className="text-sm text-muted-foreground">
                            Bio
                          </div>
                          <div className="font-medium">
                            {company.bio || "No company bio on file."}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Auth Account Details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        {company.authAccount ? (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                                {company.authAccount.image ? (
                                  <img
                                    src={company.authAccount.image}
                                    alt="Auth user profile"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <CircleUserRound className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {company.authAccount.name ||
                                    "Unnamed auth user"}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {company.authAccount.email || "No email"}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="text-sm font-medium">
                                Uploaded documents
                              </div>
                              <div className="grid gap-3">
                                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <IdCard className="h-4 w-4 text-muted-foreground" />
                                    National ID (image)
                                  </div>
                                  {company.authAccount.idImageUrl ? (
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDocPreview({
                                            title: "National ID",
                                            url: company.authAccount!
                                              .idImageUrl!,
                                          })
                                        }
                                        className="text-sm underline underline-offset-4 hover:text-primary"
                                      >
                                        View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadFile(
                                            company.authAccount!.idImageUrl!,
                                            `national_id_${company.name.replace(/\s+/g, "_")}`,
                                          )
                                        }
                                        className="text-muted-foreground hover:text-primary"
                                        title="Download"
                                      >
                                        <Download className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      Not found
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    Driver license (verification)
                                  </div>
                                  {company.authDocuments?.verifications?.some(
                                    (doc) =>
                                      doc.documentType === "DRIVER_LICENSE",
                                  ) ? (
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const url =
                                            company.authDocuments!.verifications.find(
                                              (doc) =>
                                                doc.documentType ===
                                                "DRIVER_LICENSE",
                                            )!.documentFrontUrl;
                                          setDocPreview({
                                            title: "Driver license",
                                            url,
                                          });
                                        }}
                                        className="text-sm underline underline-offset-4 hover:text-primary"
                                      >
                                        View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const url =
                                            company.authDocuments!.verifications.find(
                                              (doc) =>
                                                doc.documentType ===
                                                "DRIVER_LICENSE",
                                            )!.documentFrontUrl;
                                          downloadFile(
                                            url,
                                            `driver_license_${company.name.replace(/\s+/g, "_")}`,
                                          );
                                        }}
                                        className="text-muted-foreground hover:text-primary"
                                        title="Download"
                                      >
                                        <Download className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      Not found
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="p-6 text-sm text-muted-foreground border border-dashed rounded-xl text-center">
                            No auth account is linked to this company.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Lifecycle And Compliance</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Created at
                          </div>
                          <div className="font-medium">
                            {formatDateTime(company.createdAt)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Updated at
                          </div>
                          <div className="font-medium">
                            {formatDateTime(company.updatedAt)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Verified at
                          </div>
                          <div className="font-medium">
                            {formatDateTime(company.verifiedAt)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Moderation markers
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="font-normal">
                              {company.isVerified
                                ? "Verified"
                                : "Pending verification"}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              {formatLabel(company.authAccount?.status)}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              {formatLabel(company.authAccount?.accountType)}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Suspension or rejection reason
                          </div>
                          <div className="font-medium text-red-600">
                            {company.rejectionReason || "No reason recorded"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          License Document
                        </CardTitle>
                        {company.licenseDocumentUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() =>
                              downloadFile(
                                company.licenseDocumentUrl!,
                                `company_license_${company.name.replace(/\s+/g, "_")}`,
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent>
                        {company.licenseDocumentUrl ? (
                          <div className="rounded-xl overflow-hidden border">
                            {company.licenseDocumentUrl
                              .toLowerCase()
                              .endsWith(".pdf") ? (
                              <embed
                                src={company.licenseDocumentUrl}
                                className="w-full h-[400px]"
                                type="application/pdf"
                              />
                            ) : (
                              <img
                                src={company.licenseDocumentUrl}
                                alt="Company License"
                                className="w-full h-auto object-contain"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                            No license document uploaded
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IdCard className="h-5 w-5 text-primary" />
                          Auth User Documents
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <IdCard className="h-4 w-4 text-muted-foreground" />
                                ID document
                              </div>
                              {company.authAccount?.idImageUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 gap-1.5 text-xs"
                                  onClick={() =>
                                    downloadFile(
                                      company.authAccount!.idImageUrl!,
                                      `id_document_${company.name.replace(/\s+/g, "_")}`,
                                    )
                                  }
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </Button>
                              )}
                            </div>
                            {company.authAccount?.idImageUrl ? (
                              <div className="rounded-xl overflow-hidden border">
                                {company.authAccount.idImageUrl
                                  .toLowerCase()
                                  .endsWith(".pdf") ? (
                                  <embed
                                    src={company.authAccount.idImageUrl}
                                    className="w-full h-[360px]"
                                    type="application/pdf"
                                  />
                                ) : (
                                  <img
                                    src={company.authAccount.idImageUrl}
                                    alt="Auth user ID document"
                                    className="w-full h-auto object-contain"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="p-6 text-center text-muted-foreground border border-dashed rounded-xl">
                                No ID document found
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Driver license (verification)
                              </div>
                              {company.authDocuments?.verifications?.find(
                                (doc) => doc.documentType === "DRIVER_LICENSE",
                              )?.documentFrontUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 gap-1.5 text-xs"
                                  onClick={() => {
                                    const url =
                                      company.authDocuments!.verifications.find(
                                        (doc) =>
                                          doc.documentType === "DRIVER_LICENSE",
                                      )!.documentFrontUrl;
                                    downloadFile(
                                      url,
                                      `driver_license_${company.name.replace(/\s+/g, "_")}`,
                                    );
                                  }}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </Button>
                              )}
                            </div>
                            {company.authDocuments?.verifications?.find(
                              (doc) => doc.documentType === "DRIVER_LICENSE",
                            )?.documentFrontUrl ? (
                              <div className="rounded-xl overflow-hidden border">
                                {company.authDocuments.verifications
                                  .find(
                                    (doc) =>
                                      doc.documentType === "DRIVER_LICENSE",
                                  )!
                                  .documentFrontUrl.toLowerCase()
                                  .endsWith(".pdf") ? (
                                  <embed
                                    src={
                                      company.authDocuments.verifications.find(
                                        (doc) =>
                                          doc.documentType === "DRIVER_LICENSE",
                                      )!.documentFrontUrl
                                    }
                                    className="w-full h-[360px]"
                                    type="application/pdf"
                                  />
                                ) : (
                                  <img
                                    src={
                                      company.authDocuments.verifications.find(
                                        (doc) =>
                                          doc.documentType === "DRIVER_LICENSE",
                                      )!.documentFrontUrl
                                    }
                                    alt="Driver license document"
                                    className="w-full h-auto object-contain"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="p-6 text-center text-muted-foreground border border-dashed rounded-xl">
                                No driver license verification found
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* FLEET TAB */}
                <TabsContent value="fleet">
                  <CompanyFleetTab companyId={company.id} />
                </TabsContent>

                {/* WALLET TAB */}
                <TabsContent value="wallet" className="space-y-6">
                  <WalletTab wallet={company.wallet} ledger={company.ledger} />
                </TabsContent>
              </Tabs>
            ) : null}
          </div>
        </Main>
      </div>

      <Dialog open={approveOpen} onOpenChange={(open) => setApproveOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {company?.statusValue === "SUSPENDED"
                ? "Reactivate company"
                : "Approve company"}
            </DialogTitle>
            <DialogDescription>
              {company?.statusValue === "SUSPENDED"
                ? `This will restore access for ${company?.name}.`
                : `This will approve ${company?.name} and activate their company account.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleApprove();
                setApproveOpen(false);
              }}
              disabled={busy}
              className="gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {company?.statusValue === "SUSPENDED" ? "Reactivate" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectPendingOpen}
        onOpenChange={(open) => setRejectPendingOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Pending Changes</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the changes requested by{" "}
              {company?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="rejectReason">Rejection Reason</Label>
            <Textarea
              id="rejectReason"
              placeholder="e.g. Invalid document uploaded, missing information..."
              value={rejectPendingReason}
              onChange={(e) => setRejectPendingReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectPendingOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectPendingChanges}
              disabled={busy || !rejectPendingReason.trim()}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reject Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!docPreview}
        onOpenChange={(open) => {
          if (!open) setDocPreview(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{docPreview?.title || "Document"}</DialogTitle>
            <DialogDescription>Previewing uploaded document.</DialogDescription>
          </DialogHeader>

          {docPreview?.url ? (
            <div className="rounded-xl overflow-hidden border">
              {docPreview.url.toLowerCase().endsWith(".pdf") ? (
                <embed
                  src={docPreview.url}
                  className="w-full h-[70vh]"
                  type="application/pdf"
                />
              ) : (
                <img
                  src={docPreview.url}
                  alt={docPreview.title}
                  className="w-full h-auto object-contain"
                />
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
              Document not available
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            {docPreview?.url && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  downloadFile(
                    docPreview.url,
                    `${docPreview.title.toLowerCase().replace(/\s+/g, "_")}_${company?.name.replace(/\s+/g, "_")}`,
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Original
              </Button>
            )}
            <Button variant="outline" onClick={() => setDocPreview(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={suspendOpen}
        onOpenChange={(open) => {
          setSuspendOpen(open);
          if (!open) {
            setSuspendReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Company</DialogTitle>
            <DialogDescription>
              Provide the moderation reason for suspending this company.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="company-suspend-reason">Suspension reason</Label>
            <Textarea
              id="company-suspend-reason"
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
              placeholder="Explain why this company is being suspended..."
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={busy}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Suspend company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
