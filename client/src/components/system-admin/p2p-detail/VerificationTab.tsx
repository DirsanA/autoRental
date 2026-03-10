"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Download,
  Eye,
  HelpCircle,
} from "lucide-react";
import type { VerificationData, KYCStatus, DocumentItem } from "./types";
import { cn } from "@/lib/utils";

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

export function VerificationTab({
  data,
  onApproveDoc,
  onRejectDoc,
}: {
  data: VerificationData;
  onApproveDoc: (doc: DocumentItem) => void;
  onRejectDoc: (doc: DocumentItem) => void;
}) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.documents.map((doc) => (
          <Card
            key={doc.id}
            className="shadow-sm overflow-hidden flex flex-col group"
          >
            <div className="h-40 bg-muted/60 flex items-center justify-center border-b relative">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full shadow-md"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full shadow-md"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4 flex flex-col flex-1 gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm leading-tight">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-muted-foreground uppercase">
                    {doc.type}
                  </p>
                </div>
                <StatusPill status={doc.status} />
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} ·{" "}
                {doc.fileSize}
              </p>

              <div className="mt-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={doc.status === "verified"}
                  onClick={() => onApproveDoc(doc)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={doc.status === "rejected"}
                  onClick={() => onRejectDoc(doc)}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.documents.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            No documents submitted yet.
          </div>
        )}
      </div>
    </div>
  );
}
