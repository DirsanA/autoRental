export type TransactionType =
  | "subscription"
  | "rental"
  | "commission"
  | "refund";
export type TransactionStatus = "paid" | "pending" | "failed" | "refunded";

export type Transaction = {
  id: string;
  companyName: string;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // in USD cents
  date: string; // ISO
  invoice: string;
};

export const mockTransactions: Transaction[] = [
  {
    id: "txn_01",
    companyName: "Apex Rentals Ltd.",
    description: "Enterprise plan – Feb 2026",
    type: "subscription",
    status: "paid",
    amount: 49900,
    date: "2026-02-01",
    invoice: "INV-2026-001",
  },
  {
    id: "txn_02",
    companyName: "Drive360 Solutions",
    description: "Growth plan – Feb 2026",
    type: "subscription",
    status: "paid",
    amount: 19900,
    date: "2026-02-01",
    invoice: "INV-2026-002",
  },
  {
    id: "txn_03",
    companyName: "SwiftWheels Inc.",
    description: "Rental commission – Booking #8812",
    type: "commission",
    status: "paid",
    amount: 3200,
    date: "2026-02-04",
    invoice: "INV-2026-003",
  },
  {
    id: "txn_04",
    companyName: "Prism AutoGroup",
    description: "Enterprise plan – Feb 2026",
    type: "subscription",
    status: "paid",
    amount: 49900,
    date: "2026-02-01",
    invoice: "INV-2026-004",
  },
  {
    id: "txn_05",
    companyName: "Nomad Fleet Co.",
    description: "Starter plan – Feb 2026",
    type: "subscription",
    status: "failed",
    amount: 7900,
    date: "2026-02-01",
    invoice: "INV-2026-005",
  },
  {
    id: "txn_06",
    companyName: "LucidCar Rentals",
    description: "Refund – duplicate charge",
    type: "refund",
    status: "refunded",
    amount: -7900,
    date: "2026-02-06",
    invoice: "INV-2026-006",
  },
  {
    id: "txn_07",
    companyName: "Horizon Vehicle Services",
    description: "Starter plan – Feb 2026",
    type: "subscription",
    status: "paid",
    amount: 7900,
    date: "2026-02-01",
    invoice: "INV-2026-007",
  },
  {
    id: "txn_08",
    companyName: "Apex Rentals Ltd.",
    description: "Rental commission – Booking #9041",
    type: "commission",
    status: "paid",
    amount: 5500,
    date: "2026-02-10",
    invoice: "INV-2026-008",
  },
  {
    id: "txn_09",
    companyName: "Drive360 Solutions",
    description: "Rental commission – Booking #8890",
    type: "commission",
    status: "pending",
    amount: 2100,
    date: "2026-02-12",
    invoice: "INV-2026-009",
  },
  {
    id: "txn_10",
    companyName: "Prism AutoGroup",
    description: "Rental commission – Booking #9102",
    type: "commission",
    status: "paid",
    amount: 7200,
    date: "2026-02-14",
    invoice: "INV-2026-010",
  },
];

// ─── Monthly chart data ───────────────────────────────────────────────────────
export const monthlyRevenue = [
  { month: "Sep", revenue: 58000, commissions: 12000 },
  { month: "Oct", revenue: 72000, commissions: 18000 },
  { month: "Nov", revenue: 65000, commissions: 14500 },
  { month: "Dec", revenue: 88000, commissions: 22000 },
  { month: "Jan", revenue: 94000, commissions: 27000 },
  { month: "Feb", revenue: 107000, commissions: 31000 },
];
