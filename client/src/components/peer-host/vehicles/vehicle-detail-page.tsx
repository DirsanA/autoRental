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
  AlertCircle
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

function formatStatus(status: VehicleStatus) {
  switch (status) {
    case "available":
      return { text: "Available", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400", dot: "bg-emerald-500" };
    case "rented":
      return { text: "Rented", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400", dot: "bg-blue-500" };
    case "maintenance":
      return { text: "Maintenance", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400", dot: "bg-amber-500" };
  }
}

export function PeerHostVehicleDetailPage({ vehicle }: { vehicle: Vehicle }) {
  const [editableRate, setEditableRate] = useState(vehicle.dailyRate);
  const [activeImage, setActiveImage] = useState(0);
  
  const statusInfo = formatStatus(vehicle.status);
  
  const galleryImages = [
    vehicle.imageUrl,
    vehicle.imageUrl,
    vehicle.imageUrl,
    vehicle.imageUrl,
  ].filter(Boolean) as string[];

  // Vehicle specifications
  const specifications = [
    { icon: Calendar, label: "Year", value: vehicle.year },
    { icon: Gauge, label: "Mileage", value: "45,000 mi" },
    { icon: Fuel, label: "Fuel Type", value: "Gasoline" },
    { icon: Settings, label: "Transmission", value: "Automatic" },
    { icon: Users, label: "Seats", value: "5 seats" },
    { icon: Wind, label: "MPG", value: "28 city / 34 hwy" },
    { icon: Snowflake, label: "AC", value: "Dual Zone" },
    { icon: Bluetooth, label: "Connectivity", value: "Apple CarPlay" },
  ];

  // Features list
  const features = [
    "Bluetooth", "Backup Camera", "Heated Seats", "Lane Assist",
    "Keyless Entry", "USB Ports", "Sunroof", "Premium Sound"
  ];

  // Recent trips
  const recentTrips = [
    { guest: "Michael R.", dates: "Mar 10-15", amount: 425, status: "completed" },
    { guest: "Sarah K.", dates: "Mar 5-8", amount: 255, status: "completed" },
    { guest: "David L.", dates: "Feb 28-Mar 3", amount: 340, status: "completed" },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background">
      <Header />
      
      <Main className="pt-4">
        {/* Header with back button and title */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-xl md:text-2xl">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{vehicle.location}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 w-3.5 h-3.5 text-yellow-400" />
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
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Vehicle Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="mr-2 w-4 h-4" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 w-4 h-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
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
            <Card className="shadow-sm border-0 overflow-hidden">
              <div className="relative bg-muted h-64 sm:h-80">
                <img
                  src={galleryImages[activeImage]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
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
              <div className="flex gap-2 p-3 border-t">
                {galleryImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative flex-shrink-0 rounded-md w-20 h-14 overflow-hidden transition-all",
                      i === activeImage && "ring-2 ring-primary"
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="trips">Recent Trips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="specs" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="gap-4 grid grid-cols-2">
                      {specifications.map((spec, i) => {
                        const Icon = spec.icon;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div className="bg-muted p-2 rounded-md">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">{spec.label}</p>
                              <p className="font-medium text-sm">{spec.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <h4 className="mb-2 font-medium text-sm">Description</h4>
                      <p className="text-muted-foreground text-sm">
                        Well-maintained {vehicle.make} {vehicle.model} in excellent condition. 
                        Perfect for road trips or daily commuting. Features include premium audio, 
                        leather seats, and advanced safety systems.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="gap-3 grid grid-cols-2">
                      {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <Shield className="mt-0.5 w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-sm">Insurance included</p>
                        <p className="text-muted-foreground text-xs">Full coverage with every rental</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="trips" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {recentTrips.map((trip, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
                              <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{trip.guest}</p>
                              <p className="text-muted-foreground text-xs">{trip.dates}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">${trip.amount}</p>
                            <Badge variant="outline" className="text-xs capitalize">
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
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Pricing</h3>
                  <Badge variant="outline" className="text-xs">Smart pricing</Badge>
                </div>
                
                <div className="bg-muted mb-4 p-4 rounded-lg">
                  <p className="text-muted-foreground text-xs">Current daily rate</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-bold text-3xl">${editableRate}</span>
                    <span className="text-muted-foreground text-sm">/day</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-xs">Update price</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        min={0}
                        value={editableRate}
                        onChange={(e) => setEditableRate(Number(e.target.value))}
                        className="h-9"
                      />
                      <Button size="sm" className="px-4 h-9">
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
                          editableRate === price && "border-primary bg-primary/10"
                        )}
                        onClick={() => setEditableRate(price)}
                      >
                        ${price}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 mt-4 p-3 rounded-lg">
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
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">Performance</h3>
                <div className="gap-3 grid grid-cols-2">
                  <div className="bg-muted p-3 rounded-lg">
                    <Calendar className="mb-1 w-4 h-4 text-muted-foreground" />
                    <p className="font-semibold text-lg">24</p>
                    <p className="text-muted-foreground text-xs">Total trips</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <Clock className="mb-1 w-4 h-4 text-muted-foreground" />
                    <p className="font-semibold text-lg">92%</p>
                    <p className="text-muted-foreground text-xs">Occupancy</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <Star className="mb-1 w-4 h-4 text-muted-foreground" />
                    <p className="font-semibold text-lg">4.9</p>
                    <p className="text-muted-foreground text-xs">Rating</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <Gauge className="mb-1 w-4 h-4 text-muted-foreground" />
                    <p className="font-semibold text-lg">$8.4k</p>
                    <p className="text-muted-foreground text-xs">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Host Controls */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">Controls</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="justify-start w-full" size="sm">
                    <Calendar className="mr-2 w-4 h-4" />
                    Edit availability
                  </Button>
                  <Button variant="outline" className="justify-start w-full" size="sm">
                    <Wrench className="mr-2 w-4 h-4" />
                    Maintenance mode
                  </Button>
                  <Button variant="outline" className="justify-start w-full text-destructive" size="sm">
                    <Trash2 className="mr-2 w-4 h-4" />
                    Remove listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </div>
  );
}