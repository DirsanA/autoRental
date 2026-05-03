import type { Review } from "./types";

// Mocked reviews so the "Reviews" route renders immediately.
// Replace with an API call (e.g. GET /host/reviews) when available.
export const sampleReviews: Review[] = [
  {
    id: "rev_001",
    vehicleName: "2023 Tesla Model 3",
    guestName: "Nana R.",
    rating: 5,
    comment:
      "Smooth pickup, super clean car. Host was responsive. Will book again.",
    createdAt: "2026-02-20T10:12:00.000Z",
  },
  {
    id: "rev_002",
    vehicleName: "2021 Toyota Corolla",
    guestName: "Joan D.",
    rating: 4,
    comment:
      "Great value. AC worked well. Only small delay during return inspection.",
    createdAt: "2026-02-14T16:45:00.000Z",
  },
  {
    id: "rev_003",
    vehicleName: "2022 BMW X5",
    guestName: "Michael K.",
    rating: 5,
    comment: "Luxury experience. Exactly as listed. Easy handover.",
    createdAt: "2026-02-02T09:05:00.000Z",
  },
];

