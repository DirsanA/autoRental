"use client";

import { useState } from "react";
import {
  Camera,
  CarFront,
  CheckCircle2,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import type { Vehicle as CompanyVehicle } from "@/app/(dashboard)/company/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitCompanyVehicle } from "./api";

type AddCompanyVehicleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVehicle: (vehicle: CompanyVehicle) => Promise<void> | void;
};

type PhotoSlot = "front" | "back" | "side" | "interior";

type UploadedAsset = {
  file: File;
  preview: string;
  name: string;
  size: string;
};

type DraftVehicle = {
  make: string;
  model: string;
  year: string;
  plate: string;
  vin: string;
  pricePerDay: string;
  initialAvailability: "AVAILABLE" | "MAINTENANCE";
  mileage: string;
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  transmission: "automatic" | "manual" | "cvt";
  seats: string;
  features: string[];
  photos: Record<PhotoSlot, UploadedAsset | null>;
};

const photoSlots: Array<{ key: PhotoSlot; label: string }> = [
  { key: "front", label: "Front" },
  { key: "back", label: "Rear" },
  { key: "side", label: "Side" },
  { key: "interior", label: "Interior" },
];

const suggestedFeatures = [
  "Bluetooth",
  "Backup Camera",
  "Apple CarPlay",
  "Android Auto",
  "Lane Assist",
  "USB Charging",
  "Keyless Entry",
  "Parking Sensors",
];

