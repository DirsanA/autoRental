"use client";

import { useState, useEffect } from "react";
import { downloadFile, isPdfUrl, isImageUrl, fetchAuthenticatedBlob } from "@/lib/download-utils";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Ban,
  Eye,
  ExternalLink,
  CheckCircle2,
  XCircle,
  CarFront,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RecordBadge } from "@/components/action-badges/record-badge";
import { useActionBadgesStore } from "@/stores/action-badges-store";

interface HostListing {
  id: string;
  title: string;
  category: string;
  plate: string;
  dailyRate: number;
  status: "pending" | "approved" | "rejected" | "maintenance";
  totalTrips: number;
  rating: number;
  photos?: {
    front: string | null;
    back: string | null;
    side: string | null;
    interior: string | null;
    gallery: string[];
  };
  documents?: {
    ownership: string | null;
    insurance: string | null;
  };
  adminComment?: string | null;
}

interface ListingsTabProps {
  listings: HostListing[];
  onViewVehicle: (id: string) => void;
  onApproveVehicle: (id: string, title: string) => void;
  onRejectVehicle: (id: string, title: string) => void;
  onDelist: (id: string, title: string) => void;
}

export function ListingsTab({
  listings,
  onViewVehicle,
  onApproveVehicle,
  onRejectVehicle,
  onDelist,
}: ListingsTabProps) {
  const isViewed = useActionBadgesStore((state) => state.isViewed);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerListing, setViewerListing] = useState<any | null>(null);
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

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-card py-20 text-center">
        <CarFront className="mb-2 h-10 w-10 text-muted-foreground/30" />
        <h3 className="text-lg font-medium text-foreground">
          No vehicle submissions
        </h3>
        <p className="text-sm text-muted-foreground">
          This applicant has not uploaded any vehicles.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead>Vehicle Details</TableHead>
            <TableHead>Plate</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id} className="group hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  {listing.photos?.front ? (
                    <img
                      src={listing.photos.front}
                      alt={listing.title}
                      className="h-14 w-20 rounded-md border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setViewerTitle(`${listing.title} - Front Panel`);
                        setViewerSrc(listing.photos!.front!);
                        setViewerListing(listing);
                      }}
                    />
                  ) : (
                    <div className="flex h-14 w-20 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                      <CarFront className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">
                        {listing.title}
                      </div>
                      {listing.status === "pending" &&
                        !isViewed("VEHICLE", listing.id) && (
                          <RecordBadge show={true} variant="signal" />
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {listing.category}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="bg-muted/50 font-mono text-xs"
                >
                  {listing.plate}
                </Badge>
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                ${listing.dailyRate}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      listing.documents?.ownership
                        ? "border-green-200 bg-green-100 text-green-800"
                        : "border-red-200 bg-red-100 text-red-800",
                    )}
                  >
                    {listing.documents?.ownership
                      ? "Ownership on file"
                      : "Ownership missing"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      listing.documents?.insurance
                        ? "border-green-200 bg-green-100 text-green-800"
                        : "border-red-200 bg-red-100 text-red-800",
                    )}
                  >
                    {listing.documents?.insurance
                      ? "Insurance on file"
                      : "Insurance missing"}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.documents?.ownership && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setViewerTitle(`${listing.title} - Ownership Doc`);
                        setViewerSrc(listing.documents!.ownership!);
                        setViewerListing(listing);
                      }}
                    >
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      Ownership
                    </Button>
                  )}
                  {listing.documents?.insurance && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setViewerTitle(`${listing.title} - Insurance Doc`);
                        setViewerSrc(listing.documents!.insurance!);
                        setViewerListing(listing);
                      }}
                    >
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      Insurance
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0 font-normal capitalize",
                    listing.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : listing.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : listing.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800",
                  )}
                >
                  {listing.status}
                </Badge>
                {/* {listing.adminComment && (
                  <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                    {listing.adminComment}
                  </p>
                )} */}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewVehicle(listing.id)}>
                      <Eye className="mr-2 h-4 w-4" /> View full details
                    </DropdownMenuItem>
                    {listing.status !== "approved" && (
                      <DropdownMenuItem
                        className="text-green-600"
                        onClick={() =>
                          onApproveVehicle(listing.id, listing.title)
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Vehicle
                      </DropdownMenuItem>
                    )}
                    {listing.status !== "rejected" && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          onRejectVehicle(listing.id, listing.title)
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Vehicle
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!viewerSrc}
        onOpenChange={(open) => {
          if (!open) setViewerSrc(null);
        }}
      >
        <DialogContent className="max-w-4xl bg-background border rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle>{viewerTitle}</DialogTitle>
            <DialogDescription>
              Review vehicle images and approve/reject directly.
            </DialogDescription>
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
              {viewerListing?.status !== "rejected" && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    onRejectVehicle(viewerListing.id, viewerListing.title);
                    setViewerSrc(null);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              )}
              {viewerListing?.status !== "approved" && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    onApproveVehicle(viewerListing.id, viewerListing.title);
                    setViewerSrc(null);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
