"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Upload,
  X,
  Bug,
  UserX,
  Car,
  Building2,
  HelpCircle,
  ImagePlus,
  CheckCircle2,
} from "lucide-react";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import { cn } from "@/lib/utils";

const REPORT_TYPES = [
  { value: "SYSTEM_GLITCH", label: "System Glitch", icon: Bug, color: "text-rose-500" },
  { value: "USER_BEHAVIOR", label: "User Behavior", icon: UserX, color: "text-amber-500" },
  { value: "VEHICLE_ISSUE", label: "Vehicle Issue", icon: Car, color: "text-blue-500" },
  { value: "COMPANY_ISSUE", label: "Company Issue", icon: Building2, color: "text-violet-500" },
  { value: "OTHER", label: "Other", icon: HelpCircle, color: "text-slate-500" },
];

interface ReportFormProps {
  onSuccess?: () => void;
  subjectId?: string;
  subjectModel?: "User" | "Vehicle" | "Company" | "Booking";
  initialType?: string;
}

export function ReportForm({ onSuccess, subjectId, subjectModel, initialType }: ReportFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState(initialType || "OTHER");
  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const apiBaseUrl = resolveApiBaseUrl();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processFiles(files);
    e.target.value = "";
  };

  const processFiles = async (files: File[]) => {
    const newFiles = await Promise.all(
      files.filter((f) => f.type.startsWith("image/")).map((file) => {
        return new Promise<{ name: string; preview: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ name: file.name, preview: reader.result as string });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    setEvidenceFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const charCount = description.length;
  const charValid = charCount >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charValid) {
      toast({
        title: "Too short",
        description: "Please describe the issue in at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${apiBaseUrl}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeader(),
        },
        body: JSON.stringify({
          type,
          description,
          priority: "MEDIUM",
          subjectId,
          subjectModel,
          evidenceUrls: evidenceFiles.map((f) => f.preview),
          metadata,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to submit report");
      }

      toast({
        title: "Report submitted",
        description: "We'll review your report and take action. Thank you.",
      });

      setDescription("");
      setEvidenceFiles([]);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = REPORT_TYPES.find((t) => t.value === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type Selection – Icon Chips */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What are you reporting?
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {REPORT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                  isActive
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent/40"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : t.color)} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Describe the issue
          </Label>
          <span
            className={cn(
              "text-[11px] font-medium tabular-nums transition-colors",
              charValid ? "text-emerald-500" : "text-muted-foreground"
            )}
          >
            {charValid && <CheckCircle2 className="mr-0.5 inline h-3 w-3" />}
            {charCount}/10 min
          </span>
        </div>
        <Textarea
          placeholder={
            type === "SYSTEM_GLITCH"
              ? "What happened? What were you trying to do when the error appeared?"
              : type === "USER_BEHAVIOR"
                ? "Describe the behavior that concerned you..."
                : "Tell us exactly what went wrong..."
          }
          className="min-h-[110px] resize-none rounded-xl border-border/80 bg-muted/20 text-sm leading-relaxed transition-colors focus:bg-background"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Evidence Upload – Drop Zone */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attach screenshots
          <span className="ml-1 text-[10px] font-normal normal-case text-muted-foreground/60">
            (optional, up to 5)
          </span>
        </Label>

        {evidenceFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {evidenceFiles.map((file, index) => (
              <div
                key={index}
                className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border shadow-sm"
              >
                <img
                  src={file.preview}
                  alt={`Evidence ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {evidenceFiles.length < 5 && (
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 transition-all",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
            )}
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground/60" />
            <span className="text-xs font-medium text-muted-foreground">
              Drop images here or <span className="text-primary">browse</span>
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {/* Auto-capture notice */}
      {type === "SYSTEM_GLITCH" && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
          <Bug className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
          <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
            We'll automatically capture your browser, screen size, and the page URL to help our engineers debug faster.
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl py-2.5 font-semibold shadow-sm transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Report"
        )}
      </Button>
    </form>
  );
}
