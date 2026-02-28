"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ConfirmationConfig } from "./types";

interface ConfirmationModalProps {
  config: ConfirmationConfig | null;
  onClose: () => void;
}

export function ConfirmationModal({ config, onClose }: ConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  if (!config) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await config.onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl mx-4 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold">{config.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {config.description}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button
            variant={
              config.variant === "destructive" ? "destructive" : "default"
            }
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[80px] gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {config.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
