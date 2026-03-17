"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast } from "./types";

// ─── Toast notification bar (renders at viewport bottom) ─────────────────────

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const styleMap = {
  success:
    "border-green-500/30 bg-green-50 text-green-900 dark:bg-green-950/60 dark:text-green-300 dark:border-green-500/20",
  error:
    "border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-300 dark:border-red-500/20",
  info: "border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/20",
} as const;

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
              styleMap[toast.type],
            )}
          >
            {/* Status icon */}
            <Icon className="h-5 w-5 mt-0.5 shrink-0" />

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{toast.message}</p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
