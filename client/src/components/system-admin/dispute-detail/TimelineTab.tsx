"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  UserCheck,
  FileText,
  CheckCircle2,
  ArrowUpCircle,
  GitBranch,
} from "lucide-react";
import type { DisputeEvent } from "@/components/system-admin/dispute-management/types";

interface TimelineTabProps {
  events: DisputeEvent[];
}

const eventConfig: Record<
  DisputeEvent["type"],
  { icon: React.ElementType; color: string; ring: string }
> = {
  message: {
    icon: MessageSquare,
    color: "text-blue-600 dark:text-blue-400",
    ring: "bg-blue-100 dark:bg-blue-900/30",
  },
  assignment: {
    icon: UserCheck,
    color: "text-purple-600 dark:text-purple-400",
    ring: "bg-purple-100 dark:bg-purple-900/30",
  },
  document: {
    icon: FileText,
    color: "text-amber-600 dark:text-amber-400",
    ring: "bg-amber-100 dark:bg-amber-900/30",
  },
  resolution: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    ring: "bg-green-100 dark:bg-green-900/30",
  },
  status_change: {
    icon: GitBranch,
    color: "text-orange-600 dark:text-orange-400",
    ring: "bg-orange-100 dark:bg-orange-900/30",
  },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TimelineTab({ events }: TimelineTabProps) {
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center text-muted-foreground">
          No timeline events recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-border" />

      <ol className="flex flex-col gap-0">
        {events.map((ev, i) => {
          const cfg = eventConfig[ev.type];
          const Icon = cfg.icon;
          const isLast = i === events.length - 1;

          return (
            <li key={ev.id} className={cn("flex gap-4", !isLast && "pb-6")}>
              {/* Icon node */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm",
                  cfg.ring
                )}
              >
                <Icon className={cn("h-4 w-4", cfg.color)} />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-0.5 pt-1.5">
                <p className="text-sm font-medium">{ev.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{ev.actor}</span>
                  <span>·</span>
                  <span>{formatTime(ev.timestamp)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
