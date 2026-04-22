"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { FileText, Shield, Eye, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleDocumentsCardProps {
  documents: {
    ownership: string | null;
    insurance: string | null;
  };
}

export function VehicleDocumentsCard({ documents }: VehicleDocumentsCardProps) {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  const openViewer = (src: string, title: string) => {
    setViewerSrc(src);
    setViewerTitle(title);
  };

  const docs = [
    {
      id: "ownership",
      title: "Vehicle Ownership",
      icon: FileText,
      src: documents.ownership,
      description: "Proof of vehicle ownership or logbook.",
    },
    {
      id: "insurance",
      title: "Insurance Policy",
      icon: Shield,
      src: documents.insurance,
      description: "Active commercial or personal insurance policy.",
    },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Legal Documents</h2>
        <p className="text-sm text-muted-foreground">Verify the vehicle's ownership and insurance cover.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {docs.map((doc) => {
          const Icon = doc.icon;
          const hasDoc = !!doc.src;
          const isPdf = doc.src?.toLowerCase().endsWith(".pdf");

          return (
            <div
              key={doc.id}
              className={`flex flex-col justify-between rounded-xl border p-4 ${
                hasDoc ? "bg-card" : "bg-muted/30 border-dashed"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-full p-2 ${hasDoc ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                {hasDoc ? (
                  <>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      Uploaded
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => {
                        if (isPdf) {
                          window.open(doc.src!, "_blank");
                        } else {
                          openViewer(doc.src!, doc.title);
                        }
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    <FileWarning className="h-3.5 w-3.5" /> Missing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!viewerSrc} onOpenChange={(open) => { if (!open) setViewerSrc(null); }}>
        <DialogContent className="max-w-4xl bg-background border rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle>{viewerTitle}</DialogTitle>
            <DialogDescription>Review this document thoroughly.</DialogDescription>
          </DialogHeader>
          <div className="relative flex justify-center bg-muted/40 rounded-md overflow-hidden p-4 border max-h-[70vh]">
            {viewerSrc && (
              <img src={viewerSrc} alt={viewerTitle} className="object-contain w-full h-full" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
