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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  CreditCard,
  FileCheck2,
  ImageIcon,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { UserFullDetail, UserVerificationRecord } from "./types";
import {
  formatDate,
  formatDateTime,
  formatLabel,
  maskIdentity,
} from "./formatters";
import { updateVerificationStatus, promoteUserVerificationLevel } from "./api";
import { useToast } from "@/hooks/use-toast";

interface VerificationTabProps {
  user: UserFullDetail;
}

interface VerificationAction {
  verificationId: string;
  action: "approve" | "reject" | "promote_id" | "promote_license";
  comment: string;
}

const ID_DOCUMENT_TYPES = new Set(["NATIONAL_ID", "PASSPORT"]);

function countByStatus(user: UserFullDetail, status: string) {
  return user.verifications.filter((item) => item.status === status).length;
}

function getStatusColor(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
  }
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
      approved.find(
        (verification) => verification.documentType === "DRIVER_LICENSE",
      ) ||
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
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!src}
      className="group relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border bg-muted/20 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {src ? (
        <>
          <img
            src={src}
            alt={title}
            className="h-full w-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={() => onOpen()}
          />

          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            <span>{title}</span>
            <span>click to open</span>
            <button
              onClick={() => onOpen()}
              className="ml-2 text-xs underline hover:no-underline text-white/80"
              title="Open in full screen"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2 2a2 2 0-5.64 2.01 2.01 0 0-2.82 0 0-2.82M9 7l2 2a2 2 0 0 5.64 2.01 2.01 0 0-2.82m0 7h4a4 4 0 00-2.82 2.01 0 0-2.82"
                />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span>No image uploaded</span>
        </div>
      )}
    </button>
  );
}

