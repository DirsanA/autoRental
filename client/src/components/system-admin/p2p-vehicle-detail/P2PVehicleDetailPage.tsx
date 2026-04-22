"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Car,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchP2PVehicleDetail,
  reviewVehicle,
  type P2PVehicleDetail,
} from "@/lib/admin-p2p-api";
import { VehicleImageGallery } from "./VehicleImageGallery";
import { VehicleSpecsCard } from "./VehicleSpecsCard";
import { VehicleDocumentsCard } from "./VehicleDocumentsCard";
import { ToastContainer } from "./ToastContainer";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./useToast";
import type { ConfirmationConfig } from "./types";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; cls: string }
> = {
  AVAILABLE: {
    label: "Approved / Available",
    icon: CheckCircle2,
    cls: "text-green-700 bg-green-100 border-green-200",
  },
  PENDING_APPROVAL: {
    label: "Pending Review",
    icon: Clock,
    cls: "text-yellow-700 bg-yellow-100 border-yellow-200",
  },
  RETIRED: {
    label: "Rejected / Retired",
    icon: XCircle,
    cls: "text-red-700 bg-red-100 border-red-200",
  },
  MAINTENANCE: {
    label: "Under Maintenance",
    icon: AlertTriangle,
    cls: "text-orange-700 bg-orange-100 border-orange-200",
  },
  BOOKED: {
    label: "Currently Booked",
    icon: Car,
    cls: "text-blue-700 bg-blue-100 border-blue-200",
  },
};

export function P2PVehicleDetailPage({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [vehicle, setVehicle] = useState<P2PVehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(null);

  const loadVehicle = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchP2PVehicleDetail(vehicleId);
      setVehicle(data);
      setLoadError(null);
    } catch (cause) {
      setVehicle(null);
      setLoadError(
        cause instanceof Error ? cause.message : "Failed to load vehicle"
      );
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    void loadVehicle();
  }, [loadVehicle]);

  if (loading && !vehicle) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="flex items-center justify-center p-6 md:p-8">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Loading vehicle details...</p>
            </div>
          </Main>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="relative flex h-dvh w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Main className="p-6 md:p-8">
            <button
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </button>
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
              {loadError || "Vehicle not found."}
            </div>
          </Main>
        </div>
      </div>
    );
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const status = statusConfig[vehicle.status] || statusConfig.PENDING_APPROVAL;
  const StatusIcon = status.icon;

  const handleApprove = () => {
    setModalConfig({
      title: "Approve Vehicle",
      description: `Approve "${title}" (${vehicle.plate}) for listing? It will become available to renters.`,
      confirmLabel: "Approve Vehicle",
      variant: "default",
      onConfirm: async () => {
        try {
          await reviewVehicle(vehicle.id, { status: "APPROVED" });
          await loadVehicle();
          addToast("success", "Vehicle Approved", `${title} is now available for booking.`);
        } catch (cause) {
          addToast("error", "Error", cause instanceof Error ? cause.message : "Failed to approve");
        }
      },
    });
  };

  const handleReject = () => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return;

    setModalConfig({
      title: "Reject Vehicle",
      description: `Reject "${title}" (${vehicle.plate})? It will be removed from the approval queue.`,
      confirmLabel: "Reject Vehicle",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await reviewVehicle(vehicle.id, {
            status: "REJECTED",
            adminComment: reason || undefined,
          });
          await loadVehicle();
          addToast("success", "Vehicle Rejected", `${title} has been rejected.`);
        } catch (cause) {
          addToast("error", "Error", cause instanceof Error ? cause.message : "Failed to reject");
        }
      },
    });
  };

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="overflow-y-auto p-6 md:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {/* Back nav */}
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Host Details
            </button>

            {/* ── Vehicle Header ── */}
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                  <Car className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono uppercase tracking-wider">{vehicle.plate}</span>
                    <span>•</span>
                    {vehicle.vin && (
                      <>
                        <span className="font-mono text-xs">{vehicle.vin}</span>
                        <span>•</span>
                      </>
                    )}
                    <Badge
                      variant="outline"
                      className={cn("gap-1 border font-normal", status.cls)}
                    >
                      <StatusIcon className="h-3 w-3" /> {status.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {vehicle.status === "PENDING_APPROVAL" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button
                    className="gap-2 bg-green-600 text-white hover:bg-green-700"
                    onClick={handleApprove}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                </div>
              )}
            </div>

            {/* Admin comment banner */}
            {vehicle.adminComment && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <strong>Admin Note:</strong> {vehicle.adminComment}
              </div>
            )}

            {/* Owner info bar */}
            {vehicle.owner && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">{vehicle.owner.name}</span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{vehicle.owner.email}</span>
                  {vehicle.owner.phoneNumber && (
                    <>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{vehicle.owner.phoneNumber}</span>
                    </>
                  )}
                  <span className="mx-2 text-muted-foreground">•</span>
                  <Badge variant="outline" className="text-xs font-normal capitalize">
                    {vehicle.owner.verificationLevel.replaceAll("_", " ").toLowerCase()}
                  </Badge>
                </div>
              </div>
            )}

            {/* ── Main Content Grid ── */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
              {/* Left: Images */}
              <div className="flex flex-col gap-6">
                <VehicleImageGallery
                  photos={vehicle.photos}
                  title={title}
                />
                <VehicleDocumentsCard documents={vehicle.documents} />
              </div>

              {/* Right: Specs */}
              <VehicleSpecsCard vehicle={vehicle} />
            </div>

            {/* Bottom action bar for pending vehicles */}
            {vehicle.status === "PENDING_APPROVAL" && (
              <div className="mt-8 flex items-center justify-between rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50/50 p-5 dark:border-yellow-800 dark:bg-yellow-950/20">
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                    This vehicle is awaiting your review
                  </p>
                  <p className="mt-0.5 text-sm text-yellow-700/80 dark:text-yellow-400/70">
                    Review all images and documents above before making a decision.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button
                    size="lg"
                    className="gap-2 bg-green-600 text-white hover:bg-green-700"
                    onClick={handleApprove}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </div>
            )}
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
