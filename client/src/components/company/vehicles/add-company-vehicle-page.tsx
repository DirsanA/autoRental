"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitCompanyVehicle } from "./api";
import { upsertCompanyFleetVehicle } from "./storage";

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
  allowSelfDrive: boolean;
  securityDepositAmount: string;
  initialAvailability: "AVAILABLE" | "MAINTENANCE";
  mileage: string;
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  transmission: "automatic" | "manual" | "cvt";
  seats: string;
  features: string[];
  description: string;
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
  allowSelfDrive: false,
  securityDepositAmount: "",
  initialAvailability: "AVAILABLE",
  mileage: "",
  fuel: "petrol",
  transmission: "automatic",
  seats: "5",
  features: [],
  description: "",
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

export function AddCompanyVehiclePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftVehicle>(defaultDraft);
  const [newFeature, setNewFeature] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      if (
        current.features.some(
          (item) => item.toLowerCase() === value.toLowerCase(),
        )
      ) {
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
      const securityDeposit = draft.securityDepositAmount.trim()
        ? Number(draft.securityDepositAmount)
        : 0;

      if (!draft.make.trim()) throw new Error("Make is required.");
      if (!draft.model.trim()) throw new Error("Model is required.");
      if (!draft.plate.trim()) throw new Error("Plate number is required.");
      if (!Number.isFinite(year) || year < 1900 || year > 2100) {
        throw new Error("Year must be between 1900 and 2100.");
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Daily rate must be a valid number.");
      }
      if (
        draft.allowSelfDrive &&
        (!Number.isFinite(securityDeposit) || securityDeposit <= 0)
      ) {
        throw new Error("Self-drive vehicles require a security deposit above 0.");
      }
      if (!Number.isFinite(seats) || seats < 1) {
        throw new Error("Seats must be at least 1.");
      }
      if (
        !draft.photos.front ||
        !draft.photos.back ||
        !draft.photos.side ||
        !draft.photos.interior
      ) {
        throw new Error("Please upload all 4 required car photos.");
      }

      const vehicle: CompanyVehicle = await submitCompanyVehicle({
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
        allowSelfDrive: draft.allowSelfDrive,
        securityDepositAmount: draft.allowSelfDrive ? securityDeposit : 0,
        status: draft.initialAvailability,
        condition: draft.description.trim() || undefined,
        photos: {
          front: draft.photos.front.preview,
          back: draft.photos.back.preview,
          side: draft.photos.side.preview,
          interior: draft.photos.interior.preview,
        },
      });

      upsertCompanyFleetVehicle(vehicle);
      router.push("/company/fleetmangment");
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
    <div className="space-y-8 pb-8">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-2">
          <Button asChild variant="outline" className="rounded-xl w-fit">
            <Link href="/company/fleetmangment">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to fleet
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-slate-950 dark:text-white text-3xl tracking-tight">
              Add Vehicle
            </h1>
            
          </div>
        </div>
        <Badge className="bg-emerald-100 dark:bg-emerald-500/15 border-0 w-fit text-emerald-700 dark:text-emerald-300">
          Company fleet intake
        </Badge>
      </div>

      <div className="bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_34%),linear-gradient(135deg,#0f172a,#1e293b_55%,#0f172a)] px-6 py-6 border-slate-200 dark:border-slate-800 border-b text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 mb-4 px-3 py-1 border border-white/15 rounded-full w-fit font-medium text-white/80 text-xs">
            <CarFront className="w-3.5 h-3.5" />
            Company fleet intake
          </div>
          <h2 className="text-white text-2xl">Add a new car to your fleet</h2>
        </div>

        <div className="space-y-8 px-6 py-6">
          <div className="gap-8 grid xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 shadow-sm p-5 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Main details
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      The basics shown across your fleet dashboard.
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 dark:bg-emerald-500/15 border-0 text-emerald-700 dark:text-emerald-300">
                    Company quick add
                  </Badge>
                </div>

                <div className="gap-4 grid sm:grid-cols-2">
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
                        setDraft((current) => ({ ...current, vin: event.target.value }))
                      }
                      placeholder="Vehicle identification number"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 shadow-sm p-5 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Vehicle specs
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    These values help the detail page feel complete right away.
                  </p>
                </div>

                <div className="gap-4 grid sm:grid-cols-2">
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
                      <div className="flex flex-wrap gap-2 mb-3">
                        {draft.features.map((feature) => (
                          <Badge
                            key={feature}
                            className="gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-200"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="rounded-full"
                              aria-label={`Remove ${feature}`}
                            >
                              <X className="w-3 h-3" />
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
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
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
                            className="px-3 rounded-full h-8 text-xs"
                            onClick={() => addFeature(feature)}
                          >
                            {feature}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={draft.description}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, description: event.target.value }))
                      }
                      placeholder="Describe the vehicle condition and details..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 shadow-sm p-5 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Self-drive settings
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Control whether this vehicle can be rented without a driver and what refundable deposit is required.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={draft.allowSelfDrive}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          allowSelfDrive: event.target.checked,
                          securityDepositAmount: event.target.checked
                            ? current.securityDepositAmount
                            : "",
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Allow self-drive
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Approved self-drive renters can book this vehicle without a driver.
                      </p>
                    </div>
                  </label>

                  <div className="space-y-2">
                    <Label>Security deposit (ETB)</Label>
                    <Input
                      type="number"
                      min="0"
                      disabled={!draft.allowSelfDrive}
                      value={draft.securityDepositAmount}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          securityDepositAmount: event.target.value,
                        }))
                      }
                      placeholder="5000"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      This deposit is held in platform escrow and refunded to the renter wallet after a clean return.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/70 px-5 py-4 border-slate-200 dark:border-slate-800 border-b">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Car photos
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Match the host onboarding flow with all 4 required vehicle angles.
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-500 dark:text-slate-400 text-xs">
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

                  <div className="gap-4 grid grid-cols-2">
                    {photoSlots.map(({ key, label }) => {
                      const photo = draft.photos[key];

                      return (
                        <div key={key} className="group relative">
                          {photo ? (
                            <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl aspect-[4/3] overflow-hidden">
                              <img
                                src={photo.preview}
                                alt={label}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex justify-center items-center gap-2 bg-black/45 opacity-0 group-hover:opacity-100 transition">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="rounded-full w-8 h-8"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `company-photo-${key}`,
                                    ) as HTMLInputElement | null;
                                    input?.click();
                                  }}
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  className="rounded-full w-8 h-8"
                                  onClick={() => removePhoto(key)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <Badge className="top-2 left-2 absolute bg-black/55 border-0 text-white">
                                {label}
                              </Badge>
                            </div>
                          ) : (
                            <label
                              htmlFor={`company-photo-${key}`}
                              className="group flex flex-col justify-center items-center bg-slate-50 hover:bg-sky-50/70 dark:bg-slate-800 dark:hover:bg-slate-900 border-2 border-slate-300 hover:border-sky-400 dark:border-slate-700 dark:hover:border-sky-500 border-dashed rounded-2xl aspect-[4/3] transition cursor-pointer"
                            >
                              <Camera className="mb-2 w-7 h-7 text-slate-400 dark:group-hover:text-sky-400 dark:text-slate-500 group-hover:text-sky-500 transition" />
                              <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                                {label}
                              </span>
                              <span className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
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
                              void handlePhotoUpload(key, event.target.files)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/80 dark:bg-emerald-500/10 p-5 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl">
                <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/70 mb-3 px-3 py-1 rounded-full font-medium text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Strong listing checklist
                </div>
                <div className="space-y-2 text-emerald-900 dark:text-emerald-100 text-sm leading-6">
                  <p>Upload all 4 angles so reviewers can verify the car fast.</p>
                  <p>Keep the basics tight so the fleet card is ready right after submit.</p>
                  <p>New company vehicles still submit separately from peer-host by owner type.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-row flex-col sm:justify-end sm:items-center gap-3 px-6 py-4 border-slate-200 dark:border-slate-800 border-t">
          {submitError ? (
            <p className="mr-auto text-rose-600 dark:text-rose-400 text-sm">
              {submitError}
            </p>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/company/fleetmangment">Cancel</Link>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="bg-slate-950 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Saving vehicle
              </>
            ) : (
              <>
                <Plus className="mr-2 w-4 h-4" />
                Add car to fleet
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
