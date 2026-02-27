export type SaleStatus = "completed" | "pending" | "cancelled" | "disputed";

export type Sale = {
  id: string;
  bookingRef: string;
  renterName: string;
  renterEmail: string;
  vehicleTitle: string;
  companyName: string;
  startDate: string;
  endDate: string;
  days: number;
  totalAmount: number; // USD cents
  platformFee: number; // USD cents
  status: SaleStatus;
  createdAt: string;
};

export const mockSales: Sale[] = [
  {
    id: "sale_01",
    bookingRef: "BK-9041",
    renterName: "Amina Noor",
    renterEmail: "amina@example.com",
    vehicleTitle: "2021 Toyota RAV4",
    companyName: "Apex Rentals Ltd.",
    startDate: "2026-02-05",
    endDate: "2026-02-08",
    days: 3,
    totalAmount: 19500,
    platformFee: 1950,
    status: "completed",
    createdAt: "2026-02-03",
  },
  {
    id: "sale_02",
    bookingRef: "BK-9102",
    renterName: "Marcus Lee",
    renterEmail: "mlee@example.com",
    vehicleTitle: "2020 BMW 3 Series",
    companyName: "Prism AutoGroup",
    startDate: "2026-02-10",
    endDate: "2026-02-14",
    days: 4,
    totalAmount: 39600,
    platformFee: 3960,
    status: "completed",
    createdAt: "2026-02-08",
  },
  {
    id: "sale_03",
    bookingRef: "BK-8812",
    renterName: "Sofia Alvarez",
    renterEmail: "sofia@example.com",
    vehicleTitle: "2019 Honda Civic",
    companyName: "Drive360 Solutions",
    startDate: "2026-02-12",
    endDate: "2026-02-13",
    days: 1,
    totalAmount: 4200,
    platformFee: 420,
    status: "completed",
    createdAt: "2026-02-11",
  },
  {
    id: "sale_04",
    bookingRef: "BK-9210",
    renterName: "Eliot Chen",
    renterEmail: "eliot@example.com",
    vehicleTitle: "2022 Hyundai Tucson",
    companyName: "Horizon Vehicle Services",
    startDate: "2026-02-18",
    endDate: "2026-02-20",
    days: 2,
    totalAmount: 14400,
    platformFee: 1440,
    status: "pending",
    createdAt: "2026-02-16",
  },
  {
    id: "sale_05",
    bookingRef: "BK-9315",
    renterName: "Priya Singh",
    renterEmail: "priya@example.com",
    vehicleTitle: "2021 VW Polo",
    companyName: "SwiftWheels Inc.",
    startDate: "2026-02-20",
    endDate: "2026-02-22",
    days: 2,
    totalAmount: 7600,
    platformFee: 760,
    status: "cancelled",
    createdAt: "2026-02-18",
  },
  {
    id: "sale_06",
    bookingRef: "BK-9401",
    renterName: "James Okoro",
    renterEmail: "james@example.com",
    vehicleTitle: "2021 Ford Ranger",
    companyName: "Apex Rentals Ltd.",
    startDate: "2026-02-22",
    endDate: "2026-02-25",
    days: 3,
    totalAmount: 23400,
    platformFee: 2340,
    status: "disputed",
    createdAt: "2026-02-20",
  },
  {
    id: "sale_07",
    bookingRef: "BK-9490",
    renterName: "Lena Müller",
    renterEmail: "lena@example.com",
    vehicleTitle: "2020 Nissan X-Trail",
    companyName: "Drive360 Solutions",
    startDate: "2026-02-25",
    endDate: "2026-02-27",
    days: 2,
    totalAmount: 11000,
    platformFee: 1100,
    status: "pending",
    createdAt: "2026-02-23",
  },
];
