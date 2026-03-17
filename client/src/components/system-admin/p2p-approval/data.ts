export type P2PStatus = "pending" | "approved" | "rejected" | "flagged";

export type P2PListing = {
  id: string;
  ownerName: string;
  ownerEmail: string;
  vehicleTitle: string;
  vehicleType: string;
  location: string;
  dailyRate: number; // USD cents
  status: P2PStatus;
  submittedAt: string;
  documentsVerified: boolean;
  insuranceValid: boolean;
};

export const mockP2PListings: P2PListing[] = [
  {
    id: "p2p_01",
    ownerName: "James Okoro",
    ownerEmail: "james@example.com",
    vehicleTitle: "2021 Toyota RAV4",
    vehicleType: "SUV",
    location: "Nairobi, KE",
    dailyRate: 6500,
    status: "pending",
    submittedAt: "2026-02-18",
    documentsVerified: true,
    insuranceValid: true,
  },
  {
    id: "p2p_02",
    ownerName: "Aisha Kamau",
    ownerEmail: "aisha@example.com",
    vehicleTitle: "2019 Honda Civic",
    vehicleType: "Sedan",
    location: "Mombasa, KE",
    dailyRate: 4200,
    status: "pending",
    submittedAt: "2026-02-19",
    documentsVerified: false,
    insuranceValid: true,
  },
  {
    id: "p2p_03",
    ownerName: "Daniel Osei",
    ownerEmail: "dosei@example.com",
    vehicleTitle: "2020 Ford Ranger",
    vehicleType: "Pickup",
    location: "Accra, GH",
    dailyRate: 7800,
    status: "approved",
    submittedAt: "2026-02-10",
    documentsVerified: true,
    insuranceValid: true,
  },
  {
    id: "p2p_04",
    ownerName: "Fatima Youssef",
    ownerEmail: "fatima@example.com",
    vehicleTitle: "2018 Nissan X-Trail",
    vehicleType: "SUV",
    location: "Cairo, EG",
    dailyRate: 5500,
    status: "flagged",
    submittedAt: "2026-02-14",
    documentsVerified: true,
    insuranceValid: false,
  },
  {
    id: "p2p_05",
    ownerName: "Kwame Asante",
    ownerEmail: "kwame@example.com",
    vehicleTitle: "2022 Hyundai Tucson",
    vehicleType: "SUV",
    location: "Kumasi, GH",
    dailyRate: 7200,
    status: "rejected",
    submittedAt: "2026-02-08",
    documentsVerified: false,
    insuranceValid: false,
  },
  {
    id: "p2p_06",
    ownerName: "Lena Müller",
    ownerEmail: "lena@example.com",
    vehicleTitle: "2020 BMW 3 Series",
    vehicleType: "Sedan",
    location: "Casablanca, MA",
    dailyRate: 9900,
    status: "pending",
    submittedAt: "2026-02-21",
    documentsVerified: true,
    insuranceValid: true,
  },
  {
    id: "p2p_07",
    ownerName: "Sofia Alvarez",
    ownerEmail: "sofia@example.com",
    vehicleTitle: "2021 VW Polo",
    vehicleType: "Hatchback",
    location: "Lagos, NG",
    dailyRate: 3800,
    status: "approved",
    submittedAt: "2026-02-05",
    documentsVerified: true,
    insuranceValid: true,
  },
];
