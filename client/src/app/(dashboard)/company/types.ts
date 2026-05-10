export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  plate: string;
  location: string;
  status:
    | "available"
    | "booked"
    | "maintenance"
    | "pending_approval"
    | "retired";
  pricePerDay: number;
  image: string;
  galleryImages?: string[];
  lastMaintenance: string;
  nextMaintenance: string;
  mileage?: number;
  fuel?: string;
  transmission?: string;
  seats?: number;
  features?: string[];
  description?: string;
  ratingAvg?: number;
  ratingCount?: number;
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
    location: "Airport Branch",
    status: "available",
    pricePerDay: 82,
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    ],
    lastMaintenance: "Mar 02, 2026",
    nextMaintenance: "Jun 05, 2026",
    mileage: 18200,
    fuel: "hybrid",
    transmission: "automatic",
    seats: 5,
    features: [
      "Apple CarPlay",
      "Backup Camera",
      "Blind Spot Monitor",
      "Bluetooth",
      "Cruise Control",
      "USB Charging",
    ],
    description:
      "A versatile SUV kept in excellent condition for city pickups and longer regional trips. Popular with families and business travelers thanks to its smooth ride and generous cargo space.",
    ratingAvg: 4.8,
    ratingCount: 36,
  },
  {
    id: "veh_cmp_002",
    make: "Hyundai",
    model: "Elantra",
    year: 2023,
    plate: "AS-1109-23",
    location: "East Legon Office",
    status: "booked",
    pricePerDay: 58,
    image:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    ],
    lastMaintenance: "Feb 16, 2026",
    nextMaintenance: "May 20, 2026",
    mileage: 26400,
    fuel: "gasoline",
    transmission: "automatic",
    seats: 5,
    features: [
      "Android Auto",
      "Lane Assist",
      "Bluetooth",
      "Rear Parking Sensors",
      "Keyless Entry",
      "Climate Control",
    ],
    description:
      "An efficient daily-driver with a clean interior and easy handling. This sedan is one of the most frequently booked cars in the company fleet for urban stays and airport transfers.",
    ratingAvg: 4.6,
    ratingCount: 28,
  },
  {
    id: "veh_cmp_003",
    make: "Nissan",
    model: "X-Trail",
    year: 2022,
    plate: "BA-9081-22",
    location: "Bole Service Hub",
    status: "maintenance",
    pricePerDay: 76,
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
    ],
    lastMaintenance: "Mar 10, 2026",
    nextMaintenance: "Apr 15, 2026",
    mileage: 31900,
    fuel: "gasoline",
    transmission: "automatic",
    seats: 7,
    features: [
      "360 Camera",
      "Panoramic Sunroof",
      "Bluetooth",
      "All-Wheel Drive",
      "Dual Zone AC",
      "Roof Rails",
    ],
    description:
      "A larger SUV used for premium bookings and group travel. It is currently in service for scheduled maintenance before returning to active company inventory.",
    ratingAvg: 4.7,
    ratingCount: 19,
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
