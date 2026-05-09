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
  ShieldAlert,
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

type Status = "idle" | "detecting" | "supported" | "unsupported" | "vpn";

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
  const [error, setError] = useState("");

  /* ---------------- HELPERS ---------------- */

  const isInsideEthiopia = (lat: number, lng: number) => {
    return lat >= 3.4 && lat <= 14.9 && lng >= 32.9 && lng <= 48.0;
  };

  const detect = async () => {
    setStatus("detecting");
    setError("");

    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );

          const data = await res.json();

          console.log(data);

          const address = data?.address;

          const countryCode = address?.country_code;

          // REAL Ethiopian region/state
          const region = address?.state || address?.region || address?.county;

          // City/town/village fallback
          const detectedCity =
            address?.city ||
            address?.town ||
            address?.village ||
            address?.municipality ||
            "Unknown";

          /* ---------------- COUNTRY VALIDATION ---------------- */

          if (countryCode !== "et") {
            setStatus("unsupported");
            setCity("Outside Ethiopia");
            setError("Only Ethiopian locations are supported.");
            return;
          }

          /* ---------------- ETHIOPIAN REGION VALIDATION ---------------- */

          const ETHIOPIAN_REGIONS = [
            "Addis Ababa",
            "Oromia",
            "Amhara",
            "Tigray",
            "Afar",
            "Somali",
            "Sidama",
            "Harari",
            "Benishangul-Gumuz",
            "Gambela",
            "South West Ethiopia Peoples' Region",
            "Central Ethiopia Regional State",
            "South Ethiopia Regional State",
            "Dire Dawa",
          ];

          const supportedRegion = ETHIOPIAN_REGIONS.some((r) =>
            region?.toLowerCase().includes(r.toLowerCase()),
          );

          if (!supportedRegion) {
            setStatus("unsupported");
            setError("Region not supported.");
            return;
          }

          /* ---------------- SUCCESS ---------------- */

          setCity(detectedCity);

          setStatus("supported");

          onCitySelected(detectedCity);
        } catch (err) {
          console.log(err);

          setStatus("unsupported");

          setError("Failed to verify location.");
        }
      },

      () => {
        setStatus("unsupported");

        setError("Location permission denied.");
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  /* ---------------- MANUAL SELECT ---------------- */

  const handleManual = (val: string) => {
    setCity(val);

    if (SUPPORTED_CITIES.includes(val as (typeof SUPPORTED_CITIES)[number])) {
      setStatus("supported");
      onCitySelected(val);
    } else {
      setStatus("unsupported");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-2xl space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-indigo-600">Step 2 of 4</p>

          <h1 className="text-4xl font-bold tracking-tight">
            Verify Your Location
          </h1>

          <p className="text-gray-500">
            We only support users currently located in Ethiopia
          </p>
        </div>

        {/* MAP CARD */}
        <div className="relative rounded-3xl border bg-white shadow-sm overflow-hidden h-72 flex items-center justify-center">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#6366f1_1px,_transparent_1px)] bg-[size:20px_20px]" />

          {status === "idle" && (
            <div className="text-center space-y-2">
              <Globe2 className="mx-auto text-indigo-600" />

              <p className="text-sm text-gray-500">
                Detect your real-time location
              </p>
            </div>
          )}

          {status === "detecting" && (
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-indigo-600" />

              <p className="text-sm text-gray-500 mt-2">
                Verifying location...
              </p>
            </div>
          )}

          {status === "supported" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-3"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="text-green-600" />
              </div>

              <div>
                <p className="font-semibold text-xl">{city}</p>

                <p className="text-green-600 text-sm mt-1">
                  Verified Ethiopian location
                </p>
              </div>
            </motion.div>
          )}

          {(status === "unsupported" || status === "vpn") && (
            <div className="text-center space-y-3 px-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="text-red-500" />
              </div>

              <div>
                <p className="font-semibold text-lg">Access Restricted</p>

                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
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
            {status === "detecting" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            Detect My Location
          </Button>

          <Select value={city} onValueChange={handleManual}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select city manually" />
            </SelectTrigger>

            <SelectContent>
              {SUPPORTED_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}

              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SUCCESS */}
        {status === "supported" && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 p-4 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            Your location has been verified successfully.
          </div>
        )}

        {/* ERROR */}
        {(status === "unsupported" || status === "vpn") && error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl">
            <XCircle className="w-4 h-4" />

            {error}
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
            className={cn(
              "px-6",
              status !== "supported" && "opacity-50 cursor-not-allowed",
            )}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
