"use client";

import { useMemo, useState } from "react";
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
  const isRenter = audience === "renter";
  const [status, setStatus] = useState<Status>("not_submitted");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [nationalIdFile, setNationalIdFile] = useState<PreviewFile | null>(
    null
  );
  const [collateralFile, setCollateralFile] = useState<PreviewFile | null>(
    null
  );
  const [rentalMode, setRentalMode] = useState<RentalMode>("with_driver");

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    licenseNumber: "",
    expiry: "",
  });

  const isSelfDriveMode = isRenter && rentalMode === "self_drive";

  const canSubmit = useMemo(() => {
    return (
      form.fullName.length > 2 &&
      form.dob &&
      form.licenseNumber.length > 4 &&
      form.expiry &&
      uploadedFiles.length === 2 &&
      (!isSelfDriveMode ||
        (Boolean(nationalIdFile) && Boolean(collateralFile)))
    );
  }, [collateralFile, form, isSelfDriveMode, nationalIdFile, uploadedFiles]);

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
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNationalIdFile({
        file,
        preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleCollateralUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCollateralFile({
        file,
        preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    setStatus("pending");
  }

  function statusBadge() {
    if (status === "approved")
      return (
        <Badge className="gap-1 bg-emerald-600 dark:bg-emerald-500 text-white">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </Badge>
      );

    if (status === "pending")
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
                  ? "Verify your license and unlock self-drive with national ID and collateral"
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
                  Self-drive needs national ID and collateral like a cheque. With driver only needs your license.
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
          <Card className="bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800">
            <CardHeader className="border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-base">
                <IdCard className="w-4 h-4" />
                Driver Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                  Full Name
                </Label>
                <Input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="John Doe"
                  className="bg-slate-100 dark:bg-slate-800 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 dark:placeholder:text-slate-500 dark:text-slate-200"
                />
              </div>

              <div className="gap-3 grid grid-cols-2">
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
                <div className="space-y-2">
                  <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                    License Expiry
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
              </div>

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

              <Button
                disabled={!canSubmit || status === "pending"}
                onClick={handleSubmit}
                className="bg-gradient-to-r from-slate-900 hover:from-slate-800 dark:from-blue-600 dark:hover:from-blue-700 to-slate-800 hover:to-slate-700 dark:hover:to-blue-800 dark:to-blue-700 shadow-lg w-full text-white"
              >
                {status === "pending"
                  ? "Submitted for Review"
                  : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800">
            <CardHeader className="border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-base">
                <Upload className="w-4 h-4" />
                Required Documents
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              {isRenter && (
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-4 py-3",
                    isSelfDriveMode
                      ? "bg-emerald-50 dark:bg-emerald-950/25"
                      : "bg-slate-100 dark:bg-slate-800/80"
                  )}
                >
                  <div>
                    <p className="font-medium dark:text-slate-200 text-sm">
                      {isSelfDriveMode ? "Self-Drive Mode" : "With Driver Mode"}
                    </p>
                    <p className="text-muted-foreground dark:text-slate-400 text-xs">
                      {isSelfDriveMode
                        ? "Upload license, national ID, and collateral."
                        : "Only your driver&apos;s license is needed."}
                    </p>
                  </div>
                  {isSelfDriveMode && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]">
                      Extra documents required
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-4">
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
              </div>

              {isRenter && (isSelfDriveMode || nationalIdFile || collateralFile) && (
                <div className="space-y-4 border-slate-200 dark:border-slate-800 pt-2 border-t">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium dark:text-slate-200 text-sm">
                          National ID
                        </p>
                        {isSelfDriveMode && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground dark:text-slate-400 text-xs">
                        Upload one national ID file to unlock no-driver rentals.
                      </p>
                    </div>
                  </div>

                  {!nationalIdFile && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleNationalIdUpload}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div
                        className={cn(
                          "p-6 border-2 border-dashed rounded-xl text-center transition-colors",
                          isSelfDriveMode
                            ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
                            : "border-slate-300 bg-slate-100 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                        )}
                      >
                        <IdCard className="mx-auto mb-2 w-8 h-8 text-slate-400 dark:text-slate-500" />
                        <p className="font-medium dark:text-slate-300 text-sm">
                          Upload National ID
                        </p>
                        <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs">
                          Accepted: JPG, PNG, PDF
                        </p>
                      </div>
                    </div>
                  )}

                  {nationalIdFile && (
                    <UploadedDocumentCard
                      file={nationalIdFile}
                      badge="ID"
                      onRemove={() => setNationalIdFile(null)}
                    />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium dark:text-slate-200 text-sm">
                            Collateral Info
                          </p>
                          {isSelfDriveMode && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground dark:text-slate-400 text-xs">
                          Upload cheque or another collateral document for self-drive approval.
                        </p>
                      </div>
                    </div>

                    {!collateralFile && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleCollateralUpload}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div
                          className={cn(
                            "p-6 border-2 border-dashed rounded-xl text-center transition-colors",
                            isSelfDriveMode
                              ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
                              : "border-slate-300 bg-slate-100 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                          )}
                        >
                          <FileText className="mx-auto mb-2 w-8 h-8 text-slate-400 dark:text-slate-500" />
                          <p className="font-medium dark:text-slate-300 text-sm">
                            Upload Cheque or Collateral
                          </p>
                          <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs">
                            Accepted: JPG, PNG, PDF
                          </p>
                        </div>
                      </div>
                    )}

                    {collateralFile && (
                      <UploadedDocumentCard
                        file={collateralFile}
                        badge="COLLATERAL"
                        onRemove={() => setCollateralFile(null)}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/50 p-3 border border-blue-100 dark:border-blue-900 rounded-lg text-blue-700 dark:text-blue-300 text-xs">
                <p className="mb-1 font-medium">Verification requirements</p>
                <ul className="space-y-0.5 text-blue-600 dark:text-blue-400 list-disc list-inside">
                  <li>Clear, readable photos or PDF copies only</li>
                  <li>Driver&apos;s license needs both front and back</li>
                  <li>Max file size: 5MB per document</li>
                  {isRenter && isSelfDriveMode && (
                    <>
                      <li>National ID is required before self-drive rentals are enabled</li>
                      <li>Collateral info like cheque is required for self-drive approval</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-6 text-muted-foreground dark:text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-full w-2 h-2 transition-colors",
                form.fullName && form.dob && form.licenseNumber && form.expiry
                  ? "bg-green-500 dark:bg-green-400"
                  : "bg-slate-300 dark:bg-slate-600"
              )}
            />
            <span>Personal info</span>
          </div>
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 min-w-8 h-px" />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-full w-2 h-2 transition-colors",
                uploadedFiles.length === 2
                  ? "bg-green-500 dark:bg-green-400"
                  : "bg-slate-300 dark:bg-slate-600"
              )}
            />
            <span>License ({uploadedFiles.length}/2)</span>
          </div>
          {isRenter && (isSelfDriveMode || nationalIdFile) && (
            <>
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 min-w-8 h-px" />
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "rounded-full w-2 h-2 transition-colors",
                    !isSelfDriveMode || nationalIdFile
                      ? "bg-green-500 dark:bg-green-400"
                      : "bg-slate-300 dark:bg-slate-600"
                  )}
                />
                <span>
                  National ID {isSelfDriveMode ? "(required)" : "(optional)"}
                </span>
              </div>
            </>
          )}
          {isRenter && (isSelfDriveMode || collateralFile) && (
            <>
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 min-w-8 h-px" />
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "rounded-full w-2 h-2 transition-colors",
                    !isSelfDriveMode || collateralFile
                      ? "bg-green-500 dark:bg-green-400"
                      : "bg-slate-300 dark:bg-slate-600"
                  )}
                />
                <span>
                  Collateral {isSelfDriveMode ? "(required)" : "(optional)"}
                </span>
              </div>
            </>
          )}
        </div>
      </Main>
    </div>
  );
}
