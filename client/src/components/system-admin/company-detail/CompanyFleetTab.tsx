"use client";

import { useEffect, useState } from "react";
import { fetchCompanyVehicles, updateVehicleStatus } from "@/lib/admin-companies-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Ban, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export function CompanyFleetTab({ companyId }: { companyId: string }) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmVehicle, setConfirmVehicle] = useState<{
    id: string;
    currentStatus: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCompanyVehicles(companyId)
      .then((data) => {
        if (!cancelled) setVehicles(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const handleToggleStatus = async (
    vehicleId: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "SUSPENDED" ? "AVAILABLE" : "SUSPENDED";
    setActionId(vehicleId);
    try {
      const updated = await updateVehicleStatus(vehicleId, newStatus);
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicleId || v.id === vehicleId ? updated : v))
      );
      toast({ title: "Status updated", description: `Vehicle is now ${newStatus}` });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading fleet...</div>;
  if (error) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Fleet</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
  if (vehicles.length === 0) return <div className="p-6 text-sm text-muted-foreground">This company has no vehicles.</div>;

  const pendingVehicleId = confirmVehicle?.id;
  const pendingVehicle = pendingVehicleId
    ? vehicles.find((v) => (v._id || v.id) === pendingVehicleId) || null
    : null;
  const pendingCurrentStatus = confirmVehicle?.currentStatus || pendingVehicle?.status;
  const pendingNextStatus =
    pendingCurrentStatus === "SUSPENDED" ? "AVAILABLE" : "SUSPENDED";

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => {
          const id = vehicle._id || vehicle.id;
          const isSuspended = vehicle.status === "SUSPENDED";

          return (
            <Card key={id} className={isSuspended ? "opacity-75" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-start justify-between">
                  <span>
                    {vehicle.make} {vehicle.model}
                  </span>
                  <Badge variant={isSuspended ? "destructive" : "secondary"}>
                    {vehicle.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Year:</span>{" "}
                    <span className="font-medium text-foreground">
                      {vehicle.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plate:</span>{" "}
                    <span className="font-medium text-foreground">
                      {vehicle.plate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>{" "}
                    <span className="font-medium text-foreground">
                      ${vehicle.price}/day
                    </span>
                  </div>
                </div>
                <Button
                  variant={isSuspended ? "outline" : "destructive"}
                  className="w-full gap-2"
                  onClick={() =>
                    setConfirmVehicle({ id, currentStatus: vehicle.status })
                  }
                  disabled={actionId === id}
                >
                  {actionId === id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSuspended ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Ban className="h-4 w-4" />
                  )}
                  {isSuspended ? "Reactivate Vehicle" : "Suspend Vehicle"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={!!confirmVehicle}
        onOpenChange={(open) => {
          if (!open) setConfirmVehicle(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingNextStatus === "SUSPENDED"
                ? "Suspend vehicle"
                : "Reactivate vehicle"}
            </DialogTitle>
            <DialogDescription>
              {pendingVehicle ? (
                <>
                  You are about to change{" "}
                  <span className="font-medium text-foreground">
                    {pendingVehicle.make} {pendingVehicle.model}
                  </span>{" "}
                  to <span className="font-medium">{pendingNextStatus}</span>.
                </>
              ) : (
                <>
                  You are about to change this vehicle to{" "}
                  <span className="font-medium">{pendingNextStatus}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmVehicle(null)}
              disabled={!!actionId}
            >
              Cancel
            </Button>
            <Button
              variant={pendingNextStatus === "SUSPENDED" ? "destructive" : "default"}
              onClick={async () => {
                if (!confirmVehicle) return;
                await handleToggleStatus(
                  confirmVehicle.id,
                  confirmVehicle.currentStatus,
                );
                setConfirmVehicle(null);
              }}
              disabled={!!actionId}
            >
              {pendingNextStatus === "SUSPENDED" ? "Suspend" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
