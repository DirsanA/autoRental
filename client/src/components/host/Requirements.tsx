"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Building2,
  FileCheck2,
  MapPin,
  Receipt,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/* ---------------- DATA ---------------- */
const REQUIREMENTS = [
  {
    icon: Building2,
    title: "Registered Company",
    desc: "Must be legally registered in Ethiopia.",
  },
  {
    icon: Receipt,
    title: "Valid TIN Number",
    desc: "Required for payments and tax verification.",
  },
  {
    icon: FileCheck2,
    title: "Commercial License",
    desc: "Upload your valid business license document.",
  },
  {
    icon: MapPin,
    title: "Operating Region",
    desc: "You must operate in supported cities.",
  },
];

type Props = {
  onNext: () => void;
};

export default function Requirements({ onNext }: Props) {
  const [checked, setChecked] = useState<boolean[]>(
    Array(REQUIREMENTS.length).fill(false)
  );

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => {
    setChecked((prev) =>
      prev.map((v, idx) => (idx === i ? !v : v))
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">

      {/* CENTER CONTAINER */}
      <div className="w-full max-w-2xl space-y-10">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-indigo-600">
            Step 1 / 4
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Become a Host
          </h1>

          <p className="text-gray-500">
            First, confirm your business eligibility
          </p>
        </div>

        {/* CARDS */}
        <div className="space-y-4">
          {REQUIREMENTS.map((item, i) => {
            const Icon = item.icon;
            const isChecked = checked[i];

            return (
              <motion.div
                key={item.title}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={cn(
                  "flex items-start gap-4 p-5 rounded-2xl border transition cursor-pointer",
                  isChecked
                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-indigo-300"
                )}
                onClick={() => toggle(i)}
              >
                {/* ICON */}
                <div
                  className={cn(
                    "p-3 rounded-xl shrink-0",
                    isChecked
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-indigo-600"
                  )}
                >
                  <Icon size={20} />
                </div>

                {/* TEXT */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">
                      {item.title}
                    </h3>

                    {isChecked && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.desc}
                  </p>
                </div>

                {/* CHECKBOX */}
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggle(i)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* CTA SECTION */}
        <div className="pt-2 flex flex-col items-center gap-3">

          {/* progress hint */}
          <p className="text-xs text-gray-400">
            {checked.filter(Boolean).length} of {REQUIREMENTS.length} completed
          </p>

          <Button
            onClick={onNext}
            disabled={!allChecked}
            className="w-full py-6 text-base rounded-xl"
          >
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

        </div>
      </div>
    </div>
  );
}
