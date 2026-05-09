"use client";

import { motion } from "framer-motion";
import {
  Building2,
  FileCheck2,
  MapPin,
  Receipt,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
            Host Registration
          </p>

          <h1 className="mt-3 text-5xl font-bold tracking-tight text-gray-900">
            Become a Host
          </h1>

          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Before continuing your registration, review the business
            requirements below.
          </p>
        </div>

        {/* REQUIREMENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REQUIREMENTS.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                )}
              >
                {/* TOP */}
                <div className="flex items-start justify-between">
                  <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon size={26} />
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Required
                  </div>
                </div>

                {/* CONTENT */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-gray-500 leading-7">{item.desc}</p>
                </div>

                {/* NUMBER */}
                <div className="absolute top-5 right-5 text-5xl font-bold text-gray-100 select-none">
                  0{i + 1}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center">
          <p className="text-sm text-gray-400 mb-4">
            Please make sure all requirements are available before continuing.
          </p>

          <Button
            onClick={onNext}
            className="h-14 px-10 rounded-2xl text-base font-semibold shadow-lg"
          >
            Continue Registration
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
