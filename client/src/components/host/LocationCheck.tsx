"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Globe2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SUPPORTED_CITIES } from "./types";
import { cn } from "@/lib/utils";

type Status = "idle" | "detecting" | "supported" | "unsupported";

export const LocationCheck = ({
  onBack,
  onNext,
  onCitySelected,
}: {
  onBack: () => void;
  onNext: () => void;
  onCitySelected: (city: string) => void;
}) => {
  const [status, setStatus] = useState<Status>("idle");
  const [city, setCity] = useState("");

  const detect = () => {
    setStatus("detecting");

    if (!("geolocation" in navigator)) {
      setTimeout(() => {
        setCity("Addis Ababa");
        setStatus("supported");
        onCitySelected("Addis Ababa");
      }, 800);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        const inEthiopia =
          latitude >= 3.4 &&
          latitude <= 14.9 &&
          longitude >= 32.9 &&
          longitude <= 48.0;

        if (inEthiopia) {
          setCity("Addis Ababa");
          setStatus("supported");
          onCitySelected("Addis Ababa");
        } else {
          setCity("Outside Ethiopia");
          setStatus("unsupported");
        }
      },
      () => setStatus("idle"),
      { timeout: 8000 }
    );
  };

  const handleManual = (val: string) => {
    setCity(val);
    onCitySelected(val);

    if (SUPPORTED_CITIES.includes(val as any)) {
      setStatus("supported");
    } else {
      setStatus("unsupported");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">

      <div className="w-full max-w-2xl space-y-10">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-indigo-600">
            Step 2 of 4
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Your Location
          </h1>

          <p className="text-gray-500">
            We use this to match you with customers nearby
          </p>
        </div>

        {/* MAP CARD */}
        <div className="relative rounded-3xl border bg-white shadow-sm overflow-hidden h-64 flex items-center justify-center">

          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#6366f1_1px,_transparent_1px)] bg-[size:20px_20px]" />

          {status === "idle" && (
            <div className="text-center space-y-2">
              <Globe2 className="mx-auto text-indigo-600" />
              <p className="text-sm text-gray-500">
                Detect or select your city
              </p>
            </div>
          )}

          {status === "detecting" && (
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-indigo-600" />
              <p className="text-sm text-gray-500 mt-2">
                Detecting location...
              </p>
            </div>
          )}

          {status === "supported" && (
            <motion.div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="text-green-600" />
              </div>
              <p className="font-semibold text-lg">{city}</p>
              <p className="text-green-600 text-sm">
                Available in your area
              </p>
            </motion.div>
          )}

          {status === "unsupported" && (
            <div className="text-center space-y-2 px-6">
              <XCircle className="mx-auto text-red-500" />
              <p className="font-semibold">{city}</p>
              <p className="text-sm text-gray-500">
                Not available in this location yet
              </p>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="grid gap-4 sm:grid-cols-2">

          <Button
            variant="outline"
            size="lg"
            onClick={detect}
            disabled={status === "detecting"}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Detect Location
          </Button>

          <Select value={city} onValueChange={handleManual}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select city manually" />
            </SelectTrigger>

            <SelectContent>
              {[...SUPPORTED_CITIES, "Other"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SUCCESS BANNER */}
        {status === "supported" && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            You can continue your application
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={onNext}
            disabled={status !== "supported"}
            className="px-6"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};
