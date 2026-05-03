import type { Booking } from "./types";

// Mock data to make the Booking History page functional without backend.
// Replace this with your API fetch (e.g. GET /host/bookings?scope=history).
export const sampleBookings: Booking[] = [
  {
    id: "bk_001",
    vehicleName: "2023 Tesla Model 3",
    guestName: "Nana R.",
    status: "confirmed",
    startDate: "2026-02-24T10:00:00.000Z",
    endDate: "2026-02-26T10:00:00.000Z",
    totalAmount: 170,
    pickupLocation: "Accra, GH",
  },
  {
    id: "bk_002",
    vehicleName: "2021 Toyota Corolla",
    guestName: "Joan D.",
    status: "completed",
    startDate: "2026-02-10T09:00:00.000Z",
    endDate: "2026-02-12T09:00:00.000Z",
    totalAmount: 70,
    pickupLocation: "Kumasi, GH",
  },
  {
    id: "bk_003",
    vehicleName: "2022 BMW X5",
    guestName: "Michael K.",
    status: "cancelled",
    startDate: "2026-02-05T12:00:00.000Z",
    endDate: "2026-02-06T12:00:00.000Z",
    totalAmount: 0,
    pickupLocation: "Accra, GH",
  },
];

