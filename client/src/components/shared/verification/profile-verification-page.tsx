"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Shield,
  CheckCircle2,
  Clock,
  X,
  FileText,
  IdCard,
  CarFront,
  UserRound,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import { coalesceRequest } from "@/lib/api-coalesce";

type Status = "not_submitted" | "pending" | "approved" | "rejected";
type VerificationAudience = "renter" | "peerhost";
type RentalMode = "with_driver" | "self_drive";
type DocumentSide = "front" | "back";
type ServerStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

type IdFormState = {
  dob: string;
  idNumber: string;
};

type LicenseFormState = {
  dob: string;
  licenseNumber: string;
  expiry: string;
};

type VerificationRecord = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  documentType: "NATIONAL_ID" | "PASSPORT" | "DRIVER_LICENSE" | "BUSINESS_LICENSE";
  documentFrontUrl: string;
  documentBackUrl?: string;
  adminComment?: string;
  createdAt?: string;
  updatedAt?: string;
  verifiedAt?: string;
  extractedData?: {
    documentNumber?: string;
    dateOfBirth?: string;
    documentExpiry?: string;
    address?: string;
    targetVerificationLevel?: string;
  };
};

type VerificationSnapshot = {
  latest: VerificationRecord | null;
  status: ServerStatus;
  canSubmit: boolean;
  submissionsCount: number;
};

type VerificationOverview = {
  idVerification: VerificationSnapshot;
  licenseVerification: VerificationSnapshot;
};

type VerificationApiResponse = {
  data?: {
    verifications?: VerificationRecord[];
    overview?: Partial<VerificationOverview>;
  };
  error?: {
    message?: string;
  };
};

type StoredPreviewFile = {
  kind: "stored";
  name: string;
  preview: string;
  type: DocumentSide;
};

type LocalPreviewFile = {
  kind: "local";
  file: File;
  name: string;
  preview: string;
  size: number;
  type: DocumentSide;
};

type DocumentPreviewFile = StoredPreviewFile | LocalPreviewFile;

const EMPTY_SNAPSHOT: VerificationSnapshot = {
  latest: null,
  status: "NOT_SUBMITTED",
  canSubmit: true,
  submissionsCount: 0,
};

function toClientStatus(status: ServerStatus): Status {
  if (status === "PENDING") return "pending";
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  return "not_submitted";
}

