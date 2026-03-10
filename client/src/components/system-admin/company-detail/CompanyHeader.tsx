"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Ban,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ArrowLeft,
  Pencil,
  Pause,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import type {
  CompanyDetail,
  CompanyDetailStatus,
  VerificationStatus,
} from "./types";

// ─── Status badge config ─────────────────────────────────────────────────────

const statusConfig: Record<
  CompanyDetailStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  suspended: {
    label: "Suspended",
    icon: Ban,
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
};

// ─── Verification badge config ───────────────────────────────────────────────

const verificationConfig: Record<
  VerificationStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className:
      "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  unverified: {
    label: "Unverified",
    icon: ShieldAlert,
    className:
      "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  },
  pending: {
    label: "Pending Review",
    icon: ShieldQuestion,
    className:
      "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

// ─── Avatar from initials ────────────────────────────────────────────────────

function CompanyLogo({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "from-violet-500 to-purple-600",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ];
  const gradient = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={cn(
        "h-14 w-14 rounded-xl flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br shadow-md flex-shrink-0",
        gradient,
      )}
    >
      {initials}
    </div>
  );
}

// ─── Company Header ──────────────────────────────────────────────────────────

interface CompanyHeaderProps {
  company: CompanyDetail;
  onBack: () => void;
  onEdit: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export function CompanyHeader({
  company,
  onBack,
  onEdit,
  onSuspend,
  onReactivate,
  onDelete,
}: CompanyHeaderProps) {
  const status = statusConfig[company.status];
  const StatusIcon = status.icon;
  const verification = verificationConfig[company.verificationStatus];
  const VerifIcon = verification.icon;

  return (
    <div className="flex flex-col gap-4">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </button>

      {/* Company identity bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Logo / initials */}
          <CompanyLogo name={company.name} />

          {/* Name, slug, badges */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                {company.name}
              </h1>
              {/* Status badge */}
              <Badge
                variant="outline"
                className={cn("gap-1 font-normal border-0", status.className)}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </Badge>
              {/* Verification badge */}
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 font-normal border-0",
                  verification.className,
                )}
              >
                <VerifIcon className="h-3.5 w-3.5" />
                {verification.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono">/{company.slug}</span>
              <span className="mx-1.5 opacity-40">·</span>
              Registered{" "}
              {new Date(company.registrationDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Admin action buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          {company.status === "suspended" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onReactivate}
              className="gap-1.5"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reactivate
            </Button>
          ) : (
            company.status !== "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSuspend}
                className="gap-1.5 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300 dark:text-amber-400 dark:border-amber-800"
              >
                <Pause className="h-3.5 w-3.5" />
                Suspend
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-1.5 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:border-red-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
