"use client";

import { useEffect, useState } from "react";
import { fetchCompanyVehicles, updateVehicleStatus } from "@/lib/admin-companies-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Car, Ban, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CompanyFleetTab({ companyId }: { companyId: string }) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
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

  const handleToggleStatus = async (vehicleId: string, currentStatus: string) => {
    const newStatus = currentStatus === "SUSPENDED" ? "AVAILABLE" : "SUSPENDED";
    if (!window.confirm(`Are you sure you want to change this vehicle to ${newStatus}?`)) return;

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
  if (error) return <div className="p-6 text-sm text-red-600">Failed to load fleet: {error}</div>;
  if (vehicles.length === 0) return <div className="p-6 text-sm text-muted-foreground">This company has no vehicles.</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => {
        const id = vehicle._id || vehicle.id;
        const isSuspended = vehicle.status === "SUSPENDED";
        
        return (
          <Card key={id} className={isSuspended ? "opacity-75" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-start justify-between">
                <span>{vehicle.make} {vehicle.model}</span>
                <Badge variant={isSuspended ? "destructive" : "secondary"}>{vehicle.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-1 text-muted-foreground">
                <div className="flex justify-between"><span>Year:</span> <span className="font-medium text-foreground">{vehicle.year}</span></div>
                <div className="flex justify-between"><span>Plate:</span> <span className="font-medium text-foreground">{vehicle.plate}</span></div>
                <div className="flex justify-between"><span>Price:</span> <span className="font-medium text-foreground">${vehicle.price}/day</span></div>
              </div>
              <Button 
                variant={isSuspended ? "outline" : "destructive"} 
                className="w-full gap-2"
                onClick={() => handleToggleStatus(id, vehicle.status)}
                disabled={actionId === id}
              >
                {actionId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuspended ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {isSuspended ? "Reactivate Vehicle" : "Suspend Vehicle"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
