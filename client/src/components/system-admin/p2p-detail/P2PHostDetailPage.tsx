"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CarFront, DollarSign, ArrowLeft } from "lucide-react";

import { HostSidebar } from "./HostSidebar";
import { VerificationTab } from "./VerificationTab";
import { ListingsTab } from "./ListingsTab";
import { EarningsTab } from "./EarningsTab";
import { ToastContainer } from "./ToastContainer";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./useToast";

import { getHostData } from "./data";
import type { ConfirmationConfig, HostStatus, DocumentItem } from "./types";

export default function P2PHostDetailPage({ hostId }: { hostId: string }) {
  const router = useRouter();
  const initialData = useMemo(() => getHostData(hostId), [hostId]);

  const [host, setHost] = useState(initialData.host);
  const [verification, setVerification] = useState(initialData.verification);
  const [listings, setListings] = useState(initialData.listings);
  const [earnings] = useState(initialData.earnings);

  const { toasts, addToast, removeToast } = useToast();
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(
    null,
  );

  const wait = () => new Promise((resolve) => setTimeout(resolve, 800));
  const showSuccess = (title: string, msg: string) =>
    addToast("success", title, msg);

  // ─── Actions ───

  const handleStatusChange = (newStatus: HostStatus) => {
    setModalConfig({
      title: "Update Host Status",
      description: `Change status to ${newStatus}?`,
      confirmLabel: "Confirm",
      variant:
        newStatus === "rejected" || newStatus === "suspended"
          ? "destructive"
          : "default",
      onConfirm: async () => {
        await wait();
        setHost((prev) => ({ ...prev, status: newStatus }));
        showSuccess("Status Updated", `Host is now ${newStatus}.`);
      },
    });
  };

  const handleDelete = () => {
    setModalConfig({
      title: "Delete Host",
      description:
        "Permanently delete this host profile? This cannot be undone.",
      confirmLabel: "Delete Permanently",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        addToast("success", "Host Deleted", "Redirecting...");
        setTimeout(() => router.push("/sysadmin/p2p"), 1000);
      },
    });
  };

  const handleApproveDoc = (doc: DocumentItem) => {
    setModalConfig({
      title: "Approve Document",
      description: `Approve the submitted ${doc.title}?`,
      confirmLabel: "Approve",
      variant: "default",
      onConfirm: async () => {
        await wait();
        setVerification((v) => ({
          ...v,
          documents: v.documents.map((d) =>
            d.id === doc.id ? { ...d, status: "verified" } : d,
          ),
        }));
        showSuccess("Document Approved", `${doc.title} marked as verified.`);
      },
    });
  };

  const handleRejectDoc = (doc: DocumentItem) => {
    setModalConfig({
      title: "Reject Document",
      description: `Reject ${doc.title}? The host will be asked to re-upload.`,
      confirmLabel: "Reject",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        setVerification((v) => ({
          ...v,
          documents: v.documents.map((d) =>
            d.id === doc.id ? { ...d, status: "rejected" } : d,
          ),
        }));
        showSuccess("Document Rejected", `${doc.title} was rejected.`);
      },
    });
  };

  const handleDelist = (listingId: string) => {
    setModalConfig({
      title: "Force Delist Vehicle",
      description: "Remove this vehicle from being available to renters?",
      confirmLabel: "Delist",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        setListings((l) =>
          l.map((v) => (v.id === listingId ? { ...v, status: "unlisted" } : v)),
        );
        showSuccess("Vehicle Delisted", "The listing is no longer active.");
      },
    });
  };

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl">
            <button
              onClick={() => router.push("/sysadmin/p2p")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" /> Back to P2P Approvals
            </button>
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-8 items-start">
              {/* Left Sidebar Layout distinct from Company layout */}
              <HostSidebar
                host={host}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />

              {/* Main Content Area */}
              <div className="w-full flex-1 min-w-0">
                <Tabs defaultValue="kyc" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 p-1 mb-6 bg-muted/60">
                    <TabsTrigger value="kyc" className="gap-2">
                      <ShieldCheck className="h-4 w-4 hidden sm:block" />
                      Verification
                    </TabsTrigger>
                    <TabsTrigger value="listings" className="gap-2">
                      <CarFront className="h-4 w-4 hidden sm:block" />
                      Listings
                      <span className="ml-1.5 hidden rounded-full bg-primary/10 px-2 flex-shrink-0 text-xs text-primary sm:flex items-center justify-center">
                        {listings.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="earnings" className="gap-2">
                      <DollarSign className="h-4 w-4 hidden sm:block" />
                      Earnings
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-0">
                    <TabsContent
                      value="kyc"
                      className="mt-0 focus-visible:ring-0"
                    >
                      <VerificationTab
                        data={verification}
                        onApproveDoc={handleApproveDoc}
                        onRejectDoc={handleRejectDoc}
                      />
                    </TabsContent>

                    <TabsContent
                      value="listings"
                      className="mt-0 focus-visible:ring-0"
                    >
                      <ListingsTab
                        listings={listings}
                        onDelist={handleDelist}
                      />
                    </TabsContent>

                    <TabsContent
                      value="earnings"
                      className="mt-0 focus-visible:ring-0"
                    >
                      <EarningsTab earnings={earnings} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </Main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <ConfirmationModal
        config={modalConfig}
        onClose={() => setModalConfig(null)}
      />
    </div>
  );
}
