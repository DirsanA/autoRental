"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Shield,
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
  Fuel,
  Gauge,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

type HostStep = "car" | "documents" | "protection" | "pricing" | "terms";
type PhotoKey = "front" | "back" | "side" | "interior";
type DocumentKey = "nationalId" | "ownership" | "insurance" | "license";

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: string;
  type: string;
}

export function PeerHostBecomeHostPage() {
  const [step, setStep] = useState<HostStep>("car");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photos, setPhotos] = useState<Record<PhotoKey, UploadedFile | null>>({
    front: null,
    back: null,
    side: null,
    interior: null,
  });
  
  const [documents, setDocuments] = useState<Record<DocumentKey, UploadedFile | null>>({
    nationalId: null,
    ownership: null,
    insurance: null,
    license: null,
  });

  const [selectedProtection, setSelectedProtection] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    plate: "",
    mileage: "",
    fuel: "",
    transmission: "",
    features: "",
    condition: "",
    price: "",
    weeklyDiscount: "",
    monthlyDiscount: "",
    availability: "",
    delivery: "",
  });

  const steps = [
    { id: "car", label: "Car Details", icon: Car },
    { id: "documents", label: "Documents", icon: FileCheck },
    { id: "protection", label: "Protection", icon: Shield },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "terms", label: "Submit", icon: FileText },
  ] as const;

  const currentStepIndex = steps.findIndex(s => s.id === step);

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
              
              <h2 className="mb-2 font-bold dark:text-white text-xl sm:text-2xl">Application Under Review</h2>
              <p className="mb-4 sm:mb-6 text-muted-foreground dark:text-slate-400 text-sm sm:text-base">
                Your documents are being verified by our admin team. This usually takes 24-48 hours.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800 mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl text-left">
                <h3 className="flex items-center gap-2 mb-3 sm:mb-4 font-semibold dark:text-slate-200 text-sm sm:text-base">
                  <FileCheck className="w-4 h-4" />
                  Submitted Documents
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(documents).map(([key, file]) => (
                    file && (
                      <div key={key} className="flex sm:flex-row flex-col justify-between sm:items-center gap-2 bg-white dark:bg-slate-900 p-3 border dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg shrink-0">
                            <IdCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium dark:text-slate-200 text-sm truncate">
                              {key === 'nationalId' && 'National ID'}
                              {key === 'ownership' && 'Ownership Certificate'}
                              {key === 'insurance' && 'Insurance'}
                              {key === 'license' && "Driver's License"}
                            </p>
                            <p className="text-muted-foreground dark:text-slate-400 text-xs truncate">{file.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="self-start sm:self-center bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
                          Pending
                        </Badge>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-row flex-col justify-center gap-3">
                <Button variant="outline" className="gap-2 dark:hover:bg-slate-800 dark:border-slate-700 w-full sm:w-auto dark:text-slate-200">
                  <Eye className="w-4 h-4" />
                  View Application
                </Button>
                <Button className="gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 w-full sm:w-auto text-white dark:text-black">
                  <Bell className="w-4 h-4" />
                  Notify Me
                </Button>
              </div>

              <p className="mt-4 sm:mt-6 text-muted-foreground dark:text-slate-400 text-xs">
                You'll receive an email once your verification is complete
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
      setPhotos(prev => ({
        ...prev,
        [key]: {
          file,
          preview: reader.result as string,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          type: file.type
        }
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleDocumentUpload(key: DocumentKey, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments(prev => ({
        ...prev,
        [key]: {
          file,
          preview: reader.result as string,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          type: file.type
        }
      }));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(key: PhotoKey) {
    setPhotos(prev => ({ ...prev, [key]: null }));
  }

  function removeDocument(key: DocumentKey) {
    setDocuments(prev => ({ ...prev, [key]: null }));
  }

  const isStepComplete = () => {
    switch (step) {
      case "car":
        return formData.make && formData.model && formData.year && 
               Object.values(photos).filter(Boolean).length >= 4;
      case "documents":
        return documents.nationalId && documents.ownership && 
               documents.insurance && documents.license;
      case "protection":
        return selectedProtection !== null;
      case "pricing":
        return formData.price;
      default:
        return true;
    }
  };

  function handleSubmit() {
    setIsSubmitted(true);
    // In real app, send data to API
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
                List your car and start earning in 5 simple steps
              </p>
            </div>
            
            <Badge variant="outline" className="px-3 sm:px-4 py-1 sm:py-2 dark:border-slate-700 w-fit dark:text-slate-300 text-xs sm:text-sm">
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
                      <div className={cn(
                        "z-10 relative flex justify-center items-center rounded-full w-8 sm:w-10 h-8 sm:h-10 transition-all",
                        isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110" : 
                        isCompleted ? "bg-emerald-500 text-white" : 
                        "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" /> : <Icon className="w-4 sm:w-5 h-4 sm:h-5" />}
                      </div>
                      <span className={cn(
                        "mt-1 sm:mt-2 font-medium text-[10px] sm:text-xs whitespace-nowrap",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground dark:text-slate-400"
                      )}>
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
                  return <IconComponent className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 dark:text-blue-400" />;
                })()}
                <span className="truncate">{steps[currentStepIndex].label}</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* STEP 1: Car Details */}
              {step === "car" && (
                <>
                  {/* Basic Info Grid */}
                  <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">Make</Label>
                      <Input 
                        placeholder="e.g. Toyota"
                        value={formData.make}
                        onChange={(e) => setFormData({...formData, make: e.target.value})}
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">Model</Label>
                      <Input 
                        placeholder="e.g. Corolla"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">Year</Label>
                      <Input 
                        placeholder="e.g. 2022"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* VIN & Plate */}
                  <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">VIN</Label>
                      <Input 
                        placeholder="Vehicle Identification Number"
                        value={formData.vin}
                        onChange={(e) => setFormData({...formData, vin: e.target.value})}
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">License Plate</Label>
                      <Input 
                        placeholder="e.g. GR 1234-22"
                        value={formData.plate}
                        onChange={(e) => setFormData({...formData, plate: e.target.value})}
                        className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Specs with Dropdowns */}
                  <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground dark:text-slate-400 text-xs">
                        <Gauge className="w-3 h-3" /> Mileage
                      </Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 45000"
                        value={formData.mileage}
                        onChange={(e) => setFormData({...formData, mileage: e.target.value})}
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
                        onValueChange={(value) => setFormData({...formData, fuel: value})}
                      >
                        <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:text-slate-200 text-sm">
                          <SelectValue placeholder="Select fuel type" className="dark:placeholder:text-slate-500" />
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
                        onValueChange={(value) => setFormData({...formData, transmission: value})}
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
                  </div>

                  {/* Photo Upload Grid */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-muted-foreground dark:text-slate-400 text-xs">Car Photos (4 required)</Label>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        Object.values(photos).filter(Boolean).length >= 4 ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" : "dark:border-slate-700 dark:text-slate-400"
                      )}>
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
                                      const input = document.getElementById(`photo-${key}`) as HTMLInputElement;
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
                                <span className="font-medium text-[10px] text-slate-600 dark:text-slate-300 sm:text-xs">{label}</span>
                                <span className="mt-0.5 sm:mt-1 text-[8px] text-muted-foreground sm:text-[10px] dark:text-slate-400">Upload</span>
                              </label>
                            )}
                            <input
                              id={`photo-${key}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(key, e.target.files)}
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
                      Upload clear photos of your documents. They will be verified by our admin team.
                    </p>
                  </div>

                  {[
                    { key: "nationalId" as DocumentKey, label: "National ID", description: "Front and back of your ID" },
                    { key: "ownership" as DocumentKey, label: "Vehicle Ownership", description: "Proof of ownership" },
                    { key: "insurance" as DocumentKey, label: "Insurance", description: "Valid insurance policy" },
                    { key: "license" as DocumentKey, label: "Driver's License", description: "Valid driving license" },
                  ].map(({ key, label, description }) => {
                    const doc = documents[key];
                    
                    return (
                      <div key={key} className="space-y-1 sm:space-y-2">
                        <Label className="text-muted-foreground dark:text-slate-400 text-xs">{label}</Label>
                        <p className="mb-1 sm:mb-2 text-[10px] text-muted-foreground dark:text-slate-400 sm:text-xs">{description}</p>
                        
                        {doc ? (
                          <div className="flex justify-between items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 sm:p-3 border dark:border-slate-700 rounded-lg">
                            <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
                              <div className="bg-white dark:bg-slate-700 p-1.5 sm:p-2 rounded-lg shrink-0">
                                <IdCard className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium dark:text-slate-200 text-xs sm:text-sm truncate">{doc.name}</p>
                                <p className="text-[10px] text-muted-foreground dark:text-slate-400 sm:text-xs">{doc.size}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 sm:gap-2 shrink-0">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="dark:hover:bg-slate-700 w-7 sm:w-8 h-7 sm:h-8 dark:text-slate-400"
                                onClick={() => window.open(doc.preview, '_blank')}
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
                              <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">Click to upload</span>
                            </div>
                          </label>
                        )}
                        <input
                          id={`doc-${key}`}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload(key, e.target.files)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STEP 3: Protection */}
              {step === "protection" && (
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      id: "standard",
                      title: "Standard Protection",
                      desc: "Basic coverage for peace of mind",
                      features: ["Basic liability", "Roadside assistance", "Theft protection"],
                      price: "15%"
                    },
                    {
                      id: "premium",
                      title: "Premium Protection",
                      desc: "Comprehensive coverage",
                      features: ["Full liability", "Premium assistance", "Full damage cover"],
                      price: "20%"
                    },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedProtection(plan.id)}
                      className={cn(
                        "p-3 sm:p-4 border-2 rounded-xl w-full text-left transition-all",
                        selectedProtection === plan.id 
                          ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/50" 
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <h3 className="font-semibold dark:text-slate-200 text-sm sm:text-base">{plan.title}</h3>
                        <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300 text-xs">{plan.price}</Badge>
                      </div>
                      <p className="mb-2 text-muted-foreground dark:text-slate-400 text-xs sm:text-sm">{plan.desc}</p>
                      <ul className="space-y-0.5 sm:space-y-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1 sm:gap-2 dark:text-slate-300 text-xs sm:text-sm">
                            <CheckCircle2 className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 4: Pricing */}
              {step === "pricing" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-muted-foreground dark:text-slate-400 text-xs">Daily Price (ETB)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 1500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="bg-slate-100 dark:bg-slate-800 border-0 h-9 sm:h-10 dark:placeholder:text-slate-500 dark:text-slate-200 text-sm"
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
                      Your application will be reviewed by our admin team. This typically takes 24-48 hours.
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <p className="dark:text-slate-300 text-xs sm:text-sm">By submitting, you confirm:</p>
                    <ul className="space-y-1 sm:space-y-2">
                      {[
                        "All information provided is accurate",
                        "You own this vehicle or have authority to list it",
                        "Documents are genuine and valid",
                        "You agree to AutoRent's terms and conditions"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-1 sm:gap-2 dark:text-slate-300 text-xs sm:text-sm">
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
                <h3 className="font-semibold text-[10px] text-muted-foreground dark:text-slate-400 sm:text-xs uppercase">Completion</h3>
                
                {[
                  { label: "Car Details", complete: formData.make && formData.model && Object.values(photos).filter(Boolean).length >= 4 },
                  { label: "Documents", complete: documents.nationalId && documents.ownership && documents.insurance },
                  { label: "Protection", complete: selectedProtection !== null },
                  { label: "Pricing", complete: !!formData.price },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="dark:text-slate-300 text-xs sm:text-sm">{item.label}</span>
                    {item.complete ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 border-0 text-[10px] text-emerald-700 dark:text-emerald-400 sm:text-xs">Done</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-[10px] text-amber-600 dark:text-amber-400 sm:text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation */}
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
                    disabled={!isStepComplete()}
                    className="flex-1 gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500 hover:from-emerald-600 dark:from-emerald-600 dark:hover:from-emerald-700 to-green-600 hover:to-green-700 dark:hover:to-green-800 dark:to-green-700 h-8 sm:h-10 text-white text-xs sm:text-sm"
                  >
                    Submit
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