export type HostStatus = "active" | "pending" | "suspended" | "rejected";
export type KYCStatus = "verified" | "pending" | "rejected" | "unsubmitted";
export type ListingStatus = "active" | "maintenance" | "unlisted";

// ─── Core Host Information ───────────────────────────────────────────────────

export interface HostInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  status: HostStatus;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  totalTrips: number;
  totalEarnings: number;
}

// ─── Verification & KYC ──────────────────────────────────────────────────────

export interface VerificationData {
  identityStatus: KYCStatus;
  drivingLicenseStatus: KYCStatus;
  insuranceStatus: KYCStatus;
  backgroundCheckStatus: KYCStatus;
  documents: DocumentItem[];
}

export interface DocumentItem {
  id: string;
  title: string;
  type: "id" | "license" | "insurance" | "background";
  uploadedAt: string;
  status: KYCStatus;
  fileSize?: string;
}

// ─── Listings (Vehicles) ─────────────────────────────────────────────────────

export interface HostListing {
  id: string;
  title: string;
  category: string;
  plate: string;
  dailyRate: number; // in dollars
  status: ListingStatus;
  totalTrips: number;
  rating: number;
}

// ─── Earnings & Payouts ──────────────────────────────────────────────────────

export interface EarningTransaction {
  id: string;
  date: string;
  amount: number;
  listingName: string;
  payoutStatus: "paid" | "processing" | "failed";
}

// ─── Shared UI Types ─────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "default";
  onConfirm: () => Promise<void>;
}
