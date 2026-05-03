"use client";

import { useState, useCallback } from "react";
import type { Toast, ToastType } from "./types";

// ─── Hook to manage ephemeral toast notifications ────────────────────────────

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add a new toast and auto-dismiss after 3.5 seconds
  const addToast = useCallback(
    (type: ToastType, title: string, message: string) => {
      const id = `toast_${++toastIdCounter}`;
      const toast: Toast = { id, type, title, message };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  // Remove a specific toast manually
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