function formatDateTime(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isImagePreview(preview: string) {
  return (
    preview.startsWith("data:image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(preview)
  );
}

function normalizeOverview(input?: Partial<VerificationOverview>): VerificationOverview {
  return {
    idVerification: {
      ...EMPTY_SNAPSHOT,
      ...input?.idVerification,
    },
    licenseVerification: {
      ...EMPTY_SNAPSHOT,
      ...input?.licenseVerification,
    },
  };
}

function buildStoredFiles(record: VerificationRecord | null, label: string) {
  if (!record) return [] as DocumentPreviewFile[];

  const files: DocumentPreviewFile[] = [
    {
      kind: "stored",
      name: `${label} front on file`,
      preview: record.documentFrontUrl,
      type: "front",
    },
  ];

  if (record.documentBackUrl) {
    files.push({
      kind: "stored",
      name: `${label} back on file`,
      preview: record.documentBackUrl,
      type: "back",
    });
  }

  return files;
}

function extractIdForm(record: VerificationRecord | null): IdFormState {
  return {
    dob: record?.extractedData?.dateOfBirth ?? "",
    idNumber: record?.extractedData?.documentNumber ?? "",
  };
}

function extractLicenseForm(record: VerificationRecord | null): LicenseFormState {
  return {
    dob: record?.extractedData?.dateOfBirth ?? "",
    licenseNumber: record?.extractedData?.documentNumber ?? "",
    expiry: record?.extractedData?.documentExpiry ?? "",
  };
}

function UploadedDocumentCard({
  file,
  badge,
  onRemove,
}: {
  file: DocumentPreviewFile;
  badge: string;
  onRemove?: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-700">
        {isImagePreview(file.preview) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.preview}
            alt={file.name}
            className="h-full w-full object-cover dark:brightness-90"
          />
        ) : (
          <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-1 py-0 text-[10px] dark:border-slate-600 dark:text-slate-300"
          >
            {badge}
          </Badge>
          <p className="truncate text-sm font-medium dark:text-slate-300">
            {file.name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground dark:text-slate-400">
          {file.kind === "local"
            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
            : "Saved on your profile"}
        </p>
      </div>

      {onRemove ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full dark:text-slate-400 dark:hover:bg-slate-700"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

function VerificationStatusBadge({ status }: { status: Status }) {
  if (status === "approved") {
    return (
      <Badge className="gap-1 bg-emerald-600 text-white dark:bg-emerald-500">
        <CheckCircle2 className="h-3 w-3" />
        Approved
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge
        variant="secondary"
        className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
      >
        <Clock className="h-3 w-3" />
        Pending Review
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge
        variant="secondary"
        className="gap-1 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      >
        <AlertCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="dark:border-slate-700 dark:text-slate-400"
    >
      Not Submitted
    </Badge>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read uploaded file"));
    reader.readAsDataURL(file);
  });
}

export function ProfileVerificationPage({
  audience = "peerhost",
}: {
  audience?: VerificationAudience;
}) {
  const apiBaseUrl = resolveApiBaseUrl();
  const { toast } = useToast();
  const isRenter = audience === "renter";

  const [rentalMode, setRentalMode] = useState<RentalMode>("with_driver");
  const [overview, setOverview] = useState<VerificationOverview>(() =>
    normalizeOverview(),
  );
  const [idForm, setIdForm] = useState<IdFormState>({
    dob: "",
    idNumber: "",
  });
  const [licenseForm, setLicenseForm] = useState<LicenseFormState>({
    dob: "",
    licenseNumber: "",
    expiry: "",
  });
  const [nationalIdFiles, setNationalIdFiles] = useState<DocumentPreviewFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<DocumentPreviewFile[]>([]);
  const [isReplacingId, setIsReplacingId] = useState(false);
  const [isReplacingLicense, setIsReplacingLicense] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [completedRequestVersion, setCompletedRequestVersion] = useState(-1);

  const isLoading = completedRequestVersion !== requestVersion;
  const isWithDriverMode = isRenter && rentalMode === "with_driver";
  const currentSnapshot = isWithDriverMode
    ? overview.idVerification
    : overview.licenseVerification;
  const currentStatus = toClientStatus(currentSnapshot.status);
  const currentFiles = isWithDriverMode ? nationalIdFiles : uploadedFiles;
  const currentIsReplacing = isWithDriverMode ? isReplacingId : isReplacingLicense;
  const currentSubmittedAt = currentSnapshot.latest?.createdAt;
  const currentReviewedAt = currentSnapshot.latest?.verifiedAt;
  const currentAdminComment = currentSnapshot.latest?.adminComment?.trim() || null;
  const currentLabel = isWithDriverMode ? "National ID" : "Driver's License";
  const idStatus = toClientStatus(overview.idVerification.status);
  const licenseStatus = toClientStatus(overview.licenseVerification.status);

  const canEditCurrentSubmission =
    currentStatus === "not_submitted" ||
    currentStatus === "rejected" ||
    currentIsReplacing;

  const currentFormValid = useMemo(() => {
    if (isWithDriverMode) {
      return (
        idForm.dob.length > 0 &&
        idForm.idNumber.trim().length > 4 &&
        currentFiles.length === 2
      );
    }

    return (
      licenseForm.dob.length > 0 &&
      licenseForm.licenseNumber.trim().length > 4 &&
      licenseForm.expiry.length > 0 &&
      currentFiles.length === 2
    );
  }, [currentFiles.length, idForm.dob, idForm.idNumber, isWithDriverMode, licenseForm.dob, licenseForm.expiry, licenseForm.licenseNumber]);

  const canSubmit =
    !isLoading &&
    !isSubmitting &&
    currentSnapshot.canSubmit &&
    canEditCurrentSubmission &&
    currentFormValid;

  useEffect(() => {
    let cancelled = false;



    async function loadVerificationState() {
      try {
        const payload = await coalesceRequest("verifications-me", async () => {
          const response = await fetch(`${apiBaseUrl}/verifications/me`, {
            method: "GET",
            credentials: "include",
            headers: {
              ...buildAuthHeader(),
            },
            cache: "no-store",
          });

          const result = (await response.json().catch(() => null)) as
            | VerificationApiResponse
            | null;

          if (!response.ok) {
            throw new Error(
              result?.error?.message || "Failed to load saved verification details",
            );
          }
          return result;
        });

        if (cancelled) {
          return;
        }

        const nextOverview = normalizeOverview(payload?.data?.overview);
        setOverview(nextOverview);
        setIdForm(extractIdForm(nextOverview.idVerification.latest));
        setLicenseForm(extractLicenseForm(nextOverview.licenseVerification.latest));
        setNationalIdFiles(
          buildStoredFiles(nextOverview.idVerification.latest, "National ID"),
        );
        setUploadedFiles(
          buildStoredFiles(
            nextOverview.licenseVerification.latest,
            "Driver's License",
          ),
        );
        setIsReplacingId(false);
        setIsReplacingLicense(false);
        setSubmitError(null);
        setLoadError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load saved verification details",
        );
      } finally {
        if (!cancelled) {
          setCompletedRequestVersion(requestVersion);
        }
      }
    }

    void loadVerificationState();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, requestVersion]);

  async function handleDocumentUpload(
    event: ChangeEvent<HTMLInputElement>,
    setter: Dispatch<SetStateAction<DocumentPreviewFile[]>>,
  ) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const previews = await Promise.all(
      files.map(async (file) => ({
        kind: "local" as const,
        file,
        name: file.name,
        preview: await readFileAsDataUrl(file),
        size: file.size,
      })),
    );

    setter((previous) => {
      const nextFiles = [...previous];

      previews.forEach((file) => {
        if (nextFiles.length >= 2) {
          return;
        }

        nextFiles.push({
          ...file,
          type: nextFiles.length === 0 ? "front" : "back",
        });
      });

      return nextFiles;
    });
  }

  function removeDocument(
    index: number,
    setter: Dispatch<SetStateAction<DocumentPreviewFile[]>>,
  ) {
    setter((previous) =>
      previous
        .filter((_, currentIndex) => currentIndex !== index)
        .map((file, currentIndex) => ({
          ...file,
          type: currentIndex === 0 ? "front" : "back",
        })),
    );
  }

  function startReplacement() {
    setSubmitError(null);

    if (isWithDriverMode) {
      setIsReplacingId(true);
      return;
    }

    setIsReplacingLicense(true);
  }

  function refreshVerificationState() {
    setLoadError(null);
    setRequestVersion((previous) => previous + 1);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isWithDriverMode) {
        if (nationalIdFiles.length < 2) {
          throw new Error("Please upload the required verification documents.");
        }

        const response = await fetch(`${apiBaseUrl}/auth/upgrade/renter/id`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeader(),
          },
          body: JSON.stringify({
            documentFrontUrl: nationalIdFiles[0]?.preview,
            documentBackUrl: nationalIdFiles[1]?.preview,
            documentNumber: idForm.idNumber.trim(),
            dateOfBirth: idForm.dob,
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.error?.message || "Failed to submit verification",
          );
        }
      } else {
        if (uploadedFiles.length < 2) {
          throw new Error("Please upload the required license documents.");
        }

        const endpoint = !isRenter
          ? `${apiBaseUrl}/auth/upgrade/peerhost`
          : `${apiBaseUrl}/auth/upgrade/renter/license`;

        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeader(),
          },
          body: JSON.stringify({
            documentFrontUrl: uploadedFiles[0]?.preview,
            documentBackUrl: uploadedFiles[1]?.preview,
            licenseNumber: licenseForm.licenseNumber.trim(),
            dateOfBirth: licenseForm.dob,
            licenseExpiry: licenseForm.expiry,
            ...(!isRenter ? { address: "Address pending confirmation" } : {}),
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.error?.message || "Failed to submit verification",
          );
        }
      }

      toast({
        title: "Verification submitted",
        description:
          currentStatus === "approved"
            ? "Your replacement details were submitted and are now pending admin review."
            : "Your verification was submitted for admin review.",
      });
      refreshVerificationState();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit verification",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderStatusMessage() {
    if (currentStatus === "approved" && !currentIsReplacing) {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <p className="font-medium">Your approved verification is already saved.</p>
          <p className="mt-1 text-emerald-700 dark:text-emerald-300">
            You do not need to upload everything again when you come back here.
            If something changed, you can replace the saved information and it
            will go back to admin review.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-transparent dark:text-emerald-200 dark:hover:bg-emerald-950"
            onClick={startReplacement}
          >
            Replace Saved Information
          </Button>
        </div>
      );
    }

    if (currentStatus === "approved" && currentIsReplacing) {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-medium">Replacement mode is active.</p>
          <p className="mt-1 text-blue-700 dark:text-blue-300">
            Any changes you submit now will replace the currently saved
            information on this page and will need admin approval again.
          </p>
        </div>
      );
    }

    if (currentStatus === "pending") {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Your latest submission is already under review.</p>
          <p className="mt-1 text-amber-700 dark:text-amber-300">
            You do not need to upload again right now. This page is showing the
            saved documents and form values currently waiting for admin review.
          </p>
        </div>
      );
    }

    if (currentStatus === "rejected") {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <p className="font-medium">Your last submission was not approved.</p>
          <p className="mt-1 text-rose-700 dark:text-rose-300">
            Update the saved information below and submit it again for review.
          </p>
          {currentAdminComment ? (
            <p className="mt-2 rounded-lg bg-white/70 p-3 text-rose-800 dark:bg-slate-900/50 dark:text-rose-200">
              Admin comment: {currentAdminComment}
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <p className="font-medium">Submit your verification once.</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          After submission, this page will keep showing your saved details,
          document uploads, and admin review status whenever you return.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header />

      <Main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg dark:from-blue-600 dark:to-indigo-700">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
                Profile Verification
              </h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                {isRenter
                  ? "Review your saved verification details and update them only when something changes."
                  : "Review your saved license verification and replace it only when needed."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <VerificationStatusBadge status={currentStatus} />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={refreshVerificationState}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading ? "animate-spin" : "")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isRenter ? (
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold dark:text-slate-100">
                  Choose your rental mode
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">
                  Each mode keeps its own saved verification data and admin status.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRentalMode("with_driver")}
                  className={cn(
                    "rounded-xl px-4 py-3 text-left text-sm transition-all",
                    rentalMode === "with_driver"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    <span className="font-medium">With Driver</span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      rentalMode === "with_driver"
                        ? "text-blue-100"
                        : "text-slate-500 dark:text-slate-400",
                    )}
                  >
                    {idStatus === "approved"
                      ? "Approved"
                      : idStatus === "pending"
                        ? "Pending review"
                        : idStatus === "rejected"
                          ? "Rejected"
                          : "Not submitted"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRentalMode("self_drive")}
                  className={cn(
                    "rounded-xl px-4 py-3 text-left text-sm transition-all",
                    rentalMode === "self_drive"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CarFront className="h-4 w-4" />
                    <span className="font-medium">Self-Drive</span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      rentalMode === "self_drive"
                        ? "text-emerald-100"
                        : "text-slate-500 dark:text-slate-400",
                    )}
                  >
                    {licenseStatus === "approved"
                      ? "Approved"
                      : licenseStatus === "pending"
                        ? "Pending review"
                        : licenseStatus === "rejected"
                          ? "Rejected"
                          : "Not submitted"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {loadError}
          </div>
        ) : null}

        <div className="mb-6">{renderStatusMessage()}</div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="h-fit border-0 bg-white/80 shadow-xl backdrop-blur dark:border dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-base dark:text-slate-200">
                <IdCard className="h-4 w-4" />
                {isWithDriverMode ? "Personal Information" : "Driver Information"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{currentLabel} status</p>
                  <VerificationStatusBadge status={currentStatus} />
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <p>Last submitted: {formatDateTime(currentSubmittedAt)}</p>
                  <p>Last reviewed: {formatDateTime(currentReviewedAt)}</p>
                  <p>Total submissions on file: {currentSnapshot.submissionsCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground dark:text-slate-400">
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  value={isWithDriverMode ? idForm.dob : licenseForm.dob}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (isWithDriverMode) {
                      setIdForm((previous) => ({ ...previous, dob: value }));
                      return;
                    }

                    setLicenseForm((previous) => ({ ...previous, dob: value }));
                  }}
                  disabled={!canEditCurrentSubmission}
                  className="border-0 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:[color-scheme:dark]"
                />
              </div>

              {isWithDriverMode ? (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground dark:text-slate-400">
                    National ID Number
                  </Label>
                  <Input
                    value={idForm.idNumber}
                    onChange={(event) =>
                      setIdForm((previous) => ({
                        ...previous,
                        idNumber: event.target.value,
                      }))
                    }
                    placeholder="e.g. 123456789"
                    disabled={!canEditCurrentSubmission}
                    className="border-0 bg-slate-100 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:text-slate-200"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground dark:text-slate-400">
                      License Number
                    </Label>
                    <Input
                      value={licenseForm.licenseNumber}
                      onChange={(event) =>
                        setLicenseForm((previous) => ({
                          ...previous,
                          licenseNumber: event.target.value,
                        }))
                      }
                      placeholder="DL-123456"
                      disabled={!canEditCurrentSubmission}
                      className="border-0 bg-slate-100 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground dark:text-slate-400">
                      License Expiry Date
                    </Label>
                    <Input
                      type="date"
                      value={licenseForm.expiry}
                      onChange={(event) =>
                        setLicenseForm((previous) => ({
                          ...previous,
                          expiry: event.target.value,
                        }))
                      }
                      disabled={!canEditCurrentSubmission}
                      className="border-0 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:[color-scheme:dark]"
                    />
                  </div>
                </>
              )}

              <Button
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
                className="mt-4 w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg hover:from-slate-800 hover:to-slate-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800"
              >
                {isSubmitting
                  ? "Submitting..."
                  : currentStatus === "approved" && currentIsReplacing
                    ? "Submit Replacement for Review"
                    : currentStatus === "rejected"
                      ? "Resubmit for Review"
                      : currentStatus === "pending"
                        ? "Awaiting Admin Review"
                        : currentStatus === "approved"
                          ? "Verification Approved"
                          : "Submit for Verification"}
              </Button>

              {submitError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="h-fit border-0 bg-white/80 shadow-xl backdrop-blur dark:border dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-base dark:text-slate-200">
                <Upload className="h-4 w-4" />
                Required Documents
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-4 py-3",
                  !isWithDriverMode
                    ? "bg-emerald-50 dark:bg-emerald-950/25"
                    : "bg-slate-100 dark:bg-slate-800/80",
                )}
              >
                <div>
                  <p className="text-sm font-medium dark:text-slate-200">
                    {!isWithDriverMode ? "Self-Drive Mode" : "With Driver Mode"}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    {!isWithDriverMode
                      ? "Your saved driver's license files are shown below."
                      : "Your saved national ID files are shown below."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium dark:text-slate-200">
                    {isWithDriverMode ? "National ID Document" : "Driver's License"}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    {canEditCurrentSubmission
                      ? "Keep the saved files or remove one to upload a replacement."
                      : "Saved files are locked while approved or pending."}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] dark:border-slate-700 dark:text-slate-300"
                >
                  {currentFiles.length}/2 saved
                </Badge>
              </div>

              {currentFiles.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    {currentFiles.map((file, index) => (
                      <UploadedDocumentCard
                        key={`${file.type}-${file.name}-${index}`}
                        file={file}
                        badge={file.type === "front" ? "FRONT" : "BACK"}
                        onRemove={
                          canEditCurrentSubmission
                            ? () =>
                                removeDocument(
                                  index,
                                  isWithDriverMode
                                    ? setNationalIdFiles
                                    : setUploadedFiles,
                                )
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {canEditCurrentSubmission && currentFiles.length < 2 ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) =>
                      void handleDocumentUpload(
                        event,
                        isWithDriverMode ? setNationalIdFiles : setUploadedFiles,
                      )
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 p-8 text-center transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400 dark:text-slate-500" />
                    <p className="text-sm font-medium dark:text-slate-300">
                      {currentFiles.length === 0
                        ? `Upload ${isWithDriverMode ? "Front of ID" : "Front of License"}`
                        : `Upload ${isWithDriverMode ? "Back of ID" : "Back of License"}`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground dark:text-slate-400">
                      Click to browse (JPG, PNG, PDF)
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
                <p className="mb-1 font-medium">Verification requirements</p>
                <ul className="list-inside list-disc space-y-0.5 text-blue-600 dark:text-blue-400">
                  <li>Clear, readable photos or PDF copies only</li>
                  <li>
                    {isWithDriverMode
                      ? "National ID requires both front and back images."
                      : "Driver's license needs both front and back images."}
                  </li>
                  <li>Max file size: 5MB per document</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  );
}
