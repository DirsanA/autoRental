import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface PhotoModalProps {
  images: string[];
  carName: string;
  open: boolean;
  onClose: () => void;
}

const PhotoModal = ({ images, carName, open, onClose }: PhotoModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images],
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open, safeImages.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === 0 ? safeImages.length - 1 : prev - 1,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === safeImages.length - 1 ? 0 : prev + 1,
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, safeImages.length]);

  if (!open) return null;
  if (!safeImages.length) return null;

  const currentImage = safeImages[activeIndex] || safeImages[0];
  const goPrev = () =>
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  const goNext = () =>
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-4 md:px-6">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-sm md:text-base font-semibold text-gray-900">
            {carName} - {activeIndex + 1}/{safeImages.length}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <div className="relative flex-1 rounded-xl bg-white">
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border bg-white/95 p-2 shadow hover:bg-white"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative h-full w-full">
            <Image
              src={currentImage}
              alt={`${carName} photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border bg-white/95 p-2 shadow hover:bg-white"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {safeImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border ${
                idx === activeIndex ? "border-gray-900" : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`${carName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
