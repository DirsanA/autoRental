"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import type { ConfirmationConfig } from "./types";

interface ConfirmationModalProps {
  config: ConfirmationConfig | null;
  onClose: () => void;
}

export function ConfirmationModal({ config, onClose }: ConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [localReason, setLocalReason] = useState("");

  // Reset local reason whenever a new modal opens
  useEffect(() => {
    if (config) {
      setLocalReason("");
    }
  }, [config]);

  if (!config) return null;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await config.onConfirm(localReason);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const isDestructive = config.variant === "destructive";

  return (
    <AlertDialog open={!!config} onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialogContent className="sm:max-w-md border-none shadow-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-full ${isDestructive ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
              {isDestructive ? <AlertCircle size={20} /> : config.title.includes("Approve") || config.title.includes("Reactivate") ? <CheckCircle2 size={20} /> : <HelpCircle size={20} />}
            </div>
            <AlertDialogTitle className="text-xl font-bold">{config.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed pt-2">
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {config.showReasonInput && (
          <div className="py-4 space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">Reason for action (optional)</label>
            <Input
              value={localReason}
              onChange={(e) => setLocalReason(e.target.value)}
              placeholder="Provide context for the user..."
              className="h-11 rounded-lg bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30"
              disabled={loading}
              autoFocus
            />
          </div>
        )}

        <AlertDialogFooter className="mt-2 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={loading} className="rounded-lg h-11 px-6">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-lg h-11 px-8 font-bold transition-all active:scale-[0.98] ${isDestructive ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"}`}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
