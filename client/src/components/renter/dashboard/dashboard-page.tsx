"use client";

import {
  CarFront,
  CreditCard,
  Heart,
  Receipt,
  Settings,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const renterSections = [
  {
    title: "Browse Cars",
    description: "Explore available vehicles, compare listings, and find your next ride.",
    icon: CarFront,
  },
  {
    title: "Bookings & Rentals",
    description: "Track active trips, upcoming reservations, and past rental activity.",
    icon: Receipt,
  },
  {
    title: "Favorites & History",
    description: "Keep an eye on saved cars and revisit vehicles you viewed before.",
    icon: Heart,
  },
  {
    title: "Payments & Receipts",
    description: "Review payment activity, download receipts, and manage billing details.",
    icon: CreditCard,
  },
  {
    title: "Profile Settings",
    description: "Update account details, contact information, and personal preferences.",
    icon: Settings,
  },
];

export function RenterDashboardPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden dark:bg-slate-950">
      <Header />

      <Main>
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">
            Everything here is focused on your renter experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {renterSections.map((section) => {
            const Icon = section.icon;

            return (
              <Card
                key={section.title}
                className="border-border/50 dark:border-slate-800 dark:bg-slate-900"
              >
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div className="rounded-xl border border-border/60 bg-background p-2.5 dark:border-slate-700 dark:bg-slate-950">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground dark:text-slate-400">
                  {section.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Main>
    </div>
  );
}
