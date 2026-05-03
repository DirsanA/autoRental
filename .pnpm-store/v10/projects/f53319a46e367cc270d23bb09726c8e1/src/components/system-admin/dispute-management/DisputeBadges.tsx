"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type {
  DisputeStatus,
  DisputePriority,
  DisputeCategory,
} from "./types";

// ─── Status Badge ──────────────────────────────────────────────────────────────

const statusConfig: Record<
  DisputeStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  under_review: {
    label: "Under Review",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  escalated: {
    label: "Escalated",
    className:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  },
  resolved: {
    label: "Resolved",
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  closed: {
    label: "Closed",
    className:
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  },
};

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const cfg = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs border whitespace-nowrap", cfg.className)}
    >
      {cfg.label}
    </Badge>
  );
}

// ─── Priority Badge ────────────────────────────────────────────────────────────

const priorityConfig: Record<
  DisputePriority,
  { label: string; dot: string; text: string }
> = {
  low: {
    label: "Low",
    dot: "bg-gray-400",
    text: "text-gray-500 dark:text-gray-400",
  },
  medium: {
    label: "Medium",
    dot: "bg-yellow-400",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  high: {
    label: "High",
    dot: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
  },
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
  },
};

export function DisputePriorityBadge({
  priority,
}: {
  priority: DisputePriority;
}) {
  const cfg = priorityConfig[priority];
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-medium", cfg.text)}>
      <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Category Label ────────────────────────────────────────────────────────────

const categoryLabels: Record<DisputeCategory, string> = {
  billing: "Billing",
  vehicle_condition: "Vehicle Condition",
  cancellation: "Cancellation",
  no_show: "No-Show",
  damage_claim: "Damage Claim",
  fraud: "Fraud",
  service_quality: "Service Quality",
  other: "Other",
};

export function categoryLabel(cat: DisputeCategory) {
  return categoryLabels[cat] ?? cat;
}
