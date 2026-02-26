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

type HostStep = "profile" | "vehicle" | "requirements" | "review";

export function PeerHostBecomeHostPage() {
  const [step, setStep] = useState<HostStep>("profile");

  function nextStep() {
    setStep((current) => {
      if (current === "profile") return "vehicle";
      if (current === "vehicle") return "requirements";
      if (current === "requirements") return "review";
      return "review";
    });
  }

  function prevStep() {
    setStep((current) => {
      if (current === "review") return "requirements";
      if (current === "requirements") return "vehicle";
      if (current === "vehicle") return "profile";
      return "profile";
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Become a Host</h2>
            <p className="text-sm text-muted-foreground">
              Share your vehicle, earn more, and stay in control of how you host.
            </p>
          </div>

          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Step{" "}
            {step === "profile"
              ? "1 · About you"
              : step === "vehicle"
                ? "2 · Vehicle info"
                : step === "requirements"
                  ? "3 · Requirements"
                  : "4 · Review & submit"}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Left column: main form content */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                {step === "profile" && "About you"}
                {step === "vehicle" && "Your vehicles"}
                {step === "requirements" && "Hosting requirements"}
                {step === "review" && "Review & confirmation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {step === "profile" && (
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input id="fullName" placeholder="e.g. Ama Mensah" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" placeholder="+233..." />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="city">Primary city you host in</Label>
                    <Input id="city" placeholder="e.g. Accra, Ghana" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="about">
                      Short host bio (what guests should know about you)
                    </Label>
                    <Textarea
                      id="about"
                      rows={4}
                      placeholder="Tell guests how you maintain your vehicles and what kind of experience you offer."
                    />
                  </div>
                </>
              )}

              {step === "vehicle" && (
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="make">Preferred vehicle make</Label>
                      <Input id="make" placeholder="e.g. Toyota, Hyundai, Kia" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="yearRange">Model year range</Label>
                      <Input id="yearRange" placeholder="e.g. 2018 and newer" />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="minRequirements">
                        Minimum requirements for cars you host
                      </Label>
                      <Input
                        id="minRequirements"
                        placeholder="e.g. Comprehensive insurance, AC, mileage below 120,000km"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fleetSize">
                        How many vehicles are you planning to host?
                      </Label>
                      <Input
                        id="fleetSize"
                        type="number"
                        min={1}
                        placeholder="e.g. 1–5"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="parking">
                      Where do guests usually pick up the vehicle?
                    </Label>
                    <Input
                      id="parking"
                      placeholder="e.g. Kotoka Airport, East Legon, Spintex..."
                    />
                  </div>
                </>
              )}

              {step === "requirements" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="rules">Your key trip rules</Label>
                    <Textarea
                      id="rules"
                      rows={4}
                      placeholder="e.g. No smoking, fuel policy, late return rules, cleaning expectations..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="documents">
                      Documents you’re ready to provide
                    </Label>
                    <Textarea
                      id="documents"
                      rows={3}
                      placeholder="e.g. Driver’s license, vehicle registration, insurance certificate..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="support">
                      How quickly can you typically respond to guests?
                    </Label>
                    <Input
                      id="support"
                      placeholder="e.g. Within 15 minutes between 7am–10pm"
                    />
                  </div>
                </>
              )}

              {step === "review" && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    You’re almost done. When you submit this form, our team will review
                    your details and may request supporting documents such as:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Valid government ID and driver’s license</li>
                    <li>Vehicle registration and proof of insurance</li>
                    <li>Any additional documents listed in the host policy</li>
                  </ul>
                  <p className="pt-2">
                    By continuing, you confirm that the information provided is accurate
                    and that you agree to follow AutoRent’s host terms, safety policies,
                    and pricing guidelines.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column: simple summary + actions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Next steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Complete each step with as much detail as possible. This helps us
                onboard you faster and match you with the right guests.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={step === "profile"}
                  onClick={prevStep}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
                >
                  {step === "review" ? "Submit application" : "Continue"}
                </Button>
              </div>

              <p className="text-xs">
                After you submit, we’ll send you an email with the status of your
                application and any extra information we need.
              </p>
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  );
}

