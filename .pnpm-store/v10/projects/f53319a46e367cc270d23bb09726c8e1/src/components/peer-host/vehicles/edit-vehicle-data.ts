// src/components/peer-host/vehicles/edit-vehicle-data.ts

import { EditableVehicleDetails } from "./edit-vehicle-types";
import type { Vehicle } from "./types";

export const defaultDescription = "Well-maintained vehicle in excellent condition. Perfect for road trips or daily commuting. Features include premium audio, leather seats, and advanced safety systems.";

export const defaultFeatures = [
  "Bluetooth", "Backup Camera", "Heated Seats", "Lane Assist",
  "Keyless Entry", "USB Ports", "Sunroof", "Premium Sound"
];

export const defaultSpecifications = {
  mileage: "45,000 mi",
  fuelType: "Gasoline",
  transmission: "Automatic",
  seats: 5,
  mpg: "28 city / 34 hwy",
  ac: "Dual Zone",
  connectivity: "Apple CarPlay"
};

export function createEditableDetails(vehicle: Vehicle): EditableVehicleDetails {
  const inferredFuelType = vehicle.fuel
    ? `${vehicle.fuel.charAt(0).toUpperCase()}${vehicle.fuel.slice(1)}`
    : defaultSpecifications.fuelType;
  const inferredTransmission = vehicle.transmission
    ? `${vehicle.transmission.charAt(0).toUpperCase()}${vehicle.transmission.slice(1)}`
    : defaultSpecifications.transmission;

  return {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    location: vehicle.location,
    dailyRate: vehicle.dailyRate,
    description: vehicle.description || defaultDescription,
    features:
      vehicle.features && vehicle.features.length > 0
        ? [...vehicle.features]
        : [...defaultFeatures],
    specifications: {
      mileage:
        typeof vehicle.mileage === "number"
          ? `${vehicle.mileage.toLocaleString()} km`
          : defaultSpecifications.mileage,
      fuelType: inferredFuelType,
      transmission: inferredTransmission,
      seats: vehicle.seats || defaultSpecifications.seats,
      mpg: defaultSpecifications.mpg,
      ac: defaultSpecifications.ac,
      connectivity: defaultSpecifications.connectivity,
    },
  };
}
