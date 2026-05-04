"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportForm } from "./ReportForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface ReportIssueModalProps {
  trigger?: React.ReactNode;
  subjectId?: string;
  subjectModel?: "User" | "Vehicle" | "Company" | "Booking";
  initialType?: "SYSTEM_GLITCH" | "USER_BEHAVIOR" | "VEHICLE_ISSUE" | "COMPANY_ISSUE" | "OTHER";
}

export function ReportIssueModal({
  trigger,
  subjectId,
  subjectModel,
  initialType,
}: ReportIssueModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <AlertCircle className="h-4 w-4" />
            Report Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] gap-0 p-0 overflow-hidden">
        {/* Decorative header band */}
        <div className="relative bg-gradient-to-br from-rose-500/10 via-primary/5 to-transparent px-6 pb-4 pt-6">
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100/80 dark:bg-rose-900/30">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
          </div>
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Report an Issue
            </DialogTitle>
            <DialogDescription className="max-w-[380px] text-[13px] leading-relaxed">
              Help us keep the platform safe and reliable. Your report is confidential and will be reviewed by our admin team.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form area */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          <ReportForm
            onSuccess={() => setOpen(false)}
            subjectId={subjectId}
            subjectModel={subjectModel}
            initialType={initialType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
