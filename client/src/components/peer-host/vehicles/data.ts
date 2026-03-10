import type { Vehicle } from "./types";

// This is mocked data so the sidebar route works end-to-end.
// Replace with your API call (e.g. GET /host/vehicles) when backend is ready.
export const sampleVehicles: Vehicle[] = [
  {
    id: "veh_001",
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    dailyRate: 85,
    status: "available",
    location: "Accra, GH",
    imageUrl:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    ratingAvg: 4.8,
    ratingCount: 32,
  },
  {
    id: "veh_002",
    make: "Toyota",
    model: "Corolla",
    year: 2021,
    dailyRate: 35,
    status: "rented",
    location: "Kumasi, GH",
    imageUrl:
      "https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&w=1200&q=80",
    ratingAvg: 4.4,
    ratingCount: 18,
  },
];

