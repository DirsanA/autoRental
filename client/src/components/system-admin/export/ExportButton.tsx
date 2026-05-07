"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface ExportButtonProps {
  onExport: () => Promise<void> | void;
  label?: string;
  disabled?: boolean;
}

export function ExportButton({
  onExport,
  label = "Export Excel",
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={disabled || isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : label}
    </Button>
  );
}
