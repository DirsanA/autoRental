"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Car,
  DollarSign,
  FileText,
  Upload,
  X,
  IdCard,
  FileCheck,
  Clock,
  AlertCircle,
  Eye,
  Bell,
  Plus,
  Fuel,
  Gauge,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import Image from "next/image";

type HostStep = "car" | "documents" | "pricing" | "terms";
type PhotoKey = "front" | "back" | "side" | "interior";
type DocumentKey = "ownership" | "insurance";

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: string;
  type: string;
}

const suggestedFeatures = [
  "Bluetooth",
  "Backup Camera",
  "Heated Seats",
  "Lane Assist",
  "Keyless Entry",
  "USB Ports",
  "Sunroof",
  "Premium Sound",
];

export function PeerHostBecomeHostPage() {
  const apiBaseUrl = resolveApiBaseUrl();
  const [step, setStep] = useState<HostStep>("car");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [photos, setPhotos] = useState<Record<PhotoKey, UploadedFile | null>>({
    front: null,
    back: null,
    side: null,
    interior: null,
  });

  const [documents, setDocuments] = useState<
    Record<DocumentKey, UploadedFile | null>
  >({
    ownership: null,
    insurance: null,
  });

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    plate: "",
    mileage: "",
    fuel: "",
    transmission: "",
    seats: "",
    features: [] as string[],
    condition: "",
    price: "",
    weeklyDiscount: "",
    monthlyDiscount: "",
    availability: "",
    delivery: "",
    pickupAddress: "",
    returnAddress: "",
    sameReturnAsPickup: true,
  });

  const steps = [
    { id: "car", label: "Car Details", icon: Car },
    { id: "documents", label: "Documents", icon: FileCheck },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "terms", label: "Submit", icon: FileText },
  ] as const;

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  // If already submitted, show pending approval screen
  if (isSubmitted) {
    return (
      <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-50 dark:from-slate-950 to-white dark:to-slate-900 overflow-hidden">
        <Header />
        <Main className="mx-auto px-4 py-8 sm:py-12 max-w-3xl container">
          <Card className="dark:bg-slate-900 shadow-xl dark:border border-0 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 dark:from-amber-600 to-yellow-500 dark:to-yellow-600 h-2" />
            <CardContent className="p-4 sm:p-8 text-center">
              <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-950 mx-auto mb-4 sm:mb-6 rounded-full w-16 sm:w-20 h-16 sm:h-20">
                <Clock className="w-8 sm:w-10 h-8 sm:h-10 text-amber-600 dark:text-amber-400" />
              </div>

              <h2 className="mb-2 font-bold dark:text-white text-xl sm:text-2xl">
                Application Under Review
              </h2>
              <p className="mb-4 sm:mb-6 text-muted-foreground dark:text-slate-400 text-sm sm:text-base">
                Your documents are being verified by our admin team. This
                usually takes 24-48 hours.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800 mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl text-left">
                <h3 className="flex items-center gap-2 mb-3 sm:mb-4 font-semibold dark:text-slate-200 text-sm sm:text-base">
                  <FileCheck className="w-4 h-4" />
                  Submitted Documents
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(documents).map(
                    ([key, file]) =>
                      file && (
                        <div
                          key={key}
                          className="flex sm:flex-row flex-col justify-between sm:items-center gap-2 bg-white dark:bg-slate-900 p-3 border dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg shrink-0">
                              <IdCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium dark:text-slate-200 text-sm truncate">
                                {key === "ownership" && "Ownership Certificate"}
                                {key === "insurance" && "Insurance"}
                              </p>
                              <p className="text-muted-foreground dark:text-slate-400 text-xs truncate">
                                {file.name}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="self-start sm:self-center bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                          >
                            Pending
                          </Badge>
                        </div>
                      ),
                  )}
                </div>
              </div>

              <div className="flex sm:flex-row flex-col justify-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2 dark:hover:bg-slate-800 dark:border-slate-700 w-full sm:w-auto dark:text-slate-200"
                >
                  <Eye className="w-4 h-4" />
                  View Application
                </Button>
                <Button className="gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 w-full sm:w-auto text-white dark:text-black">
                  <Bell className="w-4 h-4" />
                  Notify Me
                </Button>
              </div>

              <p className="mt-4 sm:mt-6 text-muted-foreground dark:text-slate-400 text-xs">
                You&apos;ll receive an email once your verification is complete
              </p>
            </CardContent>
          </Card>
        </Main>
      </div>
    );
  }

  function handlePhotoUpload(key: PhotoKey, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos((prev) => ({
        ...prev,
        [key]: {
          file,
          preview: reader.result as string,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          type: file.type,
        },
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleDocumentUpload(key: DocumentKey, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments((prev) => ({
        ...prev,
        [key]: {
          file,
          preview: reader.result as string,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          type: file.type,
        },
      }));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(key: PhotoKey) {
    setPhotos((prev) => ({ ...prev, [key]: null }));
  }

  function removeDocument(key: DocumentKey) {
    setDocuments((prev) => ({ ...prev, [key]: null }));
  }

  function addFeature(feature: string) {
    const normalized = feature.trim();
    if (!normalized) return;

    setFormData((prev) => {
      if (
        prev.features.some(
          (item) => item.toLowerCase() === normalized.toLowerCase(),
        )
      ) {
        return prev;
      }

      return { ...prev, features: [...prev.features, normalized] };
    });
    setNewFeature("");
  }

  function removeFeature(index: number) {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }

  const parseOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const parseRequiredNumber = (value: string) => {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const yearNumber = parseRequiredNumber(formData.year);
  const seatsNumber = parseRequiredNumber(formData.seats);
  const priceNumber = parseRequiredNumber(formData.price);

  const isCarStepComplete =
    !!formData.make.trim() &&
    !!formData.model.trim() &&
    !!yearNumber &&
    yearNumber >= 1900 &&
    yearNumber <= 2100 &&
    !!seatsNumber &&
    seatsNumber >= 1 &&
    formData.features.length > 0 &&
    Object.values(photos).filter(Boolean).length >= 4;

  const isDocumentsStepComplete =
    !!documents.ownership && !!documents.insurance;

  const isPricingStepComplete = !!priceNumber && priceNumber >= 0;

  const isStepComplete = () => {
    switch (step) {
      case "car":
        return isCarStepComplete;
      case "documents":
        return isDocumentsStepComplete;
      case "pricing":
        return isPricingStepComplete;
      case "terms":
        return (
          isCarStepComplete && isDocumentsStepComplete && isPricingStepComplete
        );
      default:
        return true;
    }
  };

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const mileageNumber = parseOptionalNumber(formData.mileage);
      const weeklyDiscountNumber = parseOptionalNumber(formData.weeklyDiscount);
      const monthlyDiscountNumber = parseOptionalNumber(
        formData.monthlyDiscount,
      );

      if (!yearNumber || yearNumber < 1900 || yearNumber > 2100) {
        throw new Error("Year must be a valid number between 1900 and 2100");
      }
      if (!seatsNumber || seatsNumber < 1) {
        throw new Error("Seats must be at least 1");
      }
      if (priceNumber === undefined || priceNumber < 0) {
        throw new Error("Price must be a valid number");
      }
      if (!photos.front || !photos.back || !photos.side || !photos.interior) {
        throw new Error("Please upload all 4 required car photos");
      }
      if (!documents.ownership || !documents.insurance) {
        throw new Error("Please upload ownership and insurance documents");
      }

      const payload = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: yearNumber,
        vin: formData.vin.trim() || undefined,
        plate: formData.plate.trim(),

        mileage: mileageNumber,
        fuel: formData.fuel || undefined,
        transmission: formData.transmission || undefined,
        seats: seatsNumber,
        features: formData.features,
        condition: formData.condition.trim() || undefined,

        price: priceNumber,
        weeklyDiscount: weeklyDiscountNumber,
        monthlyDiscount: monthlyDiscountNumber,
        availability: formData.availability.trim() || undefined,
        delivery: formData.delivery.trim() || undefined,
        pickupAddress: formData.pickupAddress.trim() || undefined,
        returnAddress: formData.sameReturnAsPickup
          ? formData.pickupAddress.trim() || undefined
          : formData.returnAddress.trim() || undefined,

        photos: {
          front: photos.front.preview,
          back: photos.back.preview,
          side: photos.side.preview,
          interior: photos.interior.preview,
        },
        documents: {
          ownership: documents.ownership.preview,
          insurance: documents.insurance.preview,
        },
      };

      const response = await fetch(`${apiBaseUrl}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeader(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        const detail = result?.error?.details?.[0];
        const detailMessage =
          detail && typeof detail.field === "string"
            ? `${detail.field}: ${detail.message}`
            : null;
        throw new Error(
          detailMessage || result?.error?.message || "Failed to submit vehicle",
        );
      }

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit vehicle",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-50 dark:from-slate-950 to-white dark:to-slate-900 overflow-hidden">
      <Header />

      <Main className="mx-auto px-4 py-4 sm:py-8 max-w-7xl container">
        {/* Header - Fixed for mobile */}
        <div className="mb-6 sm:mb-10">
          <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="bg-gradient-to-br from-blue-500 dark:from-blue-600 to-indigo-600 dark:to-indigo-700 shadow-lg p-2 sm:p-2.5 rounded-xl shrink-0">
                  <Car className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                </div>
                <h1 className="bg-clip-text bg-gradient-to-r from-slate-900 dark:from-slate-100 to-slate-600 dark:to-slate-400 font-bold text-transparent text-xl sm:text-3xl">
                  Become a Host
                </h1>
              </div>
              <p className="text-muted-foreground dark:text-slate-400 text-xs sm:text-sm">
                List your car and start earning in 4 simple steps
              </p>
            </div>

            <Badge
              variant="outline"
              className="px-3 sm:px-4 py-1 sm:py-2 dark:border-slate-700 w-fit dark:text-slate-300 text-xs sm:text-sm"
            >
              Step {currentStepIndex + 1}/{steps.length}
            </Badge>
          </div>

          {/* Progress Steps - Scrollable on mobile */}
          <div className="-mx-4 px-4 pb-2 overflow-x-auto">
            <div className="relative flex justify-between items-center min-w-[500px] sm:min-w-0">
              <div className="top-1/2 right-0 left-0 absolute bg-slate-200 dark:bg-slate-800 h-0.5 -translate-y-1/2" />
              <div className="relative flex justify-between w-full">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = step === s.id;
                  const isCompleted = currentStepIndex > idx;

                  return (
                    <div key={s.id} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "z-10 relative flex justify-center items-center rounded-full w-8 sm:w-10 h-8 sm:h-10 transition-all",
                          isActive
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                            : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500",
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" />
                        ) : (
                          <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-1 sm:mt-2 font-medium text-[10px] sm:text-xs whitespace-nowrap",
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-muted-foreground dark:text-slate-400",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="gap-4 sm:gap-6 grid lg:grid-cols-3">
          {/* Left Column - Main Form */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800">
            <CardHeader className="p-4 sm:p-6 border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-base sm:text-lg">
                {(() => {
                  const IconComponent = steps[currentStepIndex].icon;
                  return (
                    <IconComponent className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 dark:text-blue-400" />
                  );
                })()}
                <span className="truncate">
                  {steps[currentStepIndex].label}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* STEP 1: Car Details */}
              {step === "car" && (
                <>
                  {/* Basic Info Grid */}
                  <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        Make
                      </Label>
                      <Input
                        placeholder="e.g. Toyota"
                        value={formData.make}
                        onChange={(e) =>
                          setFormData({ ...formData, make: e.target.value })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        Model
                      </Label>
                      <Input
                        placeholder="e.g. Corolla"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        Year
                      </Label>
                      <Input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="e.g. 2022"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* VIN & Plate */}
                  <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        VIN
                      </Label>
                      <Input
                        placeholder="Vehicle Identification Number"
                        value={formData.vin}
                        onChange={(e) =>
                          setFormData({ ...formData, vin: e.target.value })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        License Plate
                      </Label>
                      <Input
                        placeholder="e.g. GR 1234-22"
                        value={formData.plate}
                        onChange={(e) =>
                          setFormData({ ...formData, plate: e.target.value })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Specs with Dropdowns */}
                  <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground dark:text-slate-400 text-xs">
                        <Gauge className="w-3 h-3" /> Mileage
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 45000"
                        value={formData.mileage}
                        onChange={(e) =>
                          setFormData({ ...formData, mileage: e.target.value })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>

                    {/* Fuel Type Dropdown */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground dark:text-slate-400 text-xs">
                        <Fuel className="w-3 h-3" /> Fuel Type
                      </Label>
                      <Select
                        value={formData.fuel}
                        onValueChange={(value) =>
                          setFormData({ ...formData, fuel: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:text-slate-200 text-sm">
                          <SelectValue
                            placeholder="Select fuel type"
                            className="dark:placeholder:text-slate-500"
                          />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transmission Dropdown */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground dark:text-slate-400 text-xs">
                        <Settings className="w-3 h-3" /> Transmission
                      </Label>
                      <Select
                        value={formData.transmission}
                        onValueChange={(value) =>
                          setFormData({ ...formData, transmission: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:text-slate-200 text-sm">
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="cvt">CVT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Seats */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground dark:text-slate-400 text-xs">
                        <Users className="w-3 h-3" /> Seats
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 5"
                        value={formData.seats}
                        onChange={(e) =>
                          setFormData({ ...formData, seats: e.target.value })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        Car Features (at least 1)
                      </Label>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          formData.features.length > 0
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                            : "dark:border-slate-700 dark:text-slate-400",
                        )}
                      >
                        {formData.features.length} added
                      </Badge>
                    </div>

                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <Badge
                            key={`${feature}-${index}`}
                            className="gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300"
                          >
                            {feature}
                            <X
                              className="w-3 h-3 hover:text-red-500 cursor-pointer"
                              onClick={() => removeFeature(index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature..."
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature(newFeature);
                          }
                        }}
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="dark:hover:bg-slate-700 dark:border-slate-700 w-9 sm:w-10 h-9 sm:h-10"
                        onClick={() => addFeature(newFeature)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {suggestedFeatures.map((feature) => {
                        const isSelected = formData.features.some(
                          (item) =>
                            item.toLowerCase() === feature.toLowerCase(),
                        );

                        return (
                          <Button
                            key={feature}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={isSelected}
                            className={cn(
                              "h-7 rounded-full px-3 text-[10px] sm:text-xs",
                              isSelected
                                ? "bg-blue-600 hover:bg-blue-600 text-white"
                                : "dark:border-slate-700 dark:text-slate-300",
                            )}
                            onClick={() => addFeature(feature)}
                          >
                            {feature}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Photo Upload Grid */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        Car Photos (4 required)
                      </Label>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          Object.values(photos).filter(Boolean).length >= 4
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                            : "dark:border-slate-700 dark:text-slate-400",
                        )}
                      >
                        {Object.values(photos).filter(Boolean).length}/4
                      </Badge>
                    </div>

                    <div className="gap-3 sm:gap-4 grid grid-cols-2">
                      {[
                        { key: "front" as PhotoKey, label: "Front" },
                        { key: "back" as PhotoKey, label: "Rear" },
                        { key: "side" as PhotoKey, label: "Side" },
                        { key: "interior" as PhotoKey, label: "Interior" },
                      ].map(({ key, label }) => {
                        const photo = photos[key];

                        return (
                          <div key={key} className="group relative">
                            {photo ? (
                              <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg sm:rounded-xl aspect-[4/3] overflow-hidden">
                                <img
                                  src={photo.preview}
                                  alt={label}
                                  className="dark:brightness-90 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex justify-center items-center gap-1 sm:gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full w-6 sm:w-8 h-6 sm:h-8"
                                    onClick={() => {
                                      const input = document.getElementById(
                                        `photo-${key}`,
                                      ) as HTMLInputElement;
                                      input?.click();
                                    }}
                                  >
                                    <Upload className="w-3 sm:w-4 h-3 sm:h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="rounded-full w-6 sm:w-8 h-6 sm:h-8"
                                    onClick={() => removePhoto(key)}
                                  >
                                    <X className="w-3 sm:w-4 h-3 sm:h-4" />
                                  </Button>
                                </div>
                                <Badge className="top-1 sm:top-2 left-1 sm:left-2 absolute bg-black/50 border-0 text-[10px] text-white sm:text-xs">
                                  {label}
                                </Badge>
                              </div>
                            ) : (
                              <label
                                htmlFor={`photo-${key}`}
                                className="group flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-800 p-2 border-2 border-slate-300 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400 border-dashed rounded-lg sm:rounded-xl aspect-[4/3] transition-colors cursor-pointer"
                              >
                                <Camera className="mb-1 sm:mb-2 w-6 sm:w-8 h-6 sm:h-8 text-slate-400 dark:group-hover:text-blue-400 dark:text-slate-500 group-hover:text-blue-500" />
                                <span className="font-medium text-[10px] text-slate-600 dark:text-slate-300 sm:text-xs">
                                  {label}
                                </span>
                                <span className="mt-0.5 sm:mt-1 text-[8px] text-muted-foreground sm:text-[10px] dark:text-slate-400">
                                  Upload
                                </span>
                              </label>
                            )}
                            <input
                              id={`photo-${key}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handlePhotoUpload(key, e.target.files)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: Documents */}
              {step === "documents" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex gap-3 bg-blue-50 dark:bg-blue-950/50 p-3 sm:p-4 border border-blue-100 dark:border-blue-900 rounded-lg">
                    <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                      Upload clear photos of your documents. They will be
                      verified by our admin team.
                    </p>
                  </div>

                  {[
                    {
                      key: "ownership" as DocumentKey,
                      label: "Vehicle Ownership",
                      description: "Proof of ownership",
                    },
                    {
                      key: "insurance" as DocumentKey,
                      label: "Insurance",
                      description: "Valid insurance policy",
                    },
                  ].map(({ key, label, description }) => {
                    const doc = documents[key];

                    return (
                      <div key={key} className="space-y-1 sm:space-y-2">
                        <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                          {label}
                        </Label>
                        <p className="mb-1 sm:mb-2 text-[10px] text-muted-foreground dark:text-slate-400 sm:text-xs">
                          {description}
                        </p>

                        {doc ? (
                          <div className="flex justify-between items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 sm:p-3 border dark:border-slate-700 rounded-lg">
                            <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
                              <div className="bg-white dark:bg-slate-700 p-1.5 sm:p-2 rounded-lg shrink-0">
                                <IdCard className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium dark:text-slate-200 text-xs sm:text-sm truncate">
                                  {doc.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground dark:text-slate-400 sm:text-xs">
                                  {doc.size}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1 sm:gap-2 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="dark:hover:bg-slate-700 w-7 sm:w-8 h-7 sm:h-8 dark:text-slate-400"
                                onClick={() =>
                                  window.open(doc.preview, "_blank")
                                }
                              >
                                <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="dark:hover:bg-slate-700 w-7 sm:w-8 h-7 sm:h-8 text-red-500 dark:text-red-400"
                                onClick={() => removeDocument(key)}
                              >
                                <X className="w-3 sm:w-4 h-3 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor={`doc-${key}`}
                            className="group flex justify-between items-center p-3 sm:p-4 border-2 border-slate-300 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400 border-dashed rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Upload className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400 dark:group-hover:text-blue-400 dark:text-slate-500 group-hover:text-blue-500" />
                              <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                                Click to upload
                              </span>
                            </div>
                          </label>
                        )}
                        <input
                          id={`doc-${key}`}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(key, e.target.files)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {/* STEP 4: Pricing */}
              {step === "pricing" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                      Daily Price (ETB)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 1500"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                      Pickup address (shown approximately on listing)
                    </Label>
                    <Input
                      placeholder="e.g. Bole, Addis Ababa"
                      value={formData.pickupAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupAddress: e.target.value })
                      }
                      className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">
                        Return address
                      </Label>
                      <label className="flex items-center gap-2 text-[11px] text-muted-foreground dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={formData.sameReturnAsPickup}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sameReturnAsPickup: e.target.checked,
                            })
                          }
                        />
                        Same as pickup
                      </label>
                    </div>
                    <Input
                      placeholder="Optional (if different)"
                      disabled={formData.sameReturnAsPickup}
                      value={formData.returnAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, returnAddress: e.target.value })
                      }
                      className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm disabled:opacity-60"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Terms */}
              {step === "terms" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-950/50 p-3 sm:p-4 border border-amber-100 dark:border-amber-900 rounded-lg">
                    <h3 className="flex items-center gap-2 mb-2 font-semibold dark:text-amber-300 text-sm sm:text-base">
                      <AlertCircle className="w-4 h-4" />
                      Before submitting
                    </h3>
                    <p className="text-muted-foreground dark:text-amber-400 text-xs sm:text-sm">
                      Your application will be reviewed by our admin team. This
                      typically takes 24-48 hours.
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <p className="dark:text-slate-300 text-xs sm:text-sm">
                      By submitting, you confirm:
                    </p>
                    <ul className="space-y-1 sm:space-y-2">
                      {[
                        "All information provided is accurate",
                        "You own this vehicle or have authority to list it",
                        "Documents are genuine and valid",
                        "You agree to AutoRent's terms and conditions",
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1 sm:gap-2 dark:text-slate-300 text-xs sm:text-sm"
                        >
                          <CheckCircle2 className="mt-0.5 w-3 sm:w-4 h-3 sm:h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Summary */}
          <Card className="top-4 sticky bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800 h-fit">
            <CardHeader className="p-4 sm:p-6 border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-sm sm:text-base">
                <FileText className="w-4 h-4" />
                Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Progress Overview */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-[10px] text-muted-foreground dark:text-slate-400 sm:text-xs uppercase">
                  Completion
                </h3>

                {[
                  { label: "Car Details", complete: isCarStepComplete },
                  { label: "Documents", complete: isDocumentsStepComplete },
                  { label: "Pricing", complete: isPricingStepComplete },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="dark:text-slate-300 text-xs sm:text-sm">
                      {item.label}
                    </span>
                    {item.complete ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 border-0 text-[10px] text-emerald-700 dark:text-emerald-400 sm:text-xs">
                        Done
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-[10px] text-amber-600 dark:text-amber-400 sm:text-xs"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              {submitError && (
                <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm text-center">
                  {submitError}
                </p>
              )}
              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                <Button
                  variant="outline"
                  disabled={step === "car"}
                  onClick={() => {
                    const prev = steps[currentStepIndex - 1].id;
                    setStep(prev as HostStep);
                  }}
                  className="flex-1 gap-1 sm:gap-2 dark:hover:bg-slate-800 dark:border-slate-700 h-8 sm:h-10 dark:text-slate-200 text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3 sm:w-4 h-3 sm:h-4" />
                  Back
                </Button>

                {step === "terms" ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepComplete() || isSubmitting}
                    className="flex-1 gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500 hover:from-emerald-600 dark:from-emerald-600 dark:hover:from-emerald-700 to-green-600 hover:to-green-700 dark:hover:to-green-800 dark:to-green-700 h-8 sm:h-10 text-white text-xs sm:text-sm"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                    <CheckCircle2 className="w-3 sm:w-4 h-3 sm:h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const next = steps[currentStepIndex + 1].id;
                      setStep(next as HostStep);
                    }}
                    disabled={!isStepComplete()}
                    className="flex-1 gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 hover:from-blue-600 dark:from-blue-600 dark:hover:from-blue-700 to-indigo-600 hover:to-indigo-700 dark:hover:to-indigo-800 dark:to-indigo-700 h-8 sm:h-10 text-white text-xs sm:text-sm"
                  >
                    Next
                    <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                  </Button>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground dark:text-slate-400 sm:text-xs text-center">
                Documents verified by admin
              </p>
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  );
}
