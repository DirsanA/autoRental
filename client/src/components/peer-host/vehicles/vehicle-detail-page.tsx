"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  Camera,
  Shield,
  Clock,
  ChevronLeft,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
  Wrench,
  AlertCircle,
  Save,
  X,
  Plus
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function formatStatus(status: VehicleStatus) {
  switch (status) {
    case "available":
      return { text: "Available", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20", dot: "bg-emerald-500" };
    case "rented":
      return { text: "Rented", color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/20", dot: "bg-blue-500" };
    case "maintenance":
      return { text: "Maintenance", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/20", dot: "bg-amber-500" };
  }
}

interface EditableVehicleDetails {
  make: string;
  model: string;
  year: number;
  location: string;
  dailyRate: number;
  description: string;
  features: string[];
  specifications: {
    mileage: string;
    fuelType: string;
    transmission: string;
    seats: number;
    mpg: string;
    ac: string;
    connectivity: string;
  };
}

export function PeerHostVehicleDetailPage({ vehicle }: { vehicle: Vehicle }) {
  const [editableRate, setEditableRate] = useState(vehicle.dailyRate);
  const [activeImage, setActiveImage] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const statusInfo = formatStatus(vehicle.status);
  
  const galleryImages = [
    vehicle.imageUrl,
    vehicle.imageUrl,
    vehicle.imageUrl,
    vehicle.imageUrl,
  ].filter(Boolean) as string[];

  // Editable vehicle details
  const [editableDetails, setEditableDetails] = useState<EditableVehicleDetails>({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    location: vehicle.location,
    dailyRate: vehicle.dailyRate,
    description: "Well-maintained vehicle in excellent condition. Perfect for road trips or daily commuting. Features include premium audio, leather seats, and advanced safety systems.",
    features: [
      "Bluetooth", "Backup Camera", "Heated Seats", "Lane Assist",
      "Keyless Entry", "USB Ports", "Sunroof", "Premium Sound"
    ],
    specifications: {
      mileage: "45,000 mi",
      fuelType: "Gasoline",
      transmission: "Automatic",
      seats: 5,
      mpg: "28 city / 34 hwy",
      ac: "Dual Zone",
      connectivity: "Apple CarPlay"
    }
  });

  // Vehicle specifications display
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

  const handleSaveDetails = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success message
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
    
    setIsSaving(false);
    setIsEditDialogOpen(false);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setEditableDetails({
        ...editableDetails,
        features: [...editableDetails.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setEditableDetails({
      ...editableDetails,
      features: editableDetails.features.filter((_, i) => i !== index)
    });
  };

  const handleSpecificationChange = (key: keyof typeof editableDetails.specifications, value: string | number) => {
    setEditableDetails({
      ...editableDetails,
      specifications: {
        ...editableDetails.specifications,
        [key]: value
      }
    });
  };

  return (
    <div className="flex flex-col flex-1 bg-background dark:bg-slate-950">
      <Header />
      
      <Main className="pt-4">
        {/* Success Message */}
        {showSaveSuccess && (
          <div className="top-4 right-4 z-50 fixed slide-in-from-top-2 animate-in fade-in">
            <div className="bg-emerald-50 dark:bg-emerald-950 shadow-lg px-4 py-3 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Changes saved successfully!</p>
              </div>
            </div>
          </div>
        )}

        {/* Header with back button and title */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 dark:hover:text-slate-300 dark:text-slate-400"
              onClick={() => window.history.back()}
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
                <DropdownMenuItem className="dark:focus:bg-slate-800 text-destructive dark:text-red-400 cursor-pointer">
                  <Trash2 className="mr-2 w-4 h-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content grid */}
        <div className="gap-6 grid lg:grid-cols-3">
          {/* Left column - Gallery and Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Gallery */}
            <Card className="dark:bg-slate-900 shadow-sm border-0 overflow-hidden">
              <div className="relative bg-muted dark:bg-slate-800 h-64 sm:h-80">
                <img
                  src={galleryImages[activeImage]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="dark:brightness-90 w-full h-full object-cover"
                />
                
                {/* Image navigation dots */}
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
                
                {/* Image count */}
                <div className="top-3 right-3 absolute bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-xs">
                  {activeImage + 1}/{galleryImages.length}
                </div>
              </div>
              
              {/* Thumbnails */}
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

            {/* Tabs for different sections */}
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

          {/* Right column - Pricing and Controls */}
          <div className="space-y-6">
            {/* Pricing Card */}
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
                      <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 px-4 h-9">
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
                
                <div className="bg-amber-50 dark:bg-amber-950/30 mt-4 p-3 border border-amber-100 dark:border-amber-900 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-amber-800 dark:text-amber-300 text-xs">
                      Recommended price: <span className="font-medium">$82/day</span> for next week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
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

            {/* Host Controls */}
            <Card className="dark:bg-slate-900 shadow-sm dark:border-slate-800">
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold dark:text-slate-200">Controls</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="justify-start dark:hover:bg-slate-800 dark:border-slate-700 w-full dark:text-slate-300" size="sm">
                    <Calendar className="mr-2 w-4 h-4" />
                    Edit availability
                  </Button>
                  <Button variant="outline" className="justify-start dark:hover:bg-slate-800 dark:border-slate-700 w-full dark:text-slate-300" size="sm">
                    <Wrench className="mr-2 w-4 h-4" />
                    Maintenance mode
                  </Button>
                  <Button variant="outline" className="justify-start dark:hover:bg-slate-800 dark:border-slate-700 w-full text-destructive dark:text-red-400" size="sm">
                    <Trash2 className="mr-2 w-4 h-4" />
                    Remove listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Details Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="dark:bg-slate-900 dark:border-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="dark:text-white text-xl">Edit Vehicle Details</DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                Make changes to your vehicle information below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium dark:text-slate-200 text-lg">Basic Information</h3>
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Make</Label>
                    <Input
                      value={editableDetails.make}
                      onChange={(e) => setEditableDetails({...editableDetails, make: e.target.value})}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Model</Label>
                    <Input
                      value={editableDetails.model}
                      onChange={(e) => setEditableDetails({...editableDetails, model: e.target.value})}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Year</Label>
                    <Input
                      type="number"
                      value={editableDetails.year}
                      onChange={(e) => setEditableDetails({...editableDetails, year: parseInt(e.target.value)})}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Location</Label>
                    <Input
                      value={editableDetails.location}
                      onChange={(e) => setEditableDetails({...editableDetails, location: e.target.value})}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Daily Rate ($)</Label>
                    <Input
                      type="number"
                      value={editableDetails.dailyRate}
                      onChange={(e) => setEditableDetails({...editableDetails, dailyRate: parseInt(e.target.value)})}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <Separator className="dark:bg-slate-800" />

              {/* Description */}
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Description</Label>
                <Textarea
                  value={editableDetails.description}
                  onChange={(e) => setEditableDetails({...editableDetails, description: e.target.value})}
                  rows={4}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <Separator className="dark:bg-slate-800" />

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="font-medium dark:text-slate-200 text-lg">Specifications</h3>
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Mileage</Label>
                    <Input
                      value={editableDetails.specifications.mileage}
                      onChange={(e) => handleSpecificationChange('mileage', e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Fuel Type</Label>
                    <Select 
                      value={editableDetails.specifications.fuelType}
                      onValueChange={(value) => handleSpecificationChange('fuelType', value)}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                        <SelectItem value="Gasoline">Gasoline</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Transmission</Label>
                    <Select
                      value={editableDetails.specifications.transmission}
                      onValueChange={(value) => handleSpecificationChange('transmission', value)}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">Seats</Label>
                    <Input
                      type="number"
                      value={editableDetails.specifications.seats}
                      onChange={(e) => handleSpecificationChange('seats', parseInt(e.target.value))}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">MPG</Label>
                    <Input
                      value={editableDetails.specifications.mpg}
                      onChange={(e) => handleSpecificationChange('mpg', e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">AC</Label>
                    <Input
                      value={editableDetails.specifications.ac}
                      onChange={(e) => handleSpecificationChange('ac', e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="dark:text-slate-300">Connectivity</Label>
                    <Input
                      value={editableDetails.specifications.connectivity}
                      onChange={(e) => handleSpecificationChange('connectivity', e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <Separator className="dark:bg-slate-800" />

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-medium dark:text-slate-200 text-lg">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {editableDetails.features.map((feature, index) => (
                    <Badge
                      key={index}
                      className="gap-1 dark:bg-slate-800 px-3 py-1.5 dark:text-slate-300"
                    >
                      {feature}
                      <X
                        className="ml-1 w-3 h-3 hover:text-destructive cursor-pointer"
                        onClick={() => handleRemoveFeature(index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 dark:bg-slate-800 dark:border-slate-700"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  />
                  <Button
                    onClick={handleAddFeature}
                    variant="outline"
                    className="dark:border-slate-700 dark:text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDetails}
                disabled={isSaving}
                className="dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </div>
  );
}