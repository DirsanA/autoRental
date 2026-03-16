"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageSquare, History, FileText } from "lucide-react";

import { DisputeSidebar } from "./DisputeSidebar";
import { MessagesTab } from "./MessagesTab";
import { TimelineTab } from "./TimelineTab";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "@/hooks/use-toast";

import { getDisputeData } from "../dispute-management/data";
import type { ConfirmationConfig, DisputeStatus } from "../dispute-management/types";

export function DisputeDetailPage({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const initialData = useMemo(() => getDisputeData(disputeId), [disputeId]);

  const [dispute, setDispute] = useState(initialData.dispute);
  const [messages] = useState(initialData.messages);
  const [timeline] = useState(initialData.timeline);

  const { toast } = useToast();
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(null);

  const wait = () => new Promise((resolve) => setTimeout(resolve, 800));

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAssign = () => {
    setModalConfig({
      title: "Assign Case",
      description: "Assign this dispute to yourself for review?",
      confirmLabel: "Assign to Me",
      variant: "default",
      onConfirm: async () => {
        await wait();
        setDispute((prev) => ({ ...prev, assignedTo: "Current Admin" }));
        toast({
          title: "Case Assigned",
          description: "You are now the handler for this dispute.",
        });
      },
    });
  };

  const handleStatusChange = (newStatus: DisputeStatus) => {
    let title = "Update Status";
    let desc = `Change the case status to ${newStatus.replace("_", " ")}?`;
    let variant: "default" | "destructive" = "default";

    if (newStatus === "resolved") {
      title = "Mark as Resolved";
      desc = "This will notify both parties that the dispute has been settled.";
    } else if (newStatus === "escalated") {
      title = "Escalate Case";
      desc = "Move this dispute to senior management review?";
      variant = "destructive";
    }

    setModalConfig({
      title,
      description: desc,
      confirmLabel: "Confirm",
      variant,
      onConfirm: async () => {
        await wait();
        const now = new Date().toISOString();
        setDispute((prev) => ({ 
           ...prev, 
           status: newStatus,
           updatedAt: now,
           resolvedAt: newStatus === "resolved" ? now : prev.resolvedAt
        }));
        toast({
          title: "Status Updated",
          description: `Case is now ${newStatus.replace("_", " ")}.`,
        });
      },
    });
  };

  const handleClose = () => {
    setModalConfig({
      title: "Archive / Close Case",
      description: "Are you sure you want to close this dispute? No further public messages can be sent.",
      confirmLabel: "Close Permanently",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        setDispute((prev) => ({ ...prev, status: "closed" }));
        toast({
          title: "Case Closed",
          description: "The dispute has been archived.",
        });
      },
    });
  };

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push("/sysadmin/disputes")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> 
                Back to Disputes
              </button>
              
              <div className="flex items-center gap-3">
                 <span className="text-xs text-muted-foreground">
                    Last updated {new Date(dispute.updatedAt).toLocaleString()}
                 </span>
              </div>
            </div>

            {/* Title Section */}
            <div className="mb-8">
               <h1 className="text-3xl font-bold tracking-tight mb-2">{dispute.title}</h1>
               <p className="text-muted-foreground leading-relaxed max-w-3xl">
                 {dispute.shortDescription}
               </p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
              {/* Left Content Area (Tabs) */}
              <div className="w-full flex-1 min-w-0 order-2 lg:order-1">
                <Tabs defaultValue="messages" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 p-1 mb-6 bg-muted/60">
                    <TabsTrigger value="messages" className="gap-2">
                      <MessageSquare className="h-4 w-4 hidden sm:block" />
                      Messages
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="gap-2">
                      <History className="h-4 w-4 hidden sm:block" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2">
                      <FileText className="h-4 w-4 hidden sm:block" />
                      Evidence
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-0">
                    <TabsContent value="messages" className="mt-0 focus-visible:ring-0">
                       <MessagesTab messages={messages} />
                    </TabsContent>
                    <TabsContent value="timeline" className="mt-0 focus-visible:ring-0">
                       <TimelineTab events={timeline} />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-0 focus-visible:ring-0">
                       <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                          No official documents or images have been uploaded to this case yet.
                       </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Right Sidebar */}
              <div className="order-1 lg:order-2">
                <DisputeSidebar 
                  dispute={dispute}
                  onAssign={handleAssign}
                  onResolve={() => handleStatusChange("resolved")}
                  onEscalate={() => handleStatusChange("escalated")}
                  onClose={handleClose}
                />
              </div>
            </div>
          </div>
        </Main>
      </div>

      <ConfirmationModal
        config={modalConfig}
        onClose={() => setModalConfig(null)}
      />
    </div>
  );
}
