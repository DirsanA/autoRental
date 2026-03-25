export type VehicleStatus = "available" | "rented" | "maintenance";

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
  ratingAvg: number;
  ratingCount: number;
};