function VerificationActionDialog({
  verification,
  open,
  onClose,
  onSubmit,
}: {
  verification: UserVerificationRecord;
  open: boolean;
  onClose: () => void;
  onSubmit: (action: VerificationAction) => void;
}) {
  const status = verification.status?.toLowerCase() || "pending";
  const [action, setAction] = useState<
    "approve" | "reject" | "promote_id" | "promote_license"
  >(
    status === "approved"
      ? "reject"
      : status === "rejected"
        ? "approve"
        : "approve",
  );
  const [comment, setComment] = useState("");

  // Determine available promotion options based on document type
  const canPromoteToId = ID_DOCUMENT_TYPES.has(verification.documentType || "");
  const canPromoteToLicense = verification.documentType === "DRIVER_LICENSE";

  const handleSubmit = () => {
    onSubmit({
      verificationId: verification.id,
      action,
      comment,
    });
    setComment("");
    onClose();
  };

  const getActionTitle = () => {
    switch (action) {
      case "approve":
        return "Approve Verification";
      case "reject":
        return "Reject Verification";
      case "promote_id":
        return "Promote to ID Verification";
      case "promote_license":
        return "Promote to License Verification";
      default:
        return "Review Verification";
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case "approve":
        return `Approve the ${formatLabel(verification.documentType)} verification.`;
      case "reject":
        return `Reject the ${formatLabel(verification.documentType)} verification.`;
      case "promote_id":
        return `Promote user to ID verification level based on this ${formatLabel(verification.documentType)}.`;
      case "promote_license":
        return `Promote user to License verification level based on this driver license.`;
      default:
        return `Review the ${formatLabel(verification.documentType)} verification.`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getActionTitle()}</DialogTitle>
          <DialogDescription>{getActionDescription()}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Action</Label>
            <div className="mt-2 grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={action === "approve" ? "default" : "outline"}
                  onClick={() => setAction("approve")}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant={action === "reject" ? "destructive" : "outline"}
                  onClick={() => setAction("reject")}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>

              {/* Promotion Options */}
              {(canPromoteToId || canPromoteToLicense) && (
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground">
                    Promotion Options
                  </Label>
                  <div className="mt-1 grid gap-1">
                    {canPromoteToId && (
                      <Button
                        type="button"
                        variant={
                          action === "promote_id" ? "default" : "outline"
                        }
                        onClick={() => setAction("promote_id")}
                        className="gap-2 justify-start"
                        size="sm"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Promote to ID Verification
                      </Button>
                    )}
                    {canPromoteToLicense && (
                      <Button
                        type="button"
                        variant={
                          action === "promote_license" ? "default" : "outline"
                        }
                        onClick={() => setAction("promote_license")}
                        className="gap-2 justify-start"
                        size="sm"
                      >
                        <CreditCard className="h-4 w-4" />
                        Promote to License Verification
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Admin Comment</Label>
            <Textarea
              id="comment"
              placeholder={
                action === "reject"
                  ? "Required: Explain why this verification is being rejected..."
                  : action.includes("promote")
                    ? "Optional: Add a note for this promotion..."
                    : "Optional: Add a note for this approval..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant={
              action === "reject"
                ? "destructive"
                : action.includes("promote")
                  ? "default"
                  : "default"
            }
            disabled={action === "reject" && !comment.trim()}
          >
            {action.includes("promote")
              ? getActionTitle().split(" ")[0]
              : action === "approve"
                ? "Approve"
                : "Reject"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SecondaryVerificationItem({
  verification,
  onPreview,
  onAction,
}: {
  verification: UserVerificationRecord;
  onPreview: (title: string, src: string) => void;
  onAction: (verification: UserVerificationRecord) => void;
}) {
  const status = verification.status?.toLowerCase() || "pending";
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  const getStatusActions = () => {
    if (isPending) {
      return {
        message: "Pending Review - Action Required",
        color:
          "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20",
        textColor: "text-amber-700 dark:text-amber-300",
        buttonText: "Review Document",
        buttonIcon: <CheckCircle2 className="h-4 w-4" />,
      };
    } else if (isApproved) {
      return {
        message: "Approved - Can be Rejected",
        color:
          "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20",
        textColor: "text-emerald-700 dark:text-emerald-300",
        buttonText: "Reject Document",
        buttonIcon: <XCircle className="h-4 w-4" />,
      };
    } else if (isRejected) {
      return {
        message: "Rejected - Can be Approved",
        color:
          "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
        textColor: "text-red-700 dark:text-red-300",
        buttonText: "Approve Document",
        buttonIcon: <CheckCircle2 className="h-4 w-4" />,
      };
    }
    return null;
  };

  const statusActions = getStatusActions();

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
            <Badge
              variant="secondary"
              className={`font-normal ${getStatusColor(verification.status)}`}
            >
              {formatLabel(verification.status)}
            </Badge>
            {verification.reviewTargetLevel ? (
              <Badge variant="outline" className="font-normal">
                {formatLabel(verification.reviewTargetLevel)}
              </Badge>
            ) : null}
            {!isPending && (
              <Badge
                variant="outline"
                className="font-normal border-blue-200 text-blue-700"
              >
                Can Reverse
              </Badge>
            )}
            {isPending && (
              <Badge
                variant="outline"
                className="font-normal border-amber-200 text-amber-700"
              >
                Action Required
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="grid gap-4">
          {statusActions && (
            <div className={`rounded-2xl border ${statusActions.color} p-4`}>
              <div
                className={`flex items-center gap-2 text-sm font-medium ${statusActions.textColor}`}
              >
                {isPending && <ShieldAlert className="h-4 w-4" />}
                {isApproved && <CheckCircle2 className="h-4 w-4" />}
                {isRejected && <XCircle className="h-4 w-4" />}
                {statusActions.message}
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onAction(verification)}
                  className="gap-2"
                  variant={
                    isRejected
                      ? "default"
                      : isApproved
                        ? "destructive"
                        : "default"
                  }
                >
                  {statusActions.buttonIcon}
                  {statusActions.buttonText}
                </Button>
              </div>
            </div>
          )}

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

          <div className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
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
              <div className="mt-1 font-medium">
                {verification.submittedAddress}
              </div>
            </div>
          ) : null}
          {verification.adminComment ? (
            <div className="rounded-xl bg-muted/20 p-3 text-sm">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Admin Comment</div>
                  <div className="mt-1 font-medium">
                    {verification.adminComment}
                  </div>
                </div>
              </div>
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
  const { toast } = useToast();
  const approvedCount = countByStatus(user, "APPROVED");
  const pendingCount = countByStatus(user, "PENDING");
  const primaryVerification = findPrimaryVerification(user);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [actionDialog, setActionDialog] = useState<{
    verification: UserVerificationRecord | null;
    open: boolean;
  }>({ verification: null, open: false });

  const openPreview = (title: string, src: string) => {
    setPreviewTitle(title);
    setPreviewSrc(src);
  };

  const openActionDialog = (verification: UserVerificationRecord) => {
    setActionDialog({ verification, open: true });
  };

  const closeActionDialog = () => {
    setActionDialog({ verification: null, open: false });
  };

  const handleVerificationAction = async (action: VerificationAction) => {
    try {
      if (
        action.action === "promote_id" ||
        action.action === "promote_license"
      ) {
        // Handle promotion actions
        const updatedUser = await promoteUserVerificationLevel(
          user.id,
          action.action,
        );

        toast({
          title: "User Promoted",
          description: `User has been promoted to PEER_HOST verification level.`,
        });

        // TODO: Update local user state with updatedUser data
        // This would typically trigger a state update to refresh the UI
      } else {
        // Handle regular approve/reject actions
        await updateVerificationStatus(
          user.id,
          action.verificationId,
          action.action,
          action.comment,
        );

        toast({
          title: "Verification Updated",
          description: `Verification has been ${action.action}d successfully.`,
        });

        // TODO: Refresh user data to show updated verification status
        // This would typically trigger a refetch of the user data
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update verification",
        variant: "destructive",
      });
    }
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
                <div className="text-sm text-muted-foreground">
                  Approved Docs
                </div>
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
                <div className="text-sm text-muted-foreground">
                  Pending Review
                </div>
                <div className="text-2xl font-semibold">{pendingCount}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle>Current Matched Document</CardTitle>
            <CardDescription>
              The primary document shown here is selected from the user&apos;s
              achieved verification level.
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
                      <div className="text-lg font-semibold">
                        {primaryTitle}
                      </div>
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

                {(primaryVerification.submittedAddress ||
                  primaryVerification.adminComment) && (
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
                        <div className="text-muted-foreground">
                          Admin Comment
                        </div>
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

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              Expand a record only when you need more detail or the alternate
              document images.
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
                    onAction={openActionDialog}
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
          {/* {previewSrc ? (
            <div className="flex justify-end">
              <Button asChild variant="outline">
                <a href={previewSrc} target="_blank" rel="noreferrer">
                  Open Original
                </a>
              </Button>
            </div>
          ) : null} */}
        </DialogContent>
      </Dialog>

      {actionDialog.verification && (
        <VerificationActionDialog
          verification={actionDialog.verification}
          open={actionDialog.open}
          onClose={closeActionDialog}
          onSubmit={handleVerificationAction}
        />
      )}
    </>
  );
}
