export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  status: "available" | "booked" | "maintenance";
  pricePerDay: number;
  image: string;
  lastMaintenance: string;
  nextMaintenance: string;
};

export type BookingReview = {
  rating: number;
  comment: string;
  submittedAt: string;
};

export type Booking = {
  id: string;
  customerName: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  totalAmount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  pickupLocation: string;
  review?: BookingReview;
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "veh_cmp_001",
    make: "Toyota",
    model: "RAV4",
    year: 2024,
    plate: "GT-2241-24",
    status: "available",
    pricePerDay: 82,
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    lastMaintenance: "Mar 02, 2026",
    nextMaintenance: "Jun 05, 2026",
  },
  {
    id: "veh_cmp_002",
    make: "Hyundai",
    model: "Elantra",
    year: 2023,
    plate: "AS-1109-23",
    status: "booked",
    pricePerDay: 58,
    image:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    lastMaintenance: "Feb 16, 2026",
    nextMaintenance: "May 20, 2026",
  },
  {
    id: "veh_cmp_003",
    make: "Nissan",
    model: "X-Trail",
    year: 2022,
    plate: "BA-9081-22",
    status: "maintenance",
    pricePerDay: 76,
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    lastMaintenance: "Mar 10, 2026",
    nextMaintenance: "Apr 15, 2026",
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "cmp_bk_001",
    customerName: "Samuel T.",
    vehicleName: "Toyota RAV4",
    startDate: "Mar 18, 2026",
    endDate: "Mar 21, 2026",
    createdAt: "Mar 15, 2026",
    totalAmount: 246,
    status: "pending",
    pickupLocation: "Airport Branch",
  },
  {
    id: "cmp_bk_002",
    customerName: "Martha A.",
    vehicleName: "Hyundai Elantra",
    startDate: "Mar 08, 2026",
    endDate: "Mar 10, 2026",
    createdAt: "Mar 04, 2026",
    totalAmount: 116,
    status: "completed",
    pickupLocation: "East Legon Office",
    review: {
      rating: 4,
      comment:
        "Pickup was smooth and the car was neat. The trip went really well and support was responsive.",
      submittedAt: "2026-03-11T09:30:00.000Z",
    },
  },
];
