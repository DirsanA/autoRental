"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Check, X, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface InspectionFormProps {
  title: string;
  description: string;
  onSubmit: (photos: Record<string, string>, notes: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PHOTO_FIELDS = [
  { id: "front", label: "Front View" },
  { id: "back", label: "Rear View" },
  { id: "side", label: "Side View" },
  { id: "dashboard", label: "Dashboard/Mileage" },
  { id: "fuelLevel", label: "Fuel/Battery Level" },
];

export function InspectionForm({ title, description, onSubmit, onCancel, isSubmitting }: InspectionFormProps) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const handleCapture = (id: string) => {
    // In a real app, this would open camera or file picker
    // For this demo, we'll use a placeholder base64 or trigger file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => ({ ...prev, [id]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const isComplete = PHOTO_FIELDS.every((f) => !!photos[f.id]);

  return (
    <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
          <p className="text-sm text-zinc-500 font-medium">{description}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-red-100 hover:text-red-600">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {PHOTO_FIELDS.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {field.label}
            </label>
            <button
              type="button"
              onClick={() => handleCapture(field.id)}
              className={cn(
                "w-full aspect-square border-2 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                photos[field.id] ? "bg-zinc-50 border-solid border-green-500" : "bg-zinc-50 hover:bg-zinc-100"
              )}
            >
              {photos[field.id] ? (
                <div className="relative w-full h-full">
                  <img src={photos[field.id]} alt={field.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-400">UPLOAD</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note any existing scratches or issues..."
          className="w-full h-24 p-3 border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 border-2 border-black font-black uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Cancel
        </Button>
        <Button 
          disabled={!isComplete || isSubmitting}
          onClick={() => onSubmit(photos, notes)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white border-2 border-black font-black uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Submit Inspection
              <UploadCloud className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