const defaultDraft: DraftVehicle = {
  make: "",
  model: "",
  year: `${new Date().getFullYear()}`,
  plate: "",
  vin: "",
  pricePerDay: "",
  initialAvailability: "AVAILABLE",
  mileage: "",
  fuel: "petrol",
  transmission: "automatic",
  seats: "5",
  features: [],
  photos: {
    front: null,
    back: null,
    side: null,
    interior: null,
  },
};

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function AddCompanyVehicleDialog({
  open,
  onOpenChange,
  onAddVehicle,
}: AddCompanyVehicleDialogProps) {
  const [draft, setDraft] = useState<DraftVehicle>(defaultDraft);
  const [newFeature, setNewFeature] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetDraft = () => {
    setDraft(defaultDraft);
    setNewFeature("");
    setSubmitError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetDraft();
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (slot: PhotoSlot, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    try {
      const preview = await readFileAsDataUrl(file);

      setDraft((current) => ({
        ...current,
        photos: {
          ...current.photos,
          [slot]: {
            file,
            preview,
            name: file.name,
            size: formatFileSize(file.size),
          },
        },
      }));
      setSubmitError(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to read photo file.",
      );
    }
  };

  const removePhoto = (slot: PhotoSlot) => {
    setDraft((current) => ({
      ...current,
      photos: {
        ...current.photos,
        [slot]: null,
      },
    }));
  };

  const addFeature = (feature: string) => {
    const value = feature.trim();
    if (!value) return;

    setDraft((current) => {
      if (current.features.some((item) => item.toLowerCase() === value.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        features: [...current.features, value],
      };
    });
    setNewFeature("");
  };

  const removeFeature = (feature: string) => {
    setDraft((current) => ({
      ...current,
      features: current.features.filter((item) => item !== feature),
    }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSaving(true);

    try {
      const year = Number(draft.year);
      const price = Number(draft.pricePerDay);
      const mileage = draft.mileage.trim() ? Number(draft.mileage) : undefined;
      const seats = Number(draft.seats);

      if (!draft.make.trim()) throw new Error("Make is required.");
      if (!draft.model.trim()) throw new Error("Model is required.");
      if (!draft.plate.trim()) throw new Error("Plate number is required.");
      if (!Number.isFinite(year) || year < 1900 || year > 2100) {
        throw new Error("Year must be between 1900 and 2100.");
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Daily rate must be a valid number.");
      }
      if (!Number.isFinite(seats) || seats < 1) {
        throw new Error("Seats must be at least 1.");
      }
      if (!draft.photos.front || !draft.photos.back || !draft.photos.side || !draft.photos.interior) {
        throw new Error("Please upload all 4 required car photos.");
      }

      const vehicle = await submitCompanyVehicle({
        make: draft.make.trim(),
        model: draft.model.trim(),
        year,
        vin: draft.vin.trim() || undefined,
        plate: draft.plate.trim().toUpperCase(),
        mileage: Number.isFinite(mileage) ? mileage : undefined,
        fuel: draft.fuel,
        transmission: draft.transmission,
        seats,
        features: draft.features,
        price,
        status: draft.initialAvailability,
        photos: {
          front: draft.photos.front.preview,
          back: draft.photos.back.preview,
          side: draft.photos.side.preview,
          interior: draft.photos.interior.preview,
        },
      });

      await onAddVehicle(vehicle);
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save vehicle.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const uploadedPhotoCount = Object.values(draft.photos).filter(Boolean).length;
  const isSubmitDisabled =
    isSaving ||
    !draft.make.trim() ||
    !draft.model.trim() ||
    !draft.plate.trim() ||
    !draft.pricePerDay.trim() ||
    uploadedPhotoCount < 4;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-0 bg-white p-0 sm:max-w-4xl dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_34%),linear-gradient(135deg,#0f172a,#1e293b_55%,#0f172a)] px-6 py-6 text-left">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            <CarFront className="h-3.5 w-3.5" />
            Company fleet intake
          </div>
          <DialogTitle className="text-2xl text-white">
            Add a new car to your fleet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 px-6 py-6">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Main details
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      The basics shown across your fleet dashboard.
                    </p>
                  </div>
                  <Badge className="border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Company quick add
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <Input
                      value={draft.make}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, make: event.target.value }))
                      }
                      placeholder="Toyota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                      value={draft.model}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, model: event.target.value }))
                      }
                      placeholder="Land Cruiser"
                    />
                  </div>           
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={draft.year}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, year: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plate number</Label>
                    <Input
                      value={draft.plate}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, plate: event.target.value }))
                      }
                      placeholder="AA-1234-26"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily rate</Label>
                    <Input
                      type="number"
                      value={draft.pricePerDay}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          pricePerDay: event.target.value,
                        }))
                      }
                      placeholder="85"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Initial availability</Label>
                    <Select
                      value={draft.initialAvailability}
                      onValueChange={(value: "AVAILABLE" | "MAINTENANCE") =>
                        setDraft((current) => ({
                          ...current,
                          initialAvailability: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>VIN</Label>
                    <Input
                      value={draft.vin}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          vin: event.target.value,
                        }))
                      }
                      placeholder="Vehicle identification number"
                    />
                  </div>

                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Vehicle specs
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    These values help the detail page feel complete right away.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mileage (km)</Label>
                    <Input
                      type="number"
                      value={draft.mileage}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, mileage: event.target.value }))
                      }
                      placeholder="24500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seats</Label>
                    <Input
                      type="number"
                      value={draft.seats}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, seats: event.target.value }))
                      }
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel type</Label>
                    <Select
                      value={draft.fuel}
                      onValueChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          fuel: value as DraftVehicle["fuel"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select
                      value={draft.transmission}
                      onValueChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          transmission: value as DraftVehicle["transmission"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="cvt">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Features</Label>
                    {draft.features.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {draft.features.map((feature) => (
                          <Badge
                            key={feature}
                            className="gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="rounded-full"
                              aria-label={`Remove ${feature}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={newFeature}
                        onChange={(event) => setNewFeature(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addFeature(newFeature);
                          }
                        }}
                        placeholder="Add a feature..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => addFeature(newFeature)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestedFeatures.map((feature) => {
                        const isSelected = draft.features.some(
                          (item) => item.toLowerCase() === feature.toLowerCase(),
                        );

                        return (
                          <Button
                            key={feature}
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            disabled={isSelected}
                            className="h-8 rounded-full px-3 text-xs"
                            onClick={() => addFeature(feature)}
                          >
                            {feature}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Car photos
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Match the host onboarding flow with all 4 required vehicle angles.
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-500 dark:text-slate-400">
                      Car Photos (4 required)
                    </Label>
                    <Badge
                      variant="outline"
                      className={
                        uploadedPhotoCount >= 4
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : "dark:border-slate-700 dark:text-slate-400"
                      }
                    >
                      {uploadedPhotoCount}/4
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {photoSlots.map(({ key, label }) => {
                      const photo = draft.photos[key];

                      return (
                        <div key={key} className="group relative">
                          {photo ? (
                            <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-[4/3] dark:bg-slate-800">
                              <img
                                src={photo.preview}
                                alt={label}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition group-hover:opacity-100">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `company-photo-${key}`,
                                    ) as HTMLInputElement | null;
                                    input?.click();
                                  }}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => removePhoto(key)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <Badge className="absolute left-2 top-2 border-0 bg-black/55 text-white">
                                {label}
                              </Badge>
                            </div>
                          ) : (
                            <label
                              htmlFor={`company-photo-${key}`}
                              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 aspect-[4/3] transition hover:border-sky-400 hover:bg-sky-50/70 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-500 dark:hover:bg-slate-900"
                            >
                              <Camera className="mb-2 h-7 w-7 text-slate-400 transition group-hover:text-sky-500 dark:text-slate-500 dark:group-hover:text-sky-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {label}
                              </span>
                              <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Upload
                              </span>
                            </label>
                          )}
                          <input
                            id={`company-photo-${key}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                              handlePhotoUpload(key, event.target.files)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-slate-900/70 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Strong listing checklist
                </div>
                <div className="space-y-2 text-sm leading-6 text-emerald-900 dark:text-emerald-100">
                  <p>Upload all 4 angles so reviewers can verify the car fast.</p>
                  <p>Keep the basics tight so the fleet card is ready right after submit.</p>
                  <p>New company vehicles still submit separately from peer-host by owner type.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          {submitError ? (
            <p className="mr-auto text-sm text-rose-600 dark:text-rose-400">
              {submitError}
            </p>
          ) : null}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving vehicle
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add car to fleet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
