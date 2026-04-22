"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  FileCheck2,
  ImageIcon,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { UserFullDetail, UserVerificationRecord } from "./types";
import {
  formatDate,
  formatDateTime,
  formatLabel,
  maskIdentity,
} from "./formatters";

interface VerificationTabProps {
  user: UserFullDetail;
}

const ID_DOCUMENT_TYPES = new Set(["NATIONAL_ID", "PASSPORT"]);

function countByStatus(user: UserFullDetail, status: string) {
  return user.verifications.filter((item) => item.status === status).length;
}

function findPrimaryVerification(user: UserFullDetail) {
  const approved = user.verifications.filter(
    (verification) => verification.status === "APPROVED",
  );

  if (
    user.verificationLevel === "LICENSE_VERIFIED" ||
    user.verificationLevel === "PEER_HOST"
  ) {
    return (
      approved.find((verification) => verification.documentType === "DRIVER_LICENSE") ||
      user.verifications.find(
        (verification) => verification.documentType === "DRIVER_LICENSE",
      ) ||
      approved[0] ||
      user.verifications[0] ||
      null
    );
  }

  if (user.verificationLevel === "ID_VERIFIED") {
    return (
      approved.find((verification) =>
        ID_DOCUMENT_TYPES.has(verification.documentType || ""),
      ) ||
      user.verifications.find((verification) =>
        ID_DOCUMENT_TYPES.has(verification.documentType || ""),
      ) ||
      approved[0] ||
      user.verifications[0] ||
      null
    );
  }

  return approved[0] || user.verifications[0] || null;
}

function DocumentImage({
  src,
  title,
  onOpen,
}: {
  src: string | null;
  title: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!src}
      className="group relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border bg-muted/20 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {src ? (
        <img src={src} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span>No image uploaded</span>
        </div>
      )}
      {src ? (
        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          <span>{title}</span>
          <span>Open</span>
        </div>
      ) : null}
    </button>
  );
}

