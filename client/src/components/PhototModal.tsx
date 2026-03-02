import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface PhotoModalProps {
  images: string[];
  carName: string;
  open: boolean;
  onClose: () => void;
}

const PhotoModal = ({ images, carName, open, onClose }: PhotoModalProps) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10">
          <h2 className="text-xl font-bold font-heading text-foreground">All Photos</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Image
                src={img}
                alt={`${carName} photo ${i + 1}`}
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
