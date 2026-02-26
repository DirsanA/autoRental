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

type HostStep = "car" | "protection" | "pricing" | "terms";
type PhotoKey = "front" | "back" | "side" | "interior";

export function PeerHostBecomeHostPage() {
  const [step, setStep] = useState<HostStep>("car");
  const [photos, setPhotos] = useState<Record<PhotoKey, string | null>>({
    front: null,
    back: null,
    side: null,
    interior: null,
  });

  function nextStep() {
    setStep((current) => {
      if (current === "car") return "protection";
      if (current === "protection") return "pricing";
      if (current === "pricing") return "terms";
      return "terms";
    });
  }

  function prevStep() {
    setStep((current) => {
      if (current === "terms") return "pricing";
      if (current === "pricing") return "protection";
      if (current === "protection") return "car";
      return "car";
    });
  }

  function handlePhotoChange(key: PhotoKey, files: FileList | null) {
    const file = files?.[0];
    setPhotos((prev) => ({
      ...prev,
      [key]: file ? file.name : null,
    }));
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Become a Host</h2>
            <p className="text-sm text-muted-foreground">
              Add your car to AutoRent with clear steps for details, protection, pricing
              and hosting terms.
            </p>
          </div>

          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Step{" "}
            {step === "car"
              ? "1 · Car details"
              : step === "protection"
                ? "2 · Insurance & protection"
                : step === "pricing"
                  ? "3 · Pricing & availability"
                  : "4 · Terms & agreements"}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Left column: main form content */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                {step === "car" && "Car details & photos"}
                {step === "protection" && "Insurance & protection"}
                {step === "pricing" && "Pricing & availability"}
                {step === "terms" && "Terms & confirmation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {step === "car" && (
                <>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="make">Make</Label>
                      <Input id="make" placeholder="e.g. Toyota" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" placeholder="e.g. Corolla" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" type="number" placeholder="e.g. 2022" />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="vin">VIN</Label>
                      <Input id="vin" placeholder="Vehicle Identification Number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="plate">License plate</Label>
                      <Input id="plate" placeholder="e.g. GR 1234-22" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <Input id="mileage" type="number" placeholder="e.g. 45,000" />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="fuel">Fuel type</Label>
                      <Input id="fuel" placeholder="e.g. Petrol, Diesel, Hybrid" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transmission">Transmission</Label>
                      <Input id="transmission" placeholder="e.g. Automatic" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="features">Features & amenities</Label>
                    <Textarea
                      id="features"
                      rows={3}
                      placeholder="e.g. GPS, Bluetooth, child seat, reverse camera, Wi‑Fi hotspot..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Car photos (4 angles)</Label>
                    <p className="text-xs text-muted-foreground">
                      Upload clear photos so guests can see the exact car they will get.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        ["front", "Front / 3‑quarter view"],
                        ["back", "Rear view"],
                        ["side", "Side profile"],
                        ["interior", "Interior (dashboard & seats)"],
                      ] as [PhotoKey, string][]).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-dashed border-border/60 bg-muted/40 px-3 py-3 text-xs hover:border-foreground/60"
                        >
                          <span className="font-medium text-foreground">{label}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {photos[key] ?? "Click to upload JPG or PNG"}
                          </span>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoChange(key, e.target.files)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="condition">
                      Condition notes (optional: existing scratches, damages, etc.)
                    </Label>
                    <Textarea
                      id="condition"
                      rows={3}
                      placeholder="List any visible wear, scratches or issues so guests know what to expect."
                    />
                  </div>
                </>
              )}

              {step === "protection" && (
                <>
                  <div className="grid gap-3">
                    <Label>Choose a protection option</Label>
                    <p className="text-xs text-muted-foreground">
                      This is not a real insurance product yet, but we capture your
                      preference so we can match it to the right protection plan.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Button variant="outline" className="h-auto flex-col items-start gap-1">
                        <span className="text-sm font-medium">Standard</span>
                        <span className="text-xs text-muted-foreground">
                          Balanced protection & earnings.
                        </span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col items-start gap-1">
                        <span className="text-sm font-medium">Premium</span>
                        <span className="text-xs text-muted-foreground">
                          Higher protection, slightly lower payout.
                        </span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col items-start gap-1">
                        <span className="text-sm font-medium">Use my own cover</span>
                        <span className="text-xs text-muted-foreground">
                          You provide commercial insurance.
                        </span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="insurer">
                      Current insurer & policy number (if applicable)
                    </Label>
                    <Input
                      id="insurer"
                      placeholder="e.g. Enterprise Insurance · Policy #123456"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="compliance">
                      Compliance confirmation
                    </Label>
                    <Textarea
                      id="compliance"
                      rows={3}
                      placeholder="Confirm that the vehicle meets local roadworthiness, registration and insurance requirements."
                    />
                  </div>
                </>
              )}

              {step === "pricing" && (
                <>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Daily price (USD)</Label>
                      <Input id="price" type="number" placeholder="e.g. 45" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="weekly">Weekly discount (%)</Label>
                      <Input id="weekly" type="number" placeholder="e.g. 10" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="monthly">Monthly discount (%)</Label>
                      <Input id="monthly" type="number" placeholder="e.g. 20" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="availability">Availability pattern</Label>
                    <Input
                      id="availability"
                      placeholder="e.g. Available Mon–Sun, blocked when already booked."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="delivery">Delivery & pickup options</Label>
                    <Textarea
                      id="delivery"
                      rows={3}
                      placeholder="e.g. Free pickup in East Legon, delivery to airport for a fee, no cross‑border trips..."
                    />
                  </div>
                </>
              )}

              {step === "terms" && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Before you publish your car, please read and accept the hosting
                    responsibilities:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      You’ll keep the vehicle roadworthy, insured, and compliant with
                      local regulations.
                    </li>
                    <li>
                      You’ll accurately describe the car’s condition, features and any
                      limitations.
                    </li>
                    <li>
                      You agree to respond to guests promptly and handle check‑in and
                      return in a professional way.
                    </li>
                    <li>
                      You’ll follow AutoRent’s safety, cancellation and dispute policies.
                    </li>
                  </ul>
                  <p className="pt-2">
                    By submitting, you confirm that the information provided is accurate
                    and that you agree to AutoRent’s host terms and conditions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column: summary + navigation */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Next steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Work through each section to set up your car like a professional listing.
                You can refine prices, availability and photos later.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={step === "car"}
                  onClick={prevStep}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
                >
                  {step === "terms" ? "Submit application" : "Continue"}
                </Button>
              </div>

              <p className="text-xs">
                After you submit, we’ll review your details and follow up with any extra
                verification needed before your car goes live.
              </p>
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  );
}

