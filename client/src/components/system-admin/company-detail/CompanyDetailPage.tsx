"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Car, Star, DollarSign } from "lucide-react";

// Components
import { CompanyHeader } from "./CompanyHeader";
import { OverviewTab } from "./OverviewTab";
import { VehiclesTab } from "./VehiclesTab";
import { ReviewsTab } from "./ReviewsTab";
import { FinancialsTab } from "./FinancialsTab";
import { ToastContainer } from "./ToastContainer";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./useToast";

// Data
import { getCompanyData } from "./data";
import type { Review, Vehicle, ConfirmationConfig } from "./types";

interface CompanyDetailPageProps {
  companyId: string;
}

export default function CompanyDetailPage({
  companyId,
}: CompanyDetailPageProps) {
  const router = useRouter();

  // ─── Local State hooks (simulating API state) ────────────────────────────────

  // We initialize the "database state" from our static mock data.
  // We use useMemo to only initialize once per component mount.
  const initialData = useMemo(() => getCompanyData(companyId), [companyId]);

  const [company, setCompany] = useState(initialData.company);
  const [vehicles, setVehicles] = useState(initialData.vehicles);
  const [reviews, setReviews] = useState(initialData.reviews);
  const [financials] = useState(initialData.financials);

  // ─── Ephemeral UI State (Toasts & Modals) ──────────────────────────────────

  const { toasts, addToast, removeToast } = useToast();
  const [modalConfig, setModalConfig] = useState<ConfirmationConfig | null>(
    null,
  );

  // Helper macro for showing success easily
  const showSuccess = (title: string, msg: string) =>
    addToast("success", title, msg);

  // Simulates network latency (800ms)
  const wait = () => new Promise((resolve) => setTimeout(resolve, 800));

  // ─── Company Handlers ────────────────────────────────────────────────────────

  const handleCompanyEdit = () => {
    addToast("info", "Edit Mode", "Feature coming soon.");
  };

  const handleCompanySuspend = () => {
    setModalConfig({
      title: "Suspend Company",
      description: `Are you sure you want to suspend ${company.name}? This will hide all their vehicles and halt new bookings.`,
      confirmLabel: "Suspend",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        setCompany((c) => ({ ...c, status: "suspended" }));
        showSuccess("Company Suspended", `${company.name} is now suspended.`);
      },
    });
  };

  const handleCompanyReactivate = () => {
    setModalConfig({
      title: "Reactivate Company",
      description: `Reactivate ${company.name}? Their vehicles will be visible to renters again.`,
      confirmLabel: "Reactivate",
      variant: "default",
      onConfirm: async () => {
        await wait();
        setCompany((c) => ({ ...c, status: "active" }));
        showSuccess(
          "Company Reactivated",
          `${company.name} is active and their fleet is online.`,
        );
      },
    });
  };

  const handleCompanyDelete = () => {
    setModalConfig({
      title: "Delete Company",
      description:
        "This action is permanent and cannot be undone. All vehicles, reviews, and bookings associated with this company will be removed.",
      confirmLabel: "Delete Permanently",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        addToast(
          "success",
          "Company Deleted",
          "The company has been permanently removed.",
        );
        // Simulate redirecting away after deleting
        setTimeout(() => router.push("/sysadmin/companies"), 1000);
      },
    });
  };

  // ─── Vehicle Handlers ────────────────────────────────────────────────────────

  const handleVehicleView = (v: Vehicle) => {
    addToast("info", "View Details", `Opening details for ${v.name}`);
  };

  const handleVehicleSuspend = (v: Vehicle) => {
    setModalConfig({
      title: "Suspend Vehicle",
      description: `Are you sure you want to suspend the ${v.name}? It will no longer be available for rent.`,
      confirmLabel: "Suspend",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        setVehicles((prev) =>
          prev.map((item) =>
            item.id === v.id ? { ...item, status: "maintenance" } : item,
          ),
        );
        showSuccess(
          "Vehicle Suspended",
          `${v.name} status updated to maintenance.`,
        );
      },
    });
  };

  const handleVehicleDelete = (v: Vehicle) => {
    setModalConfig({
      title: "Delete Vehicle",
      description: `Are you sure you want to delete ${v.name} (${v.plateNumber})? This is irreversible.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        setVehicles((prev) => prev.filter((item) => item.id !== v.id));
        showSuccess("Vehicle Deleted", `${v.name} removed from fleet.`);
      },
    });
  };

  // ─── Review Handlers ─────────────────────────────────────────────────────────

  const handleReviewFlag = (r: Review) => {
    const isCurrentlyFlagged = r.flagged;
    const actionName = isCurrentlyFlagged ? "Unflag" : "Flag";

    setModalConfig({
      title: `${actionName} Review`,
      description: `Are you sure you want to ${isCurrentlyFlagged ? "remove the flag from" : "flag"} this review by ${r.customerName}?`,
      confirmLabel: actionName,
      variant: "default",
      onConfirm: async () => {
        await wait();
        setReviews((prev) =>
          prev.map((item) =>
            item.id === r.id ? { ...item, flagged: !isCurrentlyFlagged } : item,
          ),
        );
        showSuccess(
          "Review Updated",
          `The review has been ${isCurrentlyFlagged ? "unflagged" : "flagged successfully"}.`,
        );
      },
    });
  };

  const handleReviewDelete = (r: Review) => {
    setModalConfig({
      title: "Delete Review",
      description: "Permanently delete this review? This cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await wait();
        setReviews((prev) => prev.filter((item) => item.id !== r.id));
        showSuccess("Review Deleted", "The review has been removed.");
      },
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        {/* Main scrollable body */}
        <Main className="p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            {/* Header section */}
            <CompanyHeader
              company={company}
              onBack={() => router.push("/sysadmin/companies")}
              onEdit={handleCompanyEdit}
              onSuspend={handleCompanySuspend}
              onReactivate={handleCompanyReactivate}
              onDelete={handleCompanyDelete}
            />

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              {/* Tab trigger list */}
              <TabsList className="grid w-full grid-cols-4 sm:w-auto p-1 mb-6 bg-muted/60">
                <TabsTrigger value="overview" className="gap-2">
                  <Building2 className="h-4 w-4 hidden sm:block" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="gap-2">
                  <Car className="h-4 w-4 hidden sm:block" />
                  Vehicles
                  <span className="ml-1.5 hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary sm:inline-block">
                    {vehicles.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2">
                  <Star className="h-4 w-4 hidden sm:block" />
                  Reviews
                  <span className="ml-1.5 hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary sm:inline-block">
                    {reviews.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="financials" className="gap-2">
                  <DollarSign className="h-4 w-4 hidden sm:block" />
                  Financials
                </TabsTrigger>
              </TabsList>

              {/* Tab Panels */}
              <TabsContent
                value="overview"
                className="mt-0 focus-visible:ring-0"
              >
                <OverviewTab company={company} financials={financials} />
              </TabsContent>

              <TabsContent
                value="vehicles"
                className="mt-0 focus-visible:ring-0"
              >
                <VehiclesTab
                  vehicles={vehicles}
                  onView={handleVehicleView}
                  onSuspend={handleVehicleSuspend}
                  onDelete={handleVehicleDelete}
                />
              </TabsContent>

              <TabsContent
                value="reviews"
                className="mt-0 focus-visible:ring-0"
              >
                <ReviewsTab
                  reviews={reviews}
                  onFlag={handleReviewFlag}
                  onDelete={handleReviewDelete}
                />
              </TabsContent>

              <TabsContent
                value="financials"
                className="mt-0 focus-visible:ring-0"
              >
                <FinancialsTab financials={financials} />
              </TabsContent>
            </Tabs>
          </div>
        </Main>
      </div>

      {/* Ephemeral UI Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <ConfirmationModal
        config={modalConfig}
        onClose={() => setModalConfig(null)}
      />
    </div>
  );
}
