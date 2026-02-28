export type VehicleStatus =
  | "active"
  | "maintenance"
  | "unlisted"
  | "suspended"
  | "pending";

export interface VehicleFullDetail {
  id: string;
  hostId: string;
  title: string;
  category: string;
  plateNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  color: string;
  mileage: number;
  transmission: "automatic" | "manual";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  seats: number;
  dailyRate: number; // in dollars
  status: VehicleStatus;
  images: string[];
  features: string[];
  description: string;
  insuranceExpiry: string;
  lastServiced: string;
}

export type TripStatus = "completed" | "active" | "cancelled" | "upcoming";

export interface VehicleTrip {
  id: string;
  renterName: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: TripStatus;
  rating?: number;
}

// ─── Shared UI Types ─────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "default";
  onConfirm: () => Promise<void>;
}
