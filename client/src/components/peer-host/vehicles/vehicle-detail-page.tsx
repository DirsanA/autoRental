"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Star, 
  MapPin, 
  Fuel, 
  Settings, 
  Users,
  Calendar,
  Gauge,
  Wind,
  Snowflake,
  Bluetooth,
  Shield,
  Clock,
  ChevronLeft,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { cn } from "@/lib/utils";
import type { Vehicle, VehicleStatus } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the edit components
import { EditVehicleDialog } from "./edit-vehicle-dialog";
import { createEditableDetails } from "./edit-vehicle-data";
import type { EditableVehicleDetails } from "./edit-vehicle-types";
import {
  updatePeerHostVehicleAvailability,
  updatePeerHostVehicleById,
} from "./api";

function formatStatus(status: VehicleStatus) {
  switch (status) {
    case "available":
      return { text: "Available", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20", dot: "bg-emerald-500" };
    case "rented":
      return { text: "Rented", color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/20", dot: "bg-blue-500" };
    case "maintenance":
      return { text: "Maintenance", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/20", dot: "bg-amber-500" };
    case "pending_approval":
      return { text: "Pending approval", color: "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/20", dot: "bg-rose-500" };
    case "retired":
      return { text: "Retired", color: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800", dot: "bg-slate-500" };
  }
}

type PeerHostVehicleDetailPageProps = {
  vehicle: Vehicle;
  showHeader?: boolean;
  backHref?: string;
  controlsTitle?: string;
  removeActionLabel?: string;
  onUpdateAvailability?: (
    vehicle: Vehicle,
    acceptingBookings: boolean,
  ) => Promise<Vehicle>;
  onSaveDetails?: (
    vehicleId: string,
    updatedDetails: EditableVehicleDetails,
  ) => Promise<Vehicle>;
  onRemoveVehicle?: (vehicleId: string) => Promise<void>;
};

export function PeerHostVehicleDetailPage({
  vehicle,
  showHeader = true,
  backHref,
  controlsTitle = "Controls",
  removeActionLabel = "Remove listing",
  onUpdateAvailability,
  onSaveDetails,
  onRemoveVehicle,
}: PeerHostVehicleDetailPageProps) {
  const router = useRouter();
  const [editableRate, setEditableRate] = useState(vehicle.dailyRate);
  const [activeImage, setActiveImage] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingSelfDrive, setIsSavingSelfDrive] = useState(false);
  const [isRemovingVehicle, setIsRemovingVehicle] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<VehicleStatus>(vehicle.status);
  const [acceptingBookings, setAcceptingBookings] = useState(
    vehicle.acceptingBookings ?? vehicle.status === "available"
  );
  const noticeTimeoutRef = useRef<number | null>(null);
  
  // State for editable details
  const [editableDetails, setEditableDetails] = useState<EditableVehicleDetails>(
    createEditableDetails(vehicle)
  );
  
  const statusInfo = formatStatus(currentStatus);
  
  const galleryImages = (() => {
    const images = [
      ...(vehicle.galleryImages || []),
      vehicle.imageUrl,
    ].filter(Boolean) as string[];

    const unique = [...new Set(images)];
    if (unique.length > 0) return unique;

    return [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    ];
  })();

  // Vehicle specifications display (using editable details)
  const specifications = [
    { icon: Calendar, label: "Year", value: vehicle.year.toString() },
    { icon: Gauge, label: "Mileage", value: editableDetails.specifications.mileage },
    { icon: Fuel, label: "Fuel Type", value: editableDetails.specifications.fuelType },
    { icon: Settings, label: "Transmission", value: editableDetails.specifications.transmission },
    { icon: Users, label: "Seats", value: `${editableDetails.specifications.seats} seats` },
    { icon: Wind, label: "MPG", value: editableDetails.specifications.mpg },
    { icon: Snowflake, label: "AC", value: editableDetails.specifications.ac },
    { icon: Bluetooth, label: "Connectivity", value: editableDetails.specifications.connectivity },
  ];

  // Features list
  const features = editableDetails.features;

  // Recent trips
  const recentTrips = [
    { guest: "Michael R.", dates: "Mar 10-15", amount: 425, status: "completed" },
    { guest: "Sarah K.", dates: "Mar 5-8", amount: 255, status: "completed" },
    { guest: "David L.", dates: "Feb 28-Mar 3", amount: 340, status: "completed" },
  ];

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const pushNotice = (message: string) => {
    setNotice(message);

    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
    }

    noticeTimeoutRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimeoutRef.current = null;
    }, 3000);
  };

  const handleSaveDetails = async (updatedDetails: EditableVehicleDetails) => {
    setIsSavingDetails(true);
    try {
      if (!onSaveDetails) {
        const updatedVehicle = await updatePeerHostVehicleById(vehicle.id, {
          make: updatedDetails.make,
          model: updatedDetails.model,
          year: updatedDetails.year,
          mileage:
            Number.parseInt(
              updatedDetails.specifications.mileage.replace(/[^\d]/g, ""),
              10,
            ) || undefined,
          fuel:
            updatedDetails.specifications.fuelType.toLowerCase() === "diesel" ||
            updatedDetails.specifications.fuelType.toLowerCase() === "hybrid" ||
            updatedDetails.specifications.fuelType.toLowerCase() === "electric"
              ? (updatedDetails.specifications.fuelType.toLowerCase() as
                  | "diesel"
                  | "hybrid"
                  | "electric")
              : "petrol",
          transmission:
            updatedDetails.specifications.transmission.toLowerCase() ===
              "manual" ||
            updatedDetails.specifications.transmission.toLowerCase() === "cvt"
              ? (updatedDetails.specifications.transmission.toLowerCase() as
                  | "manual"
                  | "cvt")
              : "automatic",
          seats: updatedDetails.specifications.seats,
          features: updatedDetails.features,
          condition: updatedDetails.description,
          price: updatedDetails.dailyRate,
          allowSelfDrive: updatedDetails.allowSelfDrive,
          securityDepositAmount: updatedDetails.allowSelfDrive
            ? updatedDetails.securityDepositAmount
            : 0,
          delivery: updatedDetails.location,
        });
        setEditableDetails(createEditableDetails(updatedVehicle));
        setEditableRate(updatedVehicle.dailyRate);
        setCurrentStatus(updatedVehicle.status);
        setAcceptingBookings(
          updatedVehicle.acceptingBookings ?? updatedVehicle.status === "available",
        );
        pushNotice("Vehicle details updated successfully.");
        return;
      }

      const updatedVehicle = await onSaveDetails(vehicle.id, updatedDetails);
      setEditableDetails(createEditableDetails(updatedVehicle));
      setEditableRate(updatedVehicle.dailyRate);
      setCurrentStatus(updatedVehicle.status);
      setAcceptingBookings(
        updatedVehicle.acceptingBookings ?? updatedVehicle.status === "available",
      );
      pushNotice("Vehicle details updated successfully.");
    } catch (error) {
      pushNotice(
        error instanceof Error
          ? error.message
          : "Failed to update vehicle details. Please try again.",
      );
      throw error;
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleRemoveVehicle = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this vehicle? This action cannot be undone.",
    );
    if (!confirmed) return;

    if (!onRemoveVehicle) {
      pushNotice("Remove action is not configured for this page.");
      return;
    }

    setIsRemovingVehicle(true);
    try {
      await onRemoveVehicle(vehicle.id);
      pushNotice("Vehicle removed successfully.");
    } catch (error) {
      pushNotice(
        error instanceof Error
          ? error.message
          : "Failed to remove vehicle. Please try again.",
      );
    } finally {
      setIsRemovingVehicle(false);
    }
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    const previousAcceptingBookings = acceptingBookings;
    const previousStatus = currentStatus;
    const optimisticStatus: VehicleStatus = checked ? "available" : "maintenance";
    const currentVehicleSnapshot = {
      ...vehicle,
      status: currentStatus,
      acceptingBookings,
    };

    setAcceptingBookings(checked);
    setCurrentStatus(optimisticStatus);
    setIsUpdatingAvailability(true);

    try {
      const updatedVehicle = onUpdateAvailability
        ? await onUpdateAvailability(currentVehicleSnapshot, checked)
        : await updatePeerHostVehicleAvailability(vehicle.id, checked);

      setCurrentStatus(updatedVehicle.status);
      setAcceptingBookings(
        updatedVehicle.acceptingBookings ?? updatedVehicle.status === "available"
      );
      pushNotice(
        checked
          ? "Availability is on. New bookings can be accepted."
          : "Availability is off. New bookings are paused."
      );
    } catch (error) {
      setCurrentStatus(previousStatus);
      setAcceptingBookings(previousAcceptingBookings);
      pushNotice(
        error instanceof Error
          ? error.message
          : "Failed to update availability. Please try again."
      );
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleSaveRate = async () => {
    const payload: EditableVehicleDetails = {
      ...editableDetails,
      dailyRate: editableRate,
    };
    await handleSaveDetails(payload);
  };

  const handleSaveSelfDriveSettings = async () => {
    if (
      editableDetails.allowSelfDrive &&
      (!Number.isFinite(editableDetails.securityDepositAmount) ||
        editableDetails.securityDepositAmount <= 0)
    ) {
      pushNotice("Set a security deposit greater than 0 to enable self-drive.");
      return;
    }

    setIsSavingSelfDrive(true);
    try {
      await handleSaveDetails(editableDetails);
    } finally {
      setIsSavingSelfDrive(false);
    }
  };

  const availabilityTone = acceptingBookings
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  const availabilityHelperText = acceptingBookings
    ? currentStatus === "rented"
      ? "Future dates are open again as soon as the current trip finishes."
      : "Your listing is visible and ready to receive new bookings."
    : "The car stays visible here, but renters cannot book it until you switch availability back on.";

  const content = (
    <>
      {notice && (
        <div className="top-4 right-4 z-50 fixed slide-in-from-top-2 animate-in fade-in">
          <div className="bg-emerald-50 dark:bg-emerald-950 shadow-lg px-4 py-3 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="font-medium text-emerald-800 dark:text-emerald-300">{notice}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 dark:hover:text-slate-300 dark:text-slate-400"
            onClick={() => (backHref ? router.push(backHref) : window.history.back())}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold dark:text-white text-xl md:text-2xl">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-400 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{vehicle.location}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="fill-yellow-400 dark:fill-yellow-400 w-3.5 h-3.5 text-yellow-400 dark:text-yellow-400" />
                <span>{vehicle.ratingAvg.toFixed(1)} ({vehicle.ratingCount})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={cn("gap-1.5 px-3 py-1 font-normal", statusInfo.color)}>
            <span className={cn("rounded-full w-1.5 h-1.5", statusInfo.dot)} />
            {statusInfo.text}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 dark:hover:text-slate-300 dark:text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-800 w-48">
              <DropdownMenuLabel className="dark:text-slate-200">Vehicle Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-slate-800" />
              <DropdownMenuItem 
                className="dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="mr-2 w-4 h-4" />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem className="dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer">
                <Copy className="mr-2 w-4 h-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:focus:bg-slate-800 text-destructive dark:text-red-400 cursor-pointer"
                onClick={handleRemoveVehicle}
                disabled={isRemovingVehicle}
              >
                <Trash2 className="mr-2 w-4 h-4" />
                {isRemovingVehicle ? "Removing..." : "Remove"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="gap-6 grid lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="dark:bg-slate-900 shadow-sm border-0 overflow-hidden">
            <div className="relative bg-muted dark:bg-slate-800 h-64 sm:h-80">
              <img
                src={galleryImages[activeImage]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="dark:brightness-90 w-full h-full object-cover"
              />
              
              {galleryImages.length > 1 && (
                <div className="bottom-3 left-1/2 absolute flex gap-1.5 -translate-x-1/2">
                  {galleryImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "rounded-full h-1.5 transition-all",
                        i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/60"
                      )}
                    />
                  ))}
                </div>
              )}
              
              <div className="top-3 right-3 absolute bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-xs">
                {activeImage + 1}/{galleryImages.length}
              </div>
            </div>
            
            <div className="flex gap-2 p-3 dark:border-slate-800 border-t">
              {galleryImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative flex-shrink-0 rounded-md w-20 h-14 overflow-hidden transition-all",
                    i === activeImage && "ring-2 ring-primary dark:ring-blue-500"
                  )}
                >
                  <img src={src} alt="" className="dark:brightness-90 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Card>

          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="grid grid-cols-3 dark:bg-slate-800 w-full">
              <TabsTrigger value="specs" className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white dark:text-slate-400">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="features" className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white dark:text-slate-400">
                Features
              </TabsTrigger>
              <TabsTrigger value="trips" className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white dark:text-slate-400">
                Recent Trips
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="specs" className="mt-4">
              <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="gap-4 grid grid-cols-2">
                    {specifications.map((spec, i) => {
                      const Icon = spec.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="bg-muted dark:bg-slate-800 p-2 rounded-md">
                            <Icon className="w-4 h-4 text-muted-foreground dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="text-muted-foreground dark:text-slate-400 text-xs">{spec.label}</p>
                            <p className="font-medium dark:text-slate-200 text-sm">{spec.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Separator className="dark:bg-slate-800 my-4" />
                  
                  <div>
                    <h4 className="mb-2 font-medium dark:text-slate-200 text-sm">Description</h4>
                    <p className="text-muted-foreground dark:text-slate-400 text-sm">
                      {editableDetails.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="features" className="mt-4">
              <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="gap-3 grid grid-cols-2">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        <span className="dark:text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="dark:bg-slate-800 my-4" />
                  
                  <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <Shield className="mt-0.5 w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium dark:text-blue-300 text-sm">Insurance included</p>
                      <p className="text-muted-foreground dark:text-blue-400 text-xs">Full coverage with every rental</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trips" className="mt-4">
              <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {recentTrips.map((trip, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex justify-center items-center bg-muted dark:bg-slate-800 rounded-full w-8 h-8">
                            <Users className="w-4 h-4 text-muted-foreground dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium dark:text-slate-200 text-sm">{trip.guest}</p>
                            <p className="text-muted-foreground dark:text-slate-400 text-xs">{trip.dates}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium dark:text-slate-200 text-sm">${trip.amount}</p>
                          <Badge variant="outline" className="dark:border-slate-700 dark:text-slate-300 text-xs capitalize">
                            {trip.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="dark:bg-slate-900 shadow-sm dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold dark:text-slate-200">Pricing</h3>
                <Badge variant="outline" className="dark:border-slate-700 dark:text-slate-300 text-xs">Smart pricing</Badge>
              </div>
              
              <div className="bg-muted dark:bg-slate-800 mb-4 p-4 rounded-lg">
                <p className="text-muted-foreground dark:text-slate-400 text-xs">Current daily rate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-bold dark:text-white text-3xl">${editableRate}</span>
                  <span className="text-muted-foreground dark:text-slate-400 text-sm">/day</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-muted-foreground dark:text-slate-400 text-xs">Update price</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min={0}
                      value={editableRate}
                      onChange={(e) => setEditableRate(Number(e.target.value))}
                      className="dark:bg-slate-800 dark:border-slate-700 h-9 dark:text-slate-200"
                    />
                    <Button
                      size="sm"
                      className="dark:bg-blue-600 dark:hover:bg-blue-700 px-4 h-9"
                      onClick={handleSaveRate}
                      disabled={isSavingDetails}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="gap-1 grid grid-cols-3">
                  {[65, 75, 85].map((price) => (
                    <Button
                      key={price}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs",
                        editableRate === price && "border-primary bg-primary/10 dark:border-blue-600 dark:bg-blue-600/20",
                        "dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      )}
                      onClick={() => setEditableRate(price)}
                    >
                      ${price}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-900 shadow-sm dark:border-slate-800">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold dark:text-slate-200">Performance</h3>
              <div className="gap-3 grid grid-cols-2">
                <div className="bg-muted dark:bg-slate-800 p-3 rounded-lg">
                  <Calendar className="mb-1 w-4 h-4 text-muted-foreground dark:text-slate-400" />
                  <p className="font-semibold dark:text-white text-lg">24</p>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">Total trips</p>
                </div>
                <div className="bg-muted dark:bg-slate-800 p-3 rounded-lg">
                  <Clock className="mb-1 w-4 h-4 text-muted-foreground dark:text-slate-400" />
                  <p className="font-semibold dark:text-white text-lg">92%</p>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">Occupancy</p>
                </div>
                <div className="bg-muted dark:bg-slate-800 p-3 rounded-lg">
                  <Star className="mb-1 w-4 h-4 text-muted-foreground dark:text-slate-400" />
                  <p className="font-semibold dark:text-white text-lg">4.9</p>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">Rating</p>
                </div>
                <div className="bg-muted dark:bg-slate-800 p-3 rounded-lg">
                  <Gauge className="mb-1 w-4 h-4 text-muted-foreground dark:text-slate-400" />
                  <p className="font-semibold dark:text-white text-lg">$8.4k</p>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-900 shadow-sm dark:border-slate-800">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold dark:text-slate-200">{controlsTitle}</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/70 p-3 border dark:border-slate-700 rounded-xl">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium dark:text-slate-200 text-sm">
                        Availability
                      </p>
                      <Badge className={cn("border-0", availabilityTone)}>
                        {acceptingBookings ? "On" : "Off"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs leading-5">
                      {availabilityHelperText}
                    </p>
                  </div>
                  <Switch
                    checked={acceptingBookings}
                    onCheckedChange={handleAvailabilityToggle}
                    disabled={isUpdatingAvailability}
                    aria-label="Toggle vehicle availability"
                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                  />
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/70 p-3 border dark:border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium dark:text-slate-200 text-sm">
                          Allow self-drive
                        </p>
                        <Badge
                          className={cn(
                            "border-0",
                            editableDetails.allowSelfDrive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                          )}
                        >
                          {editableDetails.allowSelfDrive ? "On" : "Off"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs leading-5">
                        When on, renters can choose self-drive and must pay the refundable security deposit at checkout.
                      </p>
                    </div>
                    <Switch
                      checked={editableDetails.allowSelfDrive}
                      onCheckedChange={(checked) =>
                        setEditableDetails((current) => ({
                          ...current,
                          allowSelfDrive: checked,
                          securityDepositAmount: checked
                            ? current.securityDepositAmount || 500
                            : 0,
                        }))
                      }
                      aria-label="Toggle self-drive availability"
                      className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-muted-foreground dark:text-slate-400 text-xs">
                      Minimum security deposit (ETB)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      disabled={!editableDetails.allowSelfDrive}
                      value={editableDetails.securityDepositAmount}
                      onChange={(e) =>
                        setEditableDetails((current) => ({
                          ...current,
                          securityDepositAmount: Number(e.target.value) || 0,
                        }))
                      }
                      className="dark:bg-slate-800 dark:border-slate-700 h-9 dark:text-slate-200 disabled:opacity-60"
                    />
                    <p className="text-muted-foreground dark:text-slate-400 text-xs leading-5">
                      Rental earnings still settle to the owner wallet. The deposit is held by the platform and refunded to the renter wallet after a clean return.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleSaveSelfDriveSettings}
                    disabled={isSavingSelfDrive || isSavingDetails}
                  >
                    {isSavingSelfDrive ? "Saving self-drive settings..." : "Save Self-Drive Settings"}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="justify-start dark:hover:bg-slate-800 dark:border-slate-700 w-full text-destructive dark:text-red-400"
                  size="sm"
                  onClick={handleRemoveVehicle}
                  disabled={isRemovingVehicle}
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  {isRemovingVehicle ? "Removing..." : removeActionLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditVehicleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        vehicleDetails={editableDetails}
        onSave={handleSaveDetails}
        isSaving={isSavingDetails}
      />
    </>
  );

  if (!showHeader) {
    return <div className="space-y-0">{content}</div>;
  }

  return (
    <div className="flex flex-col flex-1 bg-background dark:bg-slate-950">
      <Header />
      <Main className="pt-4">{content}</Main>
    </div>
  );
}
