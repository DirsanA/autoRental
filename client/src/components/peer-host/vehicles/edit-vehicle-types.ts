// src/components/peer-host/vehicles/edit-vehicle-types.ts

export interface VehicleSpecifications {
  mileage: string;
  fuelType: string;
  transmission: string;
  seats: number;
  mpg: string;
  ac: string;
  connectivity: string;
}

export interface EditableVehicleDetails {
  make: string;
  model: string;
  year: number;
  location: string;
  dailyRate: number;
  description: string;
  features: string[];
  specifications: VehicleSpecifications;
}