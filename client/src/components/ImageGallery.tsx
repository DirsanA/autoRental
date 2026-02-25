import { useState } from "react";
import { Heart, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  carName: string;
  onShowPhotos: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ImageGallery = ({
  images,
  carName,
  onShowPhotos,
  isFavorite,
  onToggleFavorite,
}: ImageGalleryProps) => {
  return (
    <div className="relative animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
        <div className="md:col-span-2 aspect-[16/10] overflow-hidden">
          <img
            src={images[0]}
            alt={carName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2">
          {images.slice(1, 3).map((img, i) => (
            <div key={i} className="overflow-hidden">
              <img
                src={img}
                alt={`${carName} view ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
      >
        <Heart
          className={`w-5 h-5 ${
            isFavorite ? "fill-destructive text-destructive" : "text-foreground"
          }`}
        />
      </button>

      <Button
        onClick={onShowPhotos}
        variant="secondary"
        className="absolute bottom-4 right-4 gap-2 shadow-md bg-background/90 backdrop-blur-sm"
      >
        <Grid className="w-4 h-4" />
        View {images.length} photos
      </Button>
    </div>
  );
};

export default ImageGallery;
