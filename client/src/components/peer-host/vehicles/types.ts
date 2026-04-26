export type VehicleStatus =
  | "available"
  | "rented"
  | "maintenance"
  | "pending_approval"
  | "retired";

export type VehicleAvailabilityBlock = {
  id: string;
  startDate: string;
  endDate: string;
  reason:
    | "BOOKING"
    | "MAINTENANCE"
    | "OWNER_USE"
    | "OFF_SEASON"
    | "ADMIN_HOLD"
    | "PENDING_DELIVERY";
  source: "SYSTEM" | "OWNER" | "ADMIN";
  bookingId?: string | null;
  maintenanceId?: string | null;
  notes?: string | null;
};

export type VehicleFilterStatus = "available" | "rented" | "maintenance";

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  status: VehicleStatus;
  // UI convenience flag used by host-side screens; not a persisted backend field.
  acceptingBookings?: boolean;
  location: string;
  imageUrl?: string;
  galleryImages?: string[];
  vin?: string;
  mileage?: number;
  fuel?: string;
  transmission?: string;
  seats?: number;
  features?: string[];
  description?: string;
  ratingAvg: number;
  ratingCount: number;
};
