"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CarFront,
  DollarSign,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HostSidebar } from "./HostSidebar";
import { VerificationTab } from "./VerificationTab";
import { ListingsTab } from "./ListingsTab";
import { WalletTab } from "./EarningsTab";
import { ToastContainer } from "./ToastContainer";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./useToast";
import { useDetailViewTracking } from "@/hooks/use-action-badges";
import { useRealTimeRefresh } from "@/hooks/use-real-time-refresh";
import type {
  ConfirmationConfig,
  DocumentItem,
  HostStatus,
  KYCStatus,
  VerificationData,
} from "./types";
import type { P2PHostDetail } from "@/lib/admin-p2p-api";
import {
  fetchP2PHostDetail,
  reviewP2PHost,
  reviewVerification,
  reviewVehicle,
} from "@/lib/admin-p2p-api";
import { updateAdminUserStatus } from "@/lib/admin-users-api";

interface P2PHostDetailPageProps {
  hostId: string;
}

export default function P2PHostDetailPageClient({
  hostId,
}: P2PHostDetailPageProps) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  // Mark P2P host as viewed when detail page loads
  useDetailViewTracking("P2P_HOST", hostId);
  const [hostData, setHostData] = useState<P2PHostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(
    null,
  );

  const loadHost = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchP2PHostDetail(hostId);
      setHostData(data);
      setLoadError(null);
    } catch (cause) {
      setHostData(null);
      setLoadError(
        cause instanceof Error ? cause.message : "Failed to load host details",
      );
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  // Subscribe to real-time refreshes
  useRealTimeRefresh(loadHost, ["P2P_HOST", "VEHICLE", "VERIFICATION"]);

  useEffect(() => {
    void loadHost();
  }, [loadHost]);

  const wait = () => new Promise((resolve) => setTimeout(resolve, 500));
  const showSuccess = (title: string, message: string) =>
    addToast("success", title, message);

  if (loading && !hostData) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="flex items-center justify-center p-6 md:p-8">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Loading host application...</p>
            </div>
          </Main>
        </div>
      </div>
    );
  }

  if (!hostData) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="p-6 md:p-8">
            <button
              onClick={() => router.push("/sysadmin/P2P")}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to P2P Approvals
            </button>
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
              {loadError || "Host application not found."}
            </div>
          </Main>
        </div>
      </div>
    );
  }

  const handleApproveHost = async () => {
    if (!hostData.reviewReadiness.canPromote) {
      addToast(
        "info",
        "Finish review first",
        hostData.reviewReadiness.blockers[0] ||
          "This applicant still has review blockers.",
      );
      return;
    }

    setModalConfig({
      title: "Approve P2P Host",
      description: `Promote ${hostData.user.name} to peer host? Their vehicles will remain in the listing review queue until you approve them separately.`,
      confirmLabel: "Approve Host",
      variant: "default",
      onConfirm: async () => {
        await wait();
        try {
          await reviewP2PHost(hostId, { status: "approved" });
          await loadHost();
          showSuccess(
            "Host Approved",
            `${hostData.user.name} is now a P2P host.`,
          );
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error ? cause.message : "Failed to approve host",
          );
        }
      },
    });
  };

  const handleRejectHost = () => {
    setModalConfig({
      title: "Reject P2P Host",
      description: `Reject ${hostData.user.name}'s host application? Their pending vehicles will be marked rejected.`,
      confirmLabel: "Reject",
      variant: "destructive",
      showReasonInput: true,
      onConfirm: async (reason) => {
        await wait();
        try {
          await reviewP2PHost(hostId, {
            status: "rejected",
            adminComment: reason || undefined,
          });
          await loadHost();
          showSuccess("Host Rejected", "Application has been rejected.");
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error ? cause.message : "Failed to reject host",
          );
        }
      },
    });
  };

  const handleSuspendHost = () => {
    setModalConfig({
      title: "Suspend P2P Host",
      description: `Are you sure you want to suspend ${hostData.user.name}'s account? This will prevent them from accessing the platform.`,
      confirmLabel: "Suspend",
      variant: "destructive",
      showReasonInput: true,
      onConfirm: async (reason) => {
        await wait();
        try {
          await updateAdminUserStatus(hostData.user.id, "SUSPENDED");
          await loadHost();
          showSuccess("Host Suspended", "Host account has been suspended.");
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error ? cause.message : "Failed to suspend host",
          );
        }
      },
    });
  };

  const handleReactivateHost = () => {
    setModalConfig({
      title: "Reactivate P2P Host",
      description: `Are you sure you want to reactivate ${hostData.user.name}'s account? This will restore their access to the platform.`,
      confirmLabel: "Reactivate",
      variant: "default",
      onConfirm: async () => {
        await wait();
        try {
          await updateAdminUserStatus(hostData.user.id, "ACTIVE");
          await loadHost();
          showSuccess("Host Reactivated", "Host account has been restored.");
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error
              ? cause.message
              : "Failed to reactivate host",
          );
        }
      },
    });
  };

  const handleApproveDoc = async (doc: DocumentItem) => {
    setModalConfig({
      title: "Approve Document",
      description: `Approve ${doc.title} for ${hostData.user.name}?`,
      confirmLabel: "Approve",
      variant: "default",
      onConfirm: async () => {
        await wait();
        try {
          await reviewVerification(doc.id, { status: "APPROVED" });
          await loadHost();
          showSuccess("Document Approved", `${doc.title} is now approved.`);
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error
              ? cause.message
              : "Failed to approve document",
          );
        }
      },
    });
  };

  const handleRejectDoc = (doc: DocumentItem) => {
    setModalConfig({
      title: "Reject Document",
      description: `Reject ${doc.title} for ${hostData.user.name}?`,
      confirmLabel: "Reject",
      variant: "destructive",
      showReasonInput: true,
      onConfirm: async (reason) => {
        await wait();
        try {
          await reviewVerification(doc.id, {
            status: "REJECTED",
            adminComment: reason || undefined,
          });
          await loadHost();
          showSuccess("Document Rejected", `${doc.title} was rejected.`);
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error
              ? cause.message
              : "Failed to reject document",
          );
        }
      },
    });
  };

  const handleApproveVehicle = async (
    vehicleId: string,
    vehicleTitle: string,
  ) => {
    if (hostData.user.verificationLevel !== "PEER_HOST") {
      addToast(
        "info",
        "Promote host first",
        "Approve the peer-host application before making vehicles available to renters.",
      );
      return;
    }

    setModalConfig({
      title: "Approve Vehicle",
      description: `Approve ${vehicleTitle} for listing?`,
      confirmLabel: "Approve",
      variant: "default",
      onConfirm: async () => {
        await wait();
        try {
          await reviewVehicle(vehicleId, { status: "APPROVED" });
          await loadHost();
          showSuccess("Vehicle Approved", `${vehicleTitle} is now available.`);
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error
              ? cause.message
              : "Failed to approve vehicle",
          );
        }
      },
    });
  };

  const handleRejectVehicle = (vehicleId: string, vehicleTitle: string) => {
    setModalConfig({
      title: "Reject Vehicle",
      description: `Reject ${vehicleTitle}? It will be removed from the pending queue.`,
      confirmLabel: "Reject",
      variant: "destructive",
      showReasonInput: true,
      onConfirm: async (reason) => {
        await wait();
        try {
          await reviewVehicle(vehicleId, {
            status: "REJECTED",
            adminComment: reason || undefined,
          });
          await loadHost();
          showSuccess("Vehicle Rejected", `${vehicleTitle} was rejected.`);
        } catch (cause) {
          addToast(
            "error",
            "Error",
            cause instanceof Error ? cause.message : "Failed to reject vehicle",
          );
        }
      },
    });
  };

  const handleDelist = async (_vehicleId: string, vehicleTitle: string) => {
    setModalConfig({
      title: "Delist Vehicle",
      description: `${vehicleTitle} is already outside the pending approval flow. A dedicated delist endpoint is still needed for active listings.`,
      confirmLabel: "Close",
      variant: "default",
      onConfirm: async () => {
        await wait();
      },
    });
  };

  const hostStatus: HostStatus =
    hostData.user.status === "SUSPENDED"
      ? "suspended"
      : hostData.applicationStatus === "approved"
        ? "active"
        : hostData.applicationStatus === "rejected"
          ? "rejected"
          : "pending";

  const resolveKycStatus = (documentType: string): KYCStatus => {
    const verification = hostData.verifications.find(
      (entry) => entry.documentType === documentType,
    );

    if (!verification) return "unsubmitted";
    if (verification.status === "APPROVED") return "verified";
    if (verification.status === "REJECTED") return "rejected";
    return "pending";
  };

  const resolveIdentityStatus = (): KYCStatus => {
    const identityVerifications = hostData.verifications.filter(
      (entry) =>
        entry.documentType === "NATIONAL_ID" ||
        entry.documentType === "PASSPORT",
    );

    if (identityVerifications.some((entry) => entry.status === "APPROVED")) {
      return "verified";
    }

    if (identityVerifications.some((entry) => entry.status === "PENDING")) {
      return "pending";
    }

    if (identityVerifications.some((entry) => entry.status === "REJECTED")) {
      return "rejected";
    }

    return "unsubmitted";
  };

  const verificationData: VerificationData = {
    identityStatus: resolveIdentityStatus(),
    drivingLicenseStatus: resolveKycStatus("DRIVER_LICENSE"),
    insuranceStatus: "unsubmitted" as const,
    backgroundCheckStatus: "unsubmitted" as const,
    documents: hostData.verifications.map((verification) => ({
      id: verification.id,
      title:
        verification.documentType === "NATIONAL_ID"
          ? "National ID"
          : verification.documentType === "DRIVER_LICENSE"
            ? "Driver's License"
            : verification.documentType === "PASSPORT"
              ? "Passport"
              : verification.documentType,
      type:
        verification.documentType === "NATIONAL_ID" ||
        verification.documentType === "PASSPORT"
          ? ("id" as const)
          : verification.documentType === "DRIVER_LICENSE"
            ? ("license" as const)
            : ("insurance" as const),
      uploadedAt: verification.createdAt || new Date().toISOString(),
      status:
        verification.status === "APPROVED"
          ? ("verified" as const)
          : verification.status === "REJECTED"
            ? ("rejected" as const)
            : ("pending" as const),
      fileSize: "N/A",
    })),
  };

  const listings = hostData.vehicles.map((vehicle) => ({
    id: vehicle.id,
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    category: "Vehicle",
    plate: vehicle.plate,
    dailyRate: vehicle.price,
    status:
      vehicle.status === "AVAILABLE"
        ? ("approved" as const)
        : vehicle.status === "PENDING_APPROVAL"
          ? ("pending" as const)
          : vehicle.status === "RETIRED"
            ? ("rejected" as const)
            : vehicle.status === "MAINTENANCE"
              ? ("maintenance" as const)
              : ("pending" as const),
    adminComment: vehicle.adminComment,
    totalTrips: 0,
    rating: 0,
    photos: vehicle.photos,
    documents: vehicle.documents,
  }));

  const handleViewVehicle = (vehicleId: string) => {
    router.push(`/sysadmin/P2P/vehicles/${vehicleId}`);
  };

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="overflow-y-auto p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <button
              onClick={() => router.push("/sysadmin/P2P")}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to P2P Approvals
            </button>

            {loadError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
                {loadError}
              </div>
            )}

            {hostData.applicationStatus !== "approved" && (
              <div
                className={`mb-6 rounded-xl border p-4 ${
                  hostData.reviewReadiness.canPromote
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                }`}
              >
                <p className="font-semibold">
                  {hostData.reviewReadiness.canPromote
                    ? "This applicant is ready for peer-host promotion."
                    : "Promotion is currently blocked."}
                </p>
                {!hostData.reviewReadiness.canPromote && (
                  <div className="mt-2 space-y-1 text-sm">
                    {hostData.reviewReadiness.blockers.map((blocker) => (
                      <p key={blocker}>{blocker}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
              <HostSidebar
                host={{
                  id: hostData.user.id,
                  name: hostData.user.name,
                  email: hostData.user.email,
                  phone: hostData.user.phoneNumber || "N/A",
                  address: hostData.user.address || "N/A",
                  joinDate: hostData.user.createdAt || new Date().toISOString(),
                  status: hostStatus,
                  verificationLevel: hostData.user.verificationLevel,
                  accountStatus: hostData.user.status,
                  image: hostData.user.image,
                }}
                canPromote={hostData.reviewReadiness.canPromote}
                blockers={hostData.reviewReadiness.blockers}
                onApprove={handleApproveHost}
                onReject={handleRejectHost}
                onSuspend={handleSuspendHost}
                onReactivate={handleReactivateHost}
              />

              <div className="min-w-0 flex-1">
                <Tabs defaultValue="kyc" className="w-full">
                  <TabsList className="mb-6 grid w-full grid-cols-3 bg-muted/60 p-1">
                    <TabsTrigger value="kyc" className="gap-2">
                      <ShieldCheck className="hidden h-4 w-4 sm:block" />
                      Verification
                    </TabsTrigger>
                    <TabsTrigger value="listings" className="gap-2">
                      <CarFront className="hidden h-4 w-4 sm:block" />
                      Listings
                      <span className="ml-1.5 hidden flex-shrink-0 items-center justify-center rounded-full bg-primary/10 px-2 text-xs text-primary sm:flex">
                        {listings.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="wallet" className="gap-2">
                      <DollarSign className="hidden h-4 w-4 sm:block" />
                      Wallet
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="kyc"
                    className="mt-0 focus-visible:ring-0"
                  >
                    <VerificationTab
                      data={verificationData}
                      verifications={hostData.verifications}
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
                      onViewVehicle={handleViewVehicle}
                      onApproveVehicle={handleApproveVehicle}
                      onRejectVehicle={handleRejectVehicle}
                      onDelist={handleDelist}
                    />
                  </TabsContent>

                  <TabsContent value="wallet" className="space-y-6">
                    <WalletTab
                      wallet={hostData.wallet}
                      ledger={hostData.ledger}
                    />
                  </TabsContent>
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
