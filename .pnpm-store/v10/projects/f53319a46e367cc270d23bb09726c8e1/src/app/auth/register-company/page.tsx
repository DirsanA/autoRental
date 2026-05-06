"use client";

import { useState } from "react";

import { HostShell } from "@/components/host/HostShell";
import Navbar from "@/components/navbar";
import {LandingFooter} from "@/components/marketing/landing-footer";

import Requirements from "@/components/host/Requirements";
import { LocationCheck } from "@/components/host/LocationCheck";
import { RegistrationForm}  from "@/components/host/RegistrationForm";
import { PendingApproval } from "@/components/host/PendingApproval";

import { HostStep, initialFormData, HostFormData } from "@/components/host/types";

const HostPage = () => {
  const [step, setStep] = useState<HostStep>("requirements");
  const [data, setData] = useState<HostFormData>(initialFormData);

  const update = (fn: (d: HostFormData) => HostFormData) =>
    setData(fn);

  const renderStep = () => {
    switch (step) {
      /* ---------------- REQUIREMENTS ---------------- */
      case "requirements":
        return (
          <Requirements
            onNext={() => setStep("location")}
          />
        );

      /* ---------------- LOCATION CHECK ---------------- */
      case "location":
        return (
          <LocationCheck
            onBack={() => setStep("requirements")}
            onNext={() => setStep("form-location")}
            onCitySelected={(c) =>
              update((d) => ({
                ...d,
                city: c,
                region: d.region || "Addis Ababa",
              }))
            }
          />
        );

      /* ---------------- FORM STEPS ---------------- */
      case "form-location":
      case "form-company":
      case "form-contact":
      case "form-professional":
      case "form-review": {
        const order: HostStep[] = [
          "form-location",
          "form-company",
          "form-contact",
          "form-professional",
          "form-review",
        ];

        const idx = order.indexOf(step);
        const back = idx === 0 ? "location" : order[idx - 1];
        const next = idx === order.length - 1 ? "pending" : order[idx + 1];

        return (
          <RegistrationForm
            step={step}
            data={data}
            setData={update}
            onBack={() => setStep(back)}
            onNext={() => setStep(next)}
            onSubmit={() => setStep("pending")}
            goToStep={setStep}
          />
        );
      }

      /* ---------------- PENDING ---------------- */
      case "pending":
        return (
          <PendingApproval
            email={data.email}
            onRestart={() => {
              setData(initialFormData);
              setStep("requirements");
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <HostShell>{renderStep()}</HostShell>
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
};

export default HostPage;
