"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";

type Status = "not_submitted" | "pending" | "approved";
type VerificationAudience = "renter" | "peerhost";
type RentalMode = "with_driver" | "self_drive";

interface PreviewFile {
  file: File;
  preview: string;
}

interface UploadedFile extends PreviewFile {
  type: "front" | "back";
}

function UploadedDocumentCard({
  file,
  badge,
  onRemove,
}: {
  file: PreviewFile;
  badge: string;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
      <div className="flex justify-center items-center bg-white dark:bg-slate-700 rounded-lg w-12 h-12 overflow-hidden">
        {file.file.type.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.preview}
            alt={file.file.name}
            className="dark:brightness-90 w-full h-full object-cover"
          />
        ) : (
          <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-1 py-0 dark:border-slate-600 text-[10px] dark:text-slate-300"
          >
            {badge}
          </Badge>
          <p className="font-medium dark:text-slate-300 text-sm truncate">
            {file.file.name}
          </p>
        </div>
        <p className="text-muted-foreground dark:text-slate-400 text-xs">
          {(file.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="dark:hover:bg-slate-700 rounded-full w-8 h-8 dark:text-slate-400"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function ProfileVerificationPage({
  audience = "peerhost",
}: {
  audience?: VerificationAudience;
}) {
  const apiBaseUrl = resolveApiBaseUrl();
  const isRenter = audience === "renter";
  const [idStatus, setIdStatus] = useState<Status>("not_submitted");
  const [licenseStatus, setLicenseStatus] = useState<Status>("not_submitted");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [nationalIdFiles, setNationalIdFiles] = useState<UploadedFile[]>([]);
  const [rentalMode, setRentalMode] = useState<RentalMode>("with_driver");

  const [form, setForm] = useState({
    dob: "",
    licenseNumber: "",
    idNumber: "",
    expiry: "",
  });

  const isWithDriverMode = isRenter && rentalMode === "with_driver";
  const currentStatus = isWithDriverMode ? idStatus : licenseStatus;

  const canSubmit = useMemo(() => {
    if (isWithDriverMode) {
      return form.dob && form.idNumber.length > 4 && nationalIdFiles.length === 2;
    } else {
      return (
        form.dob &&
        form.licenseNumber.length > 4 &&
        form.expiry &&
        uploadedFiles.length === 2
      );
    }
  }, [form, isWithDriverMode, nationalIdFiles, uploadedFiles]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${apiBaseUrl}/verifications/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          data?: {
            verifications?: Array<{
              status?: "PENDING" | "APPROVED" | "REJECTED";
              documentType?: string;
            }>;
          };
        };

        const verifications = payload.data?.verifications || [];
        if (cancelled || verifications.length === 0) return;

        const idVerifications = verifications.filter(v => 
          v.documentType === "NATIONAL_ID" || v.documentType === "PASSPORT"
        );
        const licenseVerifications = verifications.filter(v => 
          v.documentType === "DRIVER_LICENSE"
        );

        if (idVerifications.some((v) => v.status === "APPROVED")) setIdStatus("approved");
        else if (idVerifications.some((v) => v.status === "PENDING")) setIdStatus("pending");

        if (licenseVerifications.some((v) => v.status === "APPROVED")) setLicenseStatus("approved");
        else if (licenseVerifications.some((v) => v.status === "PENDING")) setLicenseStatus("pending");

      })
      .catch(() => {
        // Keep the form usable even if the status prefetch fails.
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(
      0,
      2 - uploadedFiles.length
    );
    e.target.value = "";

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;

        setUploadedFiles((prev) => {
          if (prev.length >= 2) {
            return prev;
          }

          const type = prev.length === 0 ? "front" : "back";
          return [...prev, { file, preview, type }];
        });
      };
      reader.readAsDataURL(file);
    });
  }

  function handleNationalIdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(
      0,
      2 - nationalIdFiles.length
    );
    e.target.value = "";

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;

        setNationalIdFiles((prev) => {
          if (prev.length >= 2) {
            return prev;
          }

          const type = prev.length === 0 ? "front" : "back";
          return [...prev, { file, preview, type }];
        });
      };
      reader.readAsDataURL(file);
    });
  }

  function removeNationalIdFile(index: number) {
    setNationalIdFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isWithDriverMode) {
        if (nationalIdFiles.length < 2) {
          throw new Error("Please upload the required verification documents.");
        }
        
        const payload = {
          documentFrontUrl: nationalIdFiles[0].preview,
          documentBackUrl: nationalIdFiles[1].preview,
          documentNumber: form.idNumber.trim(),
          dateOfBirth: form.dob,
        };

        const response = await fetch(`${apiBaseUrl}/auth/upgrade/renter/id`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeader(),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error?.message || "Failed to submit verification");
        }
      } else {
        // Self-drive or Peerhost
        const primaryFront = uploadedFiles[0]?.preview;
        const primaryBack = uploadedFiles[1]?.preview;

        if (!primaryFront || !primaryBack) {
          throw new Error("Please upload the required license documents.");
        }

        const endpoint = !isRenter
          ? `${apiBaseUrl}/auth/upgrade/peerhost`
          : `${apiBaseUrl}/auth/upgrade/renter/license`;

        const payload = {
          documentFrontUrl: primaryFront,
          documentBackUrl: primaryBack,
          licenseNumber: form.licenseNumber.trim(),
          dateOfBirth: form.dob,
          licenseExpiry: form.expiry,
          ...(!isRenter ? { address: "Address pending confirmation" } : {}),
        };

        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeader(),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error?.message || "Failed to submit verification");
        }
      }

      if (isWithDriverMode) setIdStatus("pending");
      else setLicenseStatus("pending");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit verification",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function statusBadge() {
    if (currentStatus === "approved")
      return (
        <Badge className="gap-1 bg-emerald-600 dark:bg-emerald-500 text-white">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </Badge>
      );

    if (currentStatus === "pending")
      return (
        <Badge
          variant="secondary"
          className="gap-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
        >
          <Clock className="w-3 h-3" />
          Pending Review
        </Badge>
      );

    return (
      <Badge
        variant="outline"
        className="dark:border-slate-700 dark:text-slate-400"
      >
        Not Submitted
      </Badge>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-50 dark:from-slate-950 to-white dark:to-slate-900 overflow-hidden">
      <Header />

      <Main className="mx-auto px-4 py-8 max-w-5xl container">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 dark:from-blue-600 to-indigo-600 dark:to-indigo-700 shadow-lg p-2 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="bg-clip-text bg-gradient-to-r from-slate-900 dark:from-slate-100 to-slate-600 dark:to-slate-400 font-bold text-transparent text-3xl">
                Profile Verification
              </h1>
              <p className="text-muted-foreground dark:text-slate-400 text-sm">
                {isRenter
                  ? "Verify your profile based on how you want to rent."
                  : "Submit your driver&apos;s license for verification"}
              </p>
            </div>
          </div>
          {statusBadge()}
        </div>

        {isRenter && (
          <div className="bg-white/85 dark:bg-slate-900/80 shadow-lg mb-6 p-2 border border-slate-200/80 dark:border-slate-800 rounded-2xl backdrop-blur">
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
              <div className="px-3 py-2">
                <p className="font-semibold dark:text-slate-100 text-sm">
                  Choose your rental mode
                </p>
                <p className="text-muted-foreground dark:text-slate-400 text-xs">
                  Self-drive needs a Driver&apos;s License. With-driver only needs your National ID.
                </p>
              </div>

              <div className="gap-2 grid sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRentalMode("with_driver")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-3 text-sm transition-all",
                    rentalMode === "with_driver"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  <UserRound className="w-4 h-4" />
                  <span className="font-medium">With Driver</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRentalMode("self_drive")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-3 text-sm transition-all",
                    rentalMode === "self_drive"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  <CarFront className="w-4 h-4" />
                  <span className="font-medium">Self-Drive</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="gap-6 grid md:grid-cols-2">
          {/* Information Card */}
          <Card className="bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800 h-fit">
            <CardHeader className="border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-base">
                <IdCard className="w-4 h-4" />
                {isWithDriverMode ? "Personal Information" : "Driver Information"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="bg-slate-100 dark:bg-slate-800 border-0 dark:text-slate-200 [color-scheme:dark]"
                />
              </div>

              {isWithDriverMode ? (
                <div className="space-y-2">
                  <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                    National ID Number
                  </Label>
                  <Input
                    value={form.idNumber}
                    onChange={(e) =>
                      setForm({ ...form, idNumber: e.target.value })
                    }
                    placeholder="e.g. 123456789"
                    className="bg-slate-100 dark:bg-slate-800 border-0 dark:placeholder:text-slate-500 dark:text-slate-200"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                      License Number
                    </Label>
                    <Input
                      value={form.licenseNumber}
                      onChange={(e) =>
                        setForm({ ...form, licenseNumber: e.target.value })
                      }
                      placeholder="DL-123456"
                      className="bg-slate-100 dark:bg-slate-800 border-0 dark:placeholder:text-slate-500 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                      License Expiry Date
                    </Label>
                    <Input
                      type="date"
                      value={form.expiry}
                      onChange={(e) =>
                        setForm({ ...form, expiry: e.target.value })
                      }
                      className="bg-slate-100 dark:bg-slate-800 border-0 dark:text-slate-200 [color-scheme:dark]"
                    />
                  </div>
                </>
              )}

              <Button
                disabled={!canSubmit || currentStatus !== "not_submitted" || isSubmitting}
                onClick={() => void handleSubmit()}
                className="bg-gradient-to-r mt-4 from-slate-900 hover:from-slate-800 dark:from-blue-600 dark:hover:from-blue-700 to-slate-800 hover:to-slate-700 dark:hover:to-blue-800 dark:to-blue-700 shadow-lg w-full text-white"
              >
                {isSubmitting
                  ? "Submitting..."
                  : currentStatus === "approved"
                    ? "Verification Approved"
                  : currentStatus === "pending"
                    ? "Submitted for Review"
                    : "Submit for Verification"}
              </Button>
              {submitError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Document Rules Card */}
          <Card className="bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800 h-fit">
            <CardHeader className="border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-base">
                <Upload className="w-4 h-4" />
                Required Documents
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-4 py-3",
                  !isWithDriverMode
                    ? "bg-emerald-50 dark:bg-emerald-950/25"
                    : "bg-slate-100 dark:bg-slate-800/80"
                )}
              >
                <div>
                  <p className="font-medium dark:text-slate-200 text-sm">
                    {!isWithDriverMode ? "Self-Drive Mode" : "With Driver Mode"}
                  </p>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">
                    {!isWithDriverMode
                      ? "Upload physical Driver's License."
                      : "Upload a valid National ID."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {isWithDriverMode ? (
                  // National ID Uploader
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium dark:text-slate-200 text-sm">
                          National ID Document
                        </p>
                        <p className="text-muted-foreground dark:text-slate-400 text-xs">
                          Upload clear front and back photos of your ID.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="dark:border-slate-700 dark:text-slate-300 text-[10px]"
                      >
                        {nationalIdFiles.length}/2 uploaded
                      </Badge>
                    </div>

                    {nationalIdFiles.length < 2 && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleNationalIdUpload}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          disabled={nationalIdFiles.length >= 2}
                        />
                        <div className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-8 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl text-center transition-colors">
                          <Upload className="mx-auto mb-2 w-8 h-8 text-slate-400 dark:text-slate-500" />
                          <p className="font-medium dark:text-slate-300 text-sm">
                            {nationalIdFiles.length === 0
                              ? "Upload Front of ID"
                              : "Upload Back of ID"}
                          </p>
                          <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs">
                            Click to browse (JPG, PNG, PDF)
                          </p>
                        </div>
                      </div>
                    )}

                    {nationalIdFiles.length > 0 && (
                      <div className="space-y-3">
                        <p className="font-medium text-muted-foreground dark:text-slate-400 text-xs">
                          ID FILES
                        </p>
                        <div className="gap-3 grid">
                          {nationalIdFiles.map((file, index) => (
                            <UploadedDocumentCard
                              key={index}
                              file={file}
                              badge={file.type === "front" ? "FRONT" : "BACK"}
                              onRemove={() => removeNationalIdFile(index)}
                            />
                          ))}

                          {nationalIdFiles.length === 1 && (
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleNationalIdUpload}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              />
                              <div className="bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-3 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl text-muted-foreground dark:text-slate-400 text-sm text-center transition-colors">
                                + Upload back side
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // License Uploader
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium dark:text-slate-200 text-sm">
                          Driver&apos;s License
                        </p>
                        <p className="text-muted-foreground dark:text-slate-400 text-xs">
                          Upload clear front and back photos.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="dark:border-slate-700 dark:text-slate-300 text-[10px]"
                      >
                        {uploadedFiles.length}/2 uploaded
                      </Badge>
                    </div>

                    {uploadedFiles.length < 2 && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          disabled={uploadedFiles.length >= 2}
                        />
                        <div className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-8 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl text-center transition-colors">
                          <Upload className="mx-auto mb-2 w-8 h-8 text-slate-400 dark:text-slate-500" />
                          <p className="font-medium dark:text-slate-300 text-sm">
                            {uploadedFiles.length === 0
                              ? "Upload Front of License"
                              : "Upload Back of License"}
                          </p>
                          <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs">
                            Click to browse (JPG, PNG, PDF)
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <p className="font-medium text-muted-foreground dark:text-slate-400 text-xs">
                          LICENSE FILES
                        </p>
                        <div className="gap-3 grid">
                          {uploadedFiles.map((file, index) => (
                            <UploadedDocumentCard
                              key={index}
                              file={file}
                              badge={file.type === "front" ? "FRONT" : "BACK"}
                              onRemove={() => removeFile(index)}
                            />
                          ))}

                          {uploadedFiles.length === 1 && (
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              />
                              <div className="bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-3 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl text-muted-foreground dark:text-slate-400 text-sm text-center transition-colors">
                                + Upload back side
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/50 mt-6 p-3 border border-blue-100 dark:border-blue-900 rounded-lg text-blue-700 dark:text-blue-300 text-xs">
                <p className="mb-1 font-medium">Verification requirements</p>
                <ul className="space-y-0.5 text-blue-600 dark:text-blue-400 list-disc list-inside">
                  <li>Clear, readable photos or PDF copies only</li>
                  {isWithDriverMode ? (
                    <li>National ID requires both front and back images.</li>
                  ) : (
                    <li>Driver&apos;s license needs both front and back images.</li>
                  )}
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
