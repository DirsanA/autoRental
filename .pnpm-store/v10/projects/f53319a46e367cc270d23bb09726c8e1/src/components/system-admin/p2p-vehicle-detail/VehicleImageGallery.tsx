"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Image as ImageIcon, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleImageGalleryProps {
  photos: {
    front: string | null;
    back: string | null;
    side: string | null;
    interior: string | null;
    gallery: string[];
  };
  title: string;
}

export function VehicleImageGallery({ photos, title }: VehicleImageGalleryProps) {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  const allPhotos = [
    { src: photos.front, label: "Front" },
    { src: photos.back, label: "Back" },
    { src: photos.side, label: "Side" },
    { src: photos.interior, label: "Interior" },
    ...photos.gallery.map((src, i) => ({ src, label: `Gallery ${i + 1}` })),
  ].filter((p): p is { src: string; label: string } => Boolean(p.src));

  const openViewer = (src: string, label: string) => {
    setViewerSrc(src);
    setViewerTitle(`${title} - ${label}`);
  };

  if (allPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-20 text-muted-foreground">
        <ImageIcon className="mb-4 h-12 w-12 opacity-20" />
        <h3 className="text-lg font-medium text-foreground">No Images Available</h3>
        <p className="text-sm">The host has not uploaded any photos for this vehicle.</p>
      </div>
    );
  }

  const primaryPhoto = allPhotos[0];
  const secondaryPhotos = allPhotos.slice(1, 5);
  const remainingCount = Math.max(0, allPhotos.length - 5);

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Vehicle Images</h2>
        <p className="text-sm text-muted-foreground">High-resolution exterior and interior photos.</p>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Primary Large Image */}
        <div
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted cursor-zoom-in"
          onClick={() => openViewer(primaryPhoto.src, primaryPhoto.label)}
        >
          <img
            src={primaryPhoto.src}
            alt={primaryPhoto.label}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
            {primaryPhoto.label}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </div>
        </div>

        {/* Secondary Images Grid */}
        {secondaryPhotos.length > 0 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {secondaryPhotos.map((photo, i) => {
              const isLast = i === 3 && remainingCount > 0;
              return (
                <div
                  key={photo.src}
                  className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted cursor-zoom-in"
                  onClick={() => openViewer(photo.src, photo.label)}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    className={cn(
                      "absolute inset-0 transition-colors",
                      isLast ? "bg-black/40" : "bg-black/0 group-hover:bg-black/10"
                    )}
                  />
                  {!isLast && (
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                      {photo.label}
                    </div>
                  )}
                  {isLast && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-medium text-white">+{remainingCount}</span>
                    </div>
                  )}
                  {!isLast && (
                    <div className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                      <Maximize2 className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!viewerSrc} onOpenChange={(open) => { if (!open) setViewerSrc(null); }}>
        <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{viewerTitle}</DialogTitle>
            <DialogDescription>Full size image preview</DialogDescription>
          </DialogHeader>
          <div className="group relative flex h-[85vh] w-full items-center justify-center overflow-hidden rounded-xl bg-black/90 p-4">
            {viewerSrc && (
              <img
                src={viewerSrc}
                alt={viewerTitle}
                className="h-full w-full object-contain"
              />
            )}
            <div className="absolute top-4 left-4 rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md">
              {viewerTitle}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
