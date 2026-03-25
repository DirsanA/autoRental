"use client";

import { useMemo, useState } from "react";
import {
  Clock3,
  FileText,
  Filter,
  Plus,
  Search,
  Settings2,
  Trash2,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { MOCK_VEHICLES, type Vehicle } from "../types";

type FleetFilter = "all" | Vehicle["status"];

function formatStatus(status: Vehicle["status"]) {
  switch (status) {
    case "available":
      return "Available";
    case "booked":
      return "Booked";
    case "maintenance":
      return "Maintenance";
  }
}

function statusBadgeClass(status: Vehicle["status"]) {
  switch (status) {
    case "available":
      return "bg-emerald-600 text-white";
    case "booked":
      return "bg-blue-600 text-white";
    case "maintenance":
      return "bg-amber-600 text-white";
  }
}

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FleetFilter>("all");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ? true : vehicle.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, searchTerm, vehicles]);

  const availableCount = vehicles.filter((vehicle) => vehicle.status === "available").length;
  const bookedCount = vehicles.filter((vehicle) => vehicle.status === "booked").length;
  const maintenanceCount = vehicles.filter((vehicle) => vehicle.status === "maintenance").length;

  const toggleAvailability = (id: string, checked: boolean) => {
    setVehicles((prev) =>
      prev.map((vehicle) => {
        if (vehicle.id !== id) {
          return vehicle;
        }

        if (checked) {
          return { ...vehicle, status: "available" };
        }

        return {
          ...vehicle,
          status: vehicle.status === "maintenance" ? "maintenance" : "booked",
        };
      })
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-3xl tracking-tight">
            Fleet Management
          </h2>
          <p className="mt-1 text-slate-500 text-sm">
            Manage listings, pricing, service windows, and company availability.
          </p>
        </div>

        <Button className="bg-black hover:bg-slate-900 shadow-lg text-white w-full sm:w-auto">
          <Plus className="mr-2 w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      <div className="gap-4 grid lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-slate-400 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by make, model, or plate..."
            className="bg-white pl-9 border-slate-200 focus-visible:ring-slate-400 h-11"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "available", "booked", "maintenance"] as FleetFilter[]).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                  activeFilter === filter
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {filter === "all" ? "All" : formatStatus(filter)}
              </button>
            )
          )}

          <Button
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Filter className="mr-2 w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 sm:grid-cols-3">
        <Card
          className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 shadow-lg hover:shadow-emerald-500/20 border-0 overflow-hidden transition-all duration-300"
          onClick={() => setActiveFilter("available")}
        >
          <div className="top-0 right-0 absolute bg-emerald-500/10 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
          <CardContent className="z-10 relative p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-emerald-600 text-sm">
                  Available Fleet
                </p>
                <p className="mt-2 font-bold text-emerald-700 text-3xl">
                  {availableCount}
                </p>
              </div>
              <div className="opacity-30 text-4xl">🚗</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group relative bg-gradient-to-br from-blue-500/10 to-blue-400/5 shadow-lg hover:shadow-blue-500/20 border-0 overflow-hidden transition-all duration-300"
          onClick={() => setActiveFilter("booked")}
        >
          <div className="top-0 right-0 absolute bg-blue-500/10 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
          <CardContent className="z-10 relative p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-blue-600 text-sm">Booked Fleet</p>
                <p className="mt-2 font-bold text-blue-700 text-3xl">
                  {bookedCount}
                </p>
              </div>
              <div className="opacity-30 text-4xl">📅</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group relative bg-gradient-to-br from-amber-500/10 to-amber-400/5 shadow-lg hover:shadow-amber-500/20 border-0 overflow-hidden transition-all duration-300"
          onClick={() => setActiveFilter("maintenance")}
        >
          <div className="top-0 right-0 absolute bg-amber-500/10 blur-2xl rounded-full w-24 h-24 group-hover:scale-125 transition-transform" />
          <CardContent className="z-10 relative p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-amber-600 text-sm">
                  In Maintenance
                </p>
                <p className="mt-2 font-bold text-amber-700 text-3xl">
                  {maintenanceCount}
                </p>
              </div>
              <div className="opacity-30 text-4xl">🛠️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="gap-6 grid md:grid-cols-2 xl:grid-cols-2">
        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-500 text-lg">No vehicles found for this filter.</p>
            <Button className="bg-slate-900 hover:bg-slate-800 mt-6 text-white">
              Add your first fleet vehicle
            </Button>
          </div>
        )}

        {filteredVehicles.map((vehicle) => {
          const isAvailable = vehicle.status === "available";

          return (
            <Card
              key={vehicle.id}
              className="group bg-white hover:shadow-2xl border-slate-200/80 overflow-hidden transition-all duration-300"
            >
              <div className="relative bg-slate-100 w-full h-56 overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="top-3 right-3 absolute">
                  <Badge className={cn("border-0", statusBadgeClass(vehicle.status))}>
                    {formatStatus(vehicle.status)}
                  </Badge>
                </div>

                <div className="bottom-3 left-3 absolute bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                  ${vehicle.pricePerDay}/day
                </div>
              </div>

              <CardContent className="space-y-5 p-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="mt-1 text-slate-500 text-sm">{vehicle.plate}</p>
                  </div>

                  <Badge
                    variant="outline"
                    className="border-slate-200 text-slate-600 text-xs"
                  >
                    Company Fleet
                  </Badge>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Manual Availability
                    </p>
                    <p className="mt-1 text-slate-500 text-xs">
                      Turn bookings on or off for this vehicle.
                    </p>
                  </div>

                  <Switch
                    checked={isAvailable}
                    onCheckedChange={(checked) =>
                      toggleAvailability(vehicle.id, checked)
                    }
                    aria-label="Toggle fleet vehicle availability"
                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300"
                  />
                </div>

                <div className="gap-4 grid sm:grid-cols-2">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Clock3 className="w-4 h-4" />
                      Last Service
                    </div>
                    <p className="mt-2 font-medium text-slate-900 text-sm">
                      {vehicle.lastMaintenance}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Wrench className="w-4 h-4" />
                      Next Service
                    </div>
                    <p className="mt-2 font-medium text-slate-900 text-sm">
                      {vehicle.nextMaintenance}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Settings2 className="mr-2 w-4 h-4" />
                    Manage
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="mr-2 w-4 h-4" />
                    Documents
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