function SecondaryVerificationItem({
  verification,
  onPreview,
}: {
  verification: UserVerificationRecord;
  onPreview: (title: string, src: string) => void;
}) {
  return (
    <AccordionItem
      value={verification.id}
      className="rounded-2xl border bg-background px-4"
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 pr-4 text-left">
          <div>
            <div className="font-medium">
              {formatLabel(verification.documentType)}
            </div>
            <div className="text-sm text-muted-foreground">
              Submitted {formatDateTime(verification.createdAt)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-normal">
              {formatLabel(verification.status)}
            </Badge>
            {verification.reviewTargetLevel ? (
              <Badge variant="outline" className="font-normal">
                {formatLabel(verification.reviewTargetLevel)}
              </Badge>
            ) : null}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <DocumentImage
              src={verification.documentFrontUrl}
              title={`${formatLabel(verification.documentType)} front`}
              onOpen={() =>
                verification.documentFrontUrl
                  ? onPreview(
                      `${formatLabel(verification.documentType)} front`,
                      verification.documentFrontUrl,
                    )
                  : undefined
              }
            />
            <DocumentImage
              src={verification.documentBackUrl}
              title={`${formatLabel(verification.documentType)} back`}
              onOpen={() =>
                verification.documentBackUrl
                  ? onPreview(
                      `${formatLabel(verification.documentType)} back`,
                      verification.documentBackUrl,
                    )
                  : undefined
              }
            />
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-muted-foreground">Document Number</div>
              <div className="font-medium">
                {maskIdentity(verification.documentNumber)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Date Of Birth</div>
              <div className="font-medium">
                {formatDate(verification.dateOfBirth)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Expiry</div>
              <div className="font-medium">
                {formatDate(verification.documentExpiry)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Reviewed</div>
              <div className="font-medium">
                {formatDateTime(verification.verifiedAt)}
              </div>
            </div>
          </div>
          {verification.submittedAddress ? (
            <div className="rounded-xl bg-muted/20 p-3 text-sm">
              <div className="text-muted-foreground">Submitted Address</div>
              <div className="mt-1 font-medium">{verification.submittedAddress}</div>
            </div>
          ) : null}
          {verification.adminComment ? (
            <div className="rounded-xl bg-muted/20 p-3 text-sm">
              <div className="text-muted-foreground">Admin Comment</div>
              <div className="mt-1 font-medium">{verification.adminComment}</div>
            </div>
          ) : null}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/**
 * Shows the current matched verification document and a lighter submission history.
 */
export function VerificationTab({ user }: VerificationTabProps) {
  const approvedCount = countByStatus(user, "APPROVED");
  const pendingCount = countByStatus(user, "PENDING");
  const primaryVerification = findPrimaryVerification(user);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const openPreview = (title: string, src: string) => {
    setPreviewTitle(title);
    setPreviewSrc(src);
  };

  const primaryFront =
    primaryVerification?.documentFrontUrl || user.idImageUrl || null;
  const primaryBack = primaryVerification?.documentBackUrl || null;
  const primaryTitle = primaryVerification
    ? formatLabel(primaryVerification.documentType)
    : "Verification document";

  return (
    <>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm ring-1 ring-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Current Level
                </div>
                <div className="text-2xl font-semibold">
                  {formatLabel(user.verificationLevel)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Approved Docs</div>
                <div className="text-2xl font-semibold">{approvedCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
                <div className="text-2xl font-semibold">{pendingCount}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle>Current Matched Document</CardTitle>
            <CardDescription>
              The primary document shown here is selected from the user&apos;s achieved verification level.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {primaryVerification ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{primaryTitle}</div>
                      <div className="text-sm text-muted-foreground">
                        Matched from {formatLabel(user.verificationLevel)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {formatLabel(primaryVerification.status)}
                    </Badge>
                    {primaryVerification.reviewTargetLevel ? (
                      <Badge variant="outline" className="font-normal">
                        {formatLabel(primaryVerification.reviewTargetLevel)}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <DocumentImage
                    src={primaryFront}
                    title={`${primaryTitle} front`}
                    onOpen={() =>
                      primaryFront
                        ? openPreview(`${primaryTitle} front`, primaryFront)
                        : undefined
                    }
                  />
                  <DocumentImage
                    src={primaryBack}
                    title={`${primaryTitle} back`}
                    onOpen={() =>
                      primaryBack
                        ? openPreview(`${primaryTitle} back`, primaryBack)
                        : undefined
                    }
                  />
                </div>

                <div className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-muted/20 p-4">
                    <div className="text-muted-foreground">Document Number</div>
                    <div className="mt-1 font-medium">
                      {maskIdentity(primaryVerification.documentNumber)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted/20 p-4">
                    <div className="text-muted-foreground">Date Of Birth</div>
                    <div className="mt-1 font-medium">
                      {formatDate(primaryVerification.dateOfBirth)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted/20 p-4">
                    <div className="text-muted-foreground">Expiry</div>
                    <div className="mt-1 font-medium">
                      {formatDate(primaryVerification.documentExpiry)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted/20 p-4">
                    <div className="text-muted-foreground">Reviewed</div>
                    <div className="mt-1 font-medium">
                      {formatDateTime(primaryVerification.verifiedAt)}
                    </div>
                  </div>
                </div>

                {(primaryVerification.submittedAddress || primaryVerification.adminComment) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {primaryVerification.submittedAddress ? (
                      <div className="rounded-2xl border bg-muted/15 p-4 text-sm">
                        <div className="text-muted-foreground">
                          Submitted Address
                        </div>
                        <div className="mt-1 font-medium">
                          {primaryVerification.submittedAddress}
                        </div>
                      </div>
                    ) : null}
                    {primaryVerification.adminComment ? (
                      <div className="rounded-2xl border bg-muted/15 p-4 text-sm">
                        <div className="text-muted-foreground">Admin Comment</div>
                        <div className="mt-1 font-medium">
                          {primaryVerification.adminComment}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                No verification record is available for this user yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              Expand a record only when you need more detail or the alternate document images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.verifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                No verification records were found for this user.
              </div>
            ) : (
              <Accordion type="single" collapsible className="grid gap-3">
                {user.verifications.map((verification) => (
                  <SecondaryVerificationItem
                    key={verification.id}
                    verification={verification}
                    onPreview={openPreview}
                  />
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!previewSrc}
        onOpenChange={(open) => {
          if (!open) setPreviewSrc(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
            <DialogDescription>
              Expanded document preview for system-admin review.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl border bg-muted/20 p-4">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt={previewTitle}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : null}
          </div>
          {previewSrc ? (
            <div className="flex justify-end">
              <Button asChild variant="outline">
                <a href={previewSrc} target="_blank" rel="noreferrer">
                  Open Original
                </a>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
