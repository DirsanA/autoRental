"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Car,
  BookOpen,
  Star,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import type { CompanyDetail, FinancialSummary } from "./types";

// ─── Small stat card used across the overview ────────────────────────────────

interface MiniStatProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
}

function MiniStat({ label, value, icon: Icon }: MiniStatProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Info row helper ─────────────────────────────────────────────────────────

export function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

interface OverviewTabProps {
  company: CompanyDetail;
  financials: FinancialSummary;
}

export function OverviewTab({ company, financials }: OverviewTabProps) {
  // Format address into a single readable string
  const fullAddress = [
    company.address.street,
    company.address.city,
    company.address.state,
    company.address.country,
    company.address.zip,
  ].join(", ");

  return (
    <div className="flex flex-col gap-6">
      {/* ── Quick stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat
          label="Total Vehicles"
          value={company.totalVehicles}
          icon={Car}
        />
        <MiniStat
          label="Total Bookings"
          value={financials.totalBookings}
          icon={BookOpen}
        />
        <MiniStat
          label="Avg Rating"
          value={
            company.averageRating > 0
              ? `${company.averageRating.toFixed(1)} ★`
              : "N/A"
          }
          icon={Star}
        />
        <MiniStat
          label="Total Revenue"
          value={`$${financials.totalRevenue.toLocaleString()}`}
          icon={BookOpen}
        />
      </div>

      {/* ── Detail cards ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Owner & contact section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Owner & Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow
              icon={User}
              label="Owner"
              value={`${company.owner.name} (${company.owner.email})`}
            />
            <InfoRow
              icon={Phone}
              label="Owner Phone"
              value={company.owner.phone}
            />
            <InfoRow
              icon={Mail}
              label="Company Email"
              value={company.contactEmail}
            />
            <InfoRow
              icon={Phone}
              label="Company Phone"
              value={company.contactPhone}
            />
          </CardContent>
        </Card>

        {/* Address & registration section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Address & Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow icon={MapPin} label="Address" value={fullAddress} />
            <InfoRow
              icon={Calendar}
              label="Registration Date"
              value={new Date(company.registrationDate).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
