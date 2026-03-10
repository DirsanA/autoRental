// ─── Types ────────────────────────────────────────────────────────────────────

export type CompanyStatus = "active" | "suspended" | "pending" | "expired";
export type CompanyPlan = "free" | "starter" | "growth" | "enterprise";

export type Company = {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  plan: CompanyPlan;
  status: CompanyStatus;
  seatsUsed: number;
  seatsTotal: number;
  createdAt: string; // ISO date string
  country: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

export const mockCompanies: Company[] = [
  {
    id: "co_01",
    name: "Apex Rentals Ltd.",
    slug: "apex-rentals",
    ownerName: "Amina Noor",
    ownerEmail: "amina@apexrentals.com",
    plan: "enterprise",
    status: "active",
    seatsUsed: 42,
    seatsTotal: 60,
    createdAt: "2025-06-14",
    country: "Kenya",
  },
  {
    id: "co_02",
    name: "Drive360 Solutions",
    slug: "drive360",
    ownerName: "Marcus Lee",
    ownerEmail: "marcus@drive360.io",
    plan: "growth",
    status: "active",
    seatsUsed: 18,
    seatsTotal: 25,
    createdAt: "2025-09-02",
    country: "South Africa",
  },
  {
    id: "co_03",
    name: "Nomad Fleet Co.",
    slug: "nomad-fleet",
    ownerName: "Sofia Alvarez",
    ownerEmail: "sofia@nomadfleet.com",
    plan: "starter",
    status: "suspended",
    seatsUsed: 5,
    seatsTotal: 10,
    createdAt: "2025-11-19",
    country: "Nigeria",
  },
  {
    id: "co_04",
    name: "SwiftWheels Inc.",
    slug: "swiftwheels",
    ownerName: "Eliot Chen",
    ownerEmail: "eliot@swiftwheels.com",
    plan: "growth",
    status: "pending",
    seatsUsed: 0,
    seatsTotal: 25,
    createdAt: "2026-01-08",
    country: "Ghana",
  },
  {
    id: "co_05",
    name: "Prism AutoGroup",
    slug: "prism-auto",
    ownerName: "Priya Singh",
    ownerEmail: "priya@prismgroup.com",
    plan: "enterprise",
    status: "active",
    seatsUsed: 91,
    seatsTotal: 100,
    createdAt: "2025-04-21",
    country: "Egypt",
  },
  {
    id: "co_06",
    name: "LucidCar Rentals",
    slug: "lucidcar",
    ownerName: "James Okoro",
    ownerEmail: "james@lucidcar.com",
    plan: "free",
    status: "expired",
    seatsUsed: 1,
    seatsTotal: 3,
    createdAt: "2025-08-30",
    country: "Tanzania",
  },
  {
    id: "co_07",
    name: "Horizon Vehicle Services",
    slug: "horizon-vs",
    ownerName: "Lena Müller",
    ownerEmail: "lena@horizonvs.com",
    plan: "starter",
    status: "active",
    seatsUsed: 8,
    seatsTotal: 10,
    createdAt: "2026-01-22",
    country: "Morocco",
  },
];
