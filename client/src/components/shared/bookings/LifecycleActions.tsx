"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { InspectionForm } from "./InspectionForm";
import { useToast } from "@/hooks/use-toast";
import { chatLifecycleAction } from "@/lib/chat-api";
import { 
  CheckCheck,
  CheckCircle2, 
  Circle, 
  Car, 
  Key, 
  ClipboardCheck,
  ChevronRight,
  AlertCircle,
  UploadCloud,
  MessageSquareText, 
  Calendar, 
  User, 
  Clock, 
  ShieldCheck,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface LifecycleActionsProps {
  booking: any;
  userType: "renter" | "provider";
  onRefresh: () => void;
}

const API_BASE = resolveApiBaseUrl();

export function LifecycleActions({ booking, userType, onRefresh }: LifecycleActionsProps) {
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState<"handover" | "return" | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ action: string; label: string; description: string } | null>(null);
  const { toast } = useToast();
  const status = booking.status;

  const handleAction = async (action: string, body?: any) => {
    setLoading(true);
    try {
      const data = await chatLifecycleAction(booking.id, action, body);
      if (data.success) {
        onRefresh();
        setActiveForm(null);
        toast({
          title: "Success",
          description: "Process updated successfully.",
        });
      } else {
        throw new Error(data.message || "Action failed");
      }
    } catch (err: any) {
      console.error("Action failed:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update process.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { 
      id: "CONFIRMED", 
      label: "Confirmed", 
      icon: CheckCircle2, 
      active: status === "CONFIRMED" || status === "approved"
    },
    { 
      id: "HANDOVER", 
      label: "Handover", 
      icon: Key, 
      active: status === "CONFIRMED" || status === "approved"
    },
    { 
      id: "ACTIVE", 
      label: "Active Trip", 
      icon: Car, 
      active: status === "ACTIVE" 
    },
    { 
      id: "RETURN", 
      label: "Return", 
      icon: ClipboardCheck, 
      active: status === "ACTIVE" 
    },
    { 
      id: "COMPLETED", 
      label: "Completed", 
      icon: CheckCircle2, 
      active: status === "COMPLETED" || status === "completed"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Stepper - Optimized for Visibility */}
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-6 bg-card border rounded-2xl shadow-sm overflow-hidden">
          {steps.map((step, idx) => {
            const currentStatus = status.toUpperCase();
            const normalizedStatus = (currentStatus === "APPROVED" ? "CONFIRMED" : currentStatus === "COMPLETED" ? "COMPLETED" : currentStatus);
            const isCompleted = idx < steps.findIndex(s => s.id === normalizedStatus) || normalizedStatus === "COMPLETED";
            
            return (
              <div key={step.id} className="flex-1 flex items-center last:flex-none">
                <div className="flex flex-col items-center gap-2 relative z-10 px-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                    step.active ? "bg-primary text-primary-foreground border-primary shadow-md scale-110" : 
                    isCompleted ? "bg-emerald-500 text-white border-emerald-500" :
                    "bg-muted text-muted-foreground border-muted"
                  )}>
                    {isCompleted && !step.active ? <CheckCheck className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-tight text-center max-w-[60px] leading-[1.1]",
                    step.active ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-[-10px] mb-6 bg-muted relative z-0">
                    <div className={cn(
                      "absolute inset-0 transition-all duration-700 ease-in-out",
                      (isCompleted || (step.active && status !== step.id)) ? "bg-primary w-full" : "bg-transparent w-0"
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Card */}
      <Card className="p-8 border shadow-md bg-card rounded-2xl">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-primary/10 border rounded-2xl">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-bold text-xl leading-none tracking-tight">Status Update</h4>
            <div className="text-sm text-muted-foreground font-medium leading-relaxed">
              {(status === "CONFIRMED" || status === "approved") && userType === "provider" && (
                <p>The booking is confirmed. Please <strong>Initialize Handover</strong> to share the inspection list with the renter.</p>
              )}
              {(status === "CONFIRMED" || status === "approved") && userType === "renter" && (
                <p>Waiting for the owner to start the handover process. You can use the chat to coordinate the meeting.</p>
              )}
              {status === "ACTIVE" && (
                <p>Rental is currently active. Once you are done, either party can <strong>Initiate Return</strong> to start the closing process.</p>
              )}
              {(status === "COMPLETED" || status === "completed") && (
                <p>Booking successfully completed. We hope you had a great trip!</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {(status === "CONFIRMED" || status === "approved") && userType === "provider" && !activeForm && (
            <>
              <Button 
                onClick={() => setConfirmAction({
                  action: "handover/initiate",
                  label: "Initialize Handover",
                  description: "This will notify the renter that you are ready to hand over the vehicle keys and start the inspection."
                })}
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm transition-all text-lg tracking-tight"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "INITIALIZE HANDOVER"}
                {!loading && <ChevronRight className="ml-2 w-6 h-6" />}
              </Button>
              <Button 
                onClick={() => setActiveForm("handover")}
                disabled={loading}
                variant="outline"
                className="w-full h-auto py-4 font-bold text-xs shadow-sm transition-all leading-tight uppercase tracking-widest"
              >
                COMPLETE HANDOVER <br/> (UPLOAD PHOTOS)
              </Button>
            </>
          )}

          {status === "ACTIVE" && !activeForm && (
            <>
              <Button 
                onClick={() => setConfirmAction({
                  action: "return/initiate",
                  label: "Initiate Return",
                  description: "This will start the vehicle return process. Both parties must be present for the final inspection."
                })}
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm transition-all text-lg tracking-tight"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "INITIATE RETURN"}
                {!loading && <ChevronRight className="ml-2 w-6 h-6" />}
              </Button>
              {userType === "provider" && (
                <Button 
                  onClick={() => setActiveForm("return")}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-auto py-4 font-bold text-xs shadow-sm transition-all leading-tight uppercase tracking-widest"
                >
                  COMPLETE RETURN <br/> (VERIFY CONDITION)
                </Button>
              )}
            </>
          )}

        </div>
      </Card>

      {/* Modal-based Inspection Forms */}
      <Dialog open={activeForm !== null} onOpenChange={(open) => !open && setActiveForm(null)}>
        <DialogContent className="max-w-2xl p-0 border rounded-3xl overflow-hidden shadow-2xl bg-background">
          <div className="p-8">
            {activeForm === "handover" && (
              <InspectionForm 
                title="Handover Inspection"
                description="Capture the vehicle's current condition from all angles before the trip starts."
                isSubmitting={loading}
                onSubmit={(photos, notes) => handleAction("handover/complete", { photos, notes })}
                onCancel={() => setActiveForm(null)}
              />
            )}

            {activeForm === "return" && (
              <InspectionForm 
                title="Return Inspection"
                description="Capture the vehicle's condition at the end of the trip to complete the booking."
                isSubmitting={loading}
                onSubmit={(photos, notes) => handleAction("return/complete", { photos, notes })}
                onCancel={() => setActiveForm(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">{confirmAction?.label}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold border-none bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmAction && handleAction(confirmAction.action)}
              className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Confirm Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
