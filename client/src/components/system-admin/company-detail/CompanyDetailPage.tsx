"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  ArrowLeft,
  Ban,
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
} from "lucide-react";
import {
  approveAdminCompany,
  fetchAdminCompanyDetail,
  type AdminCompanyDetail,
  suspendAdminCompany,
} from "@/lib/admin-companies-api";
import { CompanyFleetTab } from "./CompanyFleetTab";

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

function normalizeExternalUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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
      const updated = await suspendAdminCompany(company.id, suspendReason.trim());
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
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
              </div>
            ) : company ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="fleet">Fleet</TabsTrigger>
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
                        {formatMoney(company.walletBalance)}
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

                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Name</div>
                          <div className="font-medium">{company.name}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">TIN number</div>
                          <div className="font-medium">
                            {company.tinNumber || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Contact email</div>
                          <div className="flex items-center gap-2 font-medium">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {company.contactEmail || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Contact phone</div>
                          <div className="flex items-center gap-2 font-medium">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {company.contactPhone || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Website</div>
                          <div className="flex items-center gap-2 font-medium">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {company.website?.trim() ? (
                              <a
                                href={normalizeExternalUrl(company.website) || undefined}
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
                          <div className="text-sm text-muted-foreground">Address</div>
                          <div className="flex items-center gap-2 font-medium">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {company.address || "Not provided"}
                          </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <div className="text-sm text-muted-foreground">Bio</div>
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
                                  {company.authAccount.name || "Unnamed auth user"}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {company.authAccount.email || "No email"}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="text-sm font-medium">Uploaded documents</div>
                              <div className="grid gap-3">
                                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <IdCard className="h-4 w-4 text-muted-foreground" />
                                    National ID (image)
                                  </div>
                                  {company.authAccount.idImageUrl ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDocPreview({
                                          title: "National ID",
                                          url: company.authAccount!.idImageUrl!,
                                        })
                                      }
                                      className="text-sm underline underline-offset-4 hover:text-primary"
                                    >
                                      View
                                    </button>
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
                                    (doc) => doc.documentType === "DRIVER_LICENSE",
                                  ) ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const url =
                                          company.authDocuments!.verifications.find(
                                            (doc) =>
                                              doc.documentType === "DRIVER_LICENSE",
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
                          <div className="text-sm text-muted-foreground">Created at</div>
                          <div className="font-medium">
                            {formatDateTime(company.createdAt)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Updated at</div>
                          <div className="font-medium">
                            {formatDateTime(company.updatedAt)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Verified at</div>
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
                              {company.isVerified ? "Verified" : "Pending verification"}
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
                      </CardHeader>
                      <CardContent>
                        {company.licenseDocumentUrl ? (
                          <div className="rounded-xl overflow-hidden border">
                            {company.licenseDocumentUrl.toLowerCase().endsWith('.pdf') ? (
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
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <IdCard className="h-4 w-4 text-muted-foreground" />
                              ID document
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
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              Driver license (verification)
                            </div>
                            {company.authDocuments?.verifications?.find(
                              (doc) => doc.documentType === "DRIVER_LICENSE",
                            )?.documentFrontUrl ? (
                              <div className="rounded-xl overflow-hidden border">
                                {company.authDocuments.verifications
                                  .find((doc) => doc.documentType === "DRIVER_LICENSE")!
                                  .documentFrontUrl.toLowerCase()
                                  .endsWith(".pdf") ? (
                                  <embed
                                    src={
                                      company.authDocuments.verifications.find(
                                        (doc) => doc.documentType === "DRIVER_LICENSE",
                                      )!.documentFrontUrl
                                    }
                                    className="w-full h-[360px]"
                                    type="application/pdf"
                                  />
                                ) : (
                                  <img
                                    src={
                                      company.authDocuments.verifications.find(
                                        (doc) => doc.documentType === "DRIVER_LICENSE",
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
              </Tabs>
            ) : null}
          </div>
        </Main>
      </div>

      <Dialog
        open={approveOpen}
        onOpenChange={(open) => setApproveOpen(open)}
      >
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
        open={!!docPreview}
        onOpenChange={(open) => {
          if (!open) setDocPreview(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{docPreview?.title || "Document"}</DialogTitle>
            <DialogDescription>
              Previewing uploaded document.
            </DialogDescription>
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

          <DialogFooter>
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
            <Button variant="destructive" onClick={handleSuspend} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Suspend company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
