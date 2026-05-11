"use client";

import { useState, useEffect } from "react";
import { downloadFile, isPdfUrl, isImageUrl, fetchAuthenticatedBlob } from "@/lib/download-utils";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Eye,
  HelpCircle,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import type { VerificationData, KYCStatus, DocumentItem } from "./types";
import { cn } from "@/lib/utils";
import { useActionBadgesStore } from "@/stores/action-badges-store";

const statusMap: Record<
  KYCStatus,
  { label: string; icon: React.ElementType; cls: string }
> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    cls: "text-green-600 bg-green-100",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    cls: "text-yellow-600 bg-yellow-100",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    cls: "text-red-600 bg-red-100",
  },
  unsubmitted: {
    label: "Not Submitted",
    icon: HelpCircle,
    cls: "text-gray-600 bg-gray-100",
  },
};

function StatusPill({ status }: { status: KYCStatus }) {
  const { label, icon: Icon, cls } = statusMap[status];
  return (
    <Badge variant="outline" className={cn("gap-1 font-normal border-0", cls)}>
      <Icon className="h-3 w-3" /> {label}
    </Badge>
  );
}

interface VerificationTabProps {
  data: VerificationData;
  verifications: {
    id: string;
    documentType: string;
    status: string;
    documentFrontUrl: string | null;
    documentBackUrl: string | null;
    adminComment: string | null;
    verifiedAt: string | null;
    createdAt: string | null;
    extractedData: Record<string, any> | null;
  }[];
  onApproveDoc: (doc: DocumentItem) => void;
  onRejectDoc: (doc: DocumentItem) => void;
}

export function VerificationTab({
  data,
  verifications,
  onApproveDoc,
  onRejectDoc,
}: VerificationTabProps) {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerDoc, setViewerDoc] = useState<DocumentItem | null>(null);
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  useEffect(() => {
    if (viewerSrc) {
      setViewerLoading(true);
      fetchAuthenticatedBlob(viewerSrc)
        .then((url) => {
          setViewerBlobUrl(url);
        })
        .catch((err) => {
          console.error("Failed to load viewer document:", err);
        })
        .finally(() => {
          setViewerLoading(false);
        });
    } else {
      if (viewerBlobUrl) {
        window.URL.revokeObjectURL(viewerBlobUrl);
      }
      setViewerBlobUrl(null);
    }
  }, [viewerSrc]);

  const getVerificationByDoc = (doc: DocumentItem) => {
    return verifications.find((v) => v.id === doc.id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Overview Grid ── */}
      <h3 className="text-lg font-semibold tracking-tight">KYC Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Identity", status: data.identityStatus },
          { label: "License", status: data.drivingLicenseStatus },
          { label: "Insurance", status: data.insuranceStatus },
          { label: "Background", status: data.backgroundCheckStatus },
        ].map((item, idx) => (
          <Card key={idx} className="shadow-sm">
            <CardContent className="p-4 flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {item.label}
              </span>
              <StatusPill status={item.status} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Document List ── */}
      <h3 className="text-lg font-semibold tracking-tight mt-4">
        Submitted Documents
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.documents.map((doc) => {
          const verification = getVerificationByDoc(doc);
          return (
            <Card
              key={doc.id}
              className="shadow-sm overflow-hidden flex flex-col group"
            >
              <div className="h-48 bg-muted/60 flex items-center justify-center border-b relative">
                {verification?.documentFrontUrl ? (
                  <img
                    src={verification.documentFrontUrl}
                    alt={doc.title}
                    className="h-full w-full object-contain bg-white"
                  />
                ) : (
                  <ShieldCheck className="h-10 w-10 text-muted-foreground/30" />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {verification?.documentFrontUrl && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-md"
                      onClick={() => {
                        if (verification.documentFrontUrl) {
                          setViewerTitle(`${doc.title} - Front`);
                          setViewerSrc(verification.documentFrontUrl);
                          setViewerDoc(doc);
                        }
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {verification?.documentBackUrl && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-md"
                      onClick={() => {
                        if (verification.documentBackUrl) {
                          setViewerTitle(`${doc.title} - Back`);
                          setViewerSrc(verification.documentBackUrl);
                          setViewerDoc(doc);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardContent className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm leading-tight">
                        {doc.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {doc.type}
                    </p>
                  </div>
                  <StatusPill status={doc.status} />
                </div>

                {verification?.extractedData && (
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {verification.extractedData.documentNumber && (
                      <p>
                        <strong>Document #:</strong>{" "}
                        {verification.extractedData.documentNumber}
                      </p>
                    )}
                    {verification.extractedData.dateOfBirth && (
                      <p>
                        <strong>DOB:</strong>{" "}
                        {verification.extractedData.dateOfBirth}
                      </p>
                    )}
                    {verification.extractedData.documentExpiry && (
                      <p>
                        <strong>Expiry:</strong>{" "}
                        {verification.extractedData.documentExpiry}
                      </p>
                    )}
                    {verification.extractedData.address && (
                      <p>
                        <strong>Address:</strong>{" "}
                        {verification.extractedData.address}
                      </p>
                    )}
                  </div>
                )}

                {verification?.adminComment && (
                  <div className="text-xs bg-muted p-2 rounded mt-2">
                    <strong>Admin Note:</strong> {verification.adminComment}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mb-2">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  {verification?.verifiedAt && (
                    <span>
                      {" "}
                      · Verified{" "}
                      {new Date(verification.verifiedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>

                <div className="mt-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-green-700 border-green-200 hover:bg-green-50"
                    disabled={doc.status === "verified"}
                    onClick={() => onApproveDoc(doc)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    disabled={doc.status === "rejected"}
                    onClick={() => onRejectDoc(doc)}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {data.documents.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            No documents submitted yet.
          </div>
        )}
      </div>

      {/* Image Viewer Lightbox */}
      <Dialog open={!!viewerSrc} onOpenChange={(open) => { if (!open) setViewerSrc(null); }}>
        <DialogContent className="max-w-4xl bg-background border rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle>{viewerTitle}</DialogTitle>
            <DialogDescription>Review KYC document.</DialogDescription>
          </DialogHeader>
          <div className="relative flex justify-center bg-muted/40 rounded-md overflow-hidden border h-[65vh]">
            {viewerLoading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
            ) : isPdfUrl(viewerSrc!) ? (
              <iframe
                src={viewerBlobUrl || ""}
                className="w-full h-full rounded-md border-0"
                title={viewerTitle}
              />
            ) : isImageUrl(viewerSrc!) ? (
              <img
                src={viewerBlobUrl || viewerSrc || ""}
                alt={viewerTitle}
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <ExternalLink className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Preview not available
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  This file type cannot be previewed directly. Please download
                  it to view the contents.
                </p>
                <Button
                  onClick={() => downloadFile(viewerSrc!, viewerTitle)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" /> Download File
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => downloadFile(viewerSrc!, viewerTitle)}
            >
              <Download className="h-4 w-4" /> Download Original
            </Button>

            <div className="flex gap-3">
              {viewerDoc?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => {
                      onRejectDoc(viewerDoc);
                      setViewerSrc(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      onApproveDoc(viewerDoc);
                      setViewerSrc(null);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
