export type VehicleStatus =
  | "available"
  | "rented"
  | "maintenance"
  | "pending_approval"
  | "retired";

export type VehicleFilterStatus = "available" | "rented" | "maintenance";

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  status: VehicleStatus;
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
