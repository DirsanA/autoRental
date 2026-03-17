import type {
  HostInfo,
  VerificationData,
  HostListing,
  EarningTransaction,
} from "./types";

export const mockHostData: Record<string, HostInfo> = {
  p2p_01: {
    id: "p2p_01",
    name: "James Okoro",
    email: "james@example.com",
    phone: "+254 712 987 654",
    address: "Westlands, Nairobi, KE",
    joinDate: "2025-10-15",
    status: "pending",
    rating: 4.8,
    reviewCount: 32,
    totalTrips: 41,
    totalEarnings: 2600.5,
  },
  p2p_03: {
    id: "p2p_03",
    name: "Daniel Osei",
    email: "dosei@example.com",
    phone: "+233 54 123 4567",
    address: "Osu, Accra, GH",
    joinDate: "2024-02-12",
    status: "active",
    rating: 4.9,
    reviewCount: 120,
    totalTrips: 154,
    totalEarnings: 15430.0,
  },
};

export const mockVerificationData: Record<string, VerificationData> = {
  p2p_01: {
    identityStatus: "verified",
    drivingLicenseStatus: "pending",
    insuranceStatus: "verified",
    backgroundCheckStatus: "verified",
    documents: [
      {
        id: "doc_1",
        title: "National ID Front",
        type: "id",
        uploadedAt: "2026-02-17",
        status: "verified",
        fileSize: "1.2 MB",
      },
      {
        id: "doc_2",
        title: "National ID Back",
        type: "id",
        uploadedAt: "2026-02-17",
        status: "verified",
        fileSize: "1.5 MB",
      },
      {
        id: "doc_3",
        title: "Driver License",
        type: "license",
        uploadedAt: "2026-02-18",
        status: "pending",
        fileSize: "2.1 MB",
      },
      {
        id: "doc_4",
        title: "Vehicle Insurance",
        type: "insurance",
        uploadedAt: "2026-02-18",
        status: "verified",
        fileSize: "3.4 MB",
      },
    ],
  },
  p2p_03: {
    identityStatus: "verified",
    drivingLicenseStatus: "verified",
    insuranceStatus: "verified",
    backgroundCheckStatus: "verified",
    documents: [
      {
        id: "doc_5",
        title: "Passport",
        type: "id",
        uploadedAt: "2024-02-12",
        status: "verified",
        fileSize: "2.5 MB",
      },
      {
        id: "doc_6",
        title: "Driver License",
        type: "license",
        uploadedAt: "2024-02-12",
        status: "verified",
        fileSize: "1.9 MB",
      },
      {
        id: "doc_7",
        title: "Comprehensive Cover",
        type: "insurance",
        uploadedAt: "2025-01-10",
        status: "verified",
        fileSize: "4.1 MB",
      },
    ],
  },
};

export const mockHostListings: Record<string, HostListing[]> = {
  p2p_01: [
    {
      id: "list_1",
      title: "2021 Toyota RAV4",
      category: "SUV",
      plate: "KDG 123A",
      dailyRate: 65,
      status: "unlisted",
      totalTrips: 0,
      rating: 0,
    },
  ],
  p2p_03: [
    {
      id: "list_2",
      title: "2020 Ford Ranger",
      category: "Pickup",
      plate: "GW 4567-20",
      dailyRate: 78,
      status: "active",
      totalTrips: 102,
      rating: 4.8,
    },
    {
      id: "list_3",
      title: "2019 Toyota Corolla",
      category: "Sedan",
      plate: "GR 8901-19",
      dailyRate: 45,
      status: "active",
      totalTrips: 52,
      rating: 4.9,
    },
  ],
};

export const mockHostEarnings: Record<string, EarningTransaction[]> = {
  p2p_01: [],
  p2p_03: [
    {
      id: "earn_1",
      date: "2026-02-28",
      amount: 156.0,
      listingName: "2020 Ford Ranger",
      payoutStatus: "processing",
    },
    {
      id: "earn_2",
      date: "2026-02-25",
      amount: 234.0,
      listingName: "2020 Ford Ranger",
      payoutStatus: "paid",
    },
    {
      id: "earn_3",
      date: "2026-02-20",
      amount: 90.0,
      listingName: "2019 Toyota Corolla",
      payoutStatus: "paid",
    },
    {
      id: "earn_4",
      date: "2026-02-15",
      amount: 312.0,
      listingName: "2020 Ford Ranger",
      payoutStatus: "paid",
    },
    {
      id: "earn_5",
      date: "2026-02-10",
      amount: 180.0,
      listingName: "2019 Toyota Corolla",
      payoutStatus: "paid",
    },
  ],
};

export function getHostData(hostId: string) {
  // Fallback to p2p_01 if not found to avoid crashing
  const id = mockHostData[hostId] ? hostId : "p2p_01";
  return {
    host: mockHostData[id],
    verification: mockVerificationData[id],
    listings: mockHostListings[id] || [],
    earnings: mockHostEarnings[id] || [],
  };
}
