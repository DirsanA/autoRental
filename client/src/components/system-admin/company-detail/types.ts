// ─── Company Detail Status Types ─────────────────────────────────────────────

export type CompanyDetailStatus = "active" | "suspended" | "pending";
export type VerificationStatus = "verified" | "unverified" | "pending";
export type VehicleStatus = "available" | "rented" | "maintenance";
export type ReviewSortOption = "newest" | "oldest" | "highest" | "lowest";

// ─── Owner & Contact ─────────────────────────────────────────────────────────

export interface OwnerInfo {
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

// ─── Company Detail ──────────────────────────────────────────────────────────

export interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  status: CompanyDetailStatus;
  owner: OwnerInfo;
  contactEmail: string;
  contactPhone: string;
  address: CompanyAddress;
  registrationDate: string;
  verificationStatus: VerificationStatus;
  totalVehicles: number;
  totalBookings: number;
  averageRating: number;
  totalReviews: number;
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  plateNumber: string;
  status: VehicleStatus;
  rentalRate: number;
  imageUrl?: string;
  mileage: number;
  fuelType: string;
  transmission: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  vehicleName: string;
  flagged: boolean;
}

// ─── Financial Summary ───────────────────────────────────────────────────────

export interface FinancialSummary {
  totalBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  avgBookingValue: number;
  revenueByMonth: MonthlyRevenue[];
  recentTransactions: Transaction[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export interface Transaction {
  id: string;
  date: string;
  customerName: string;
  vehicleName: string;
  amount: number;
  status: "completed" | "pending" | "refunded";
}

// ─── Toast Types ─────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

// ─── Confirmation Modal ──────────────────────────────────────────────────────

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "default";
  onConfirm: () => Promise<void>;
}
