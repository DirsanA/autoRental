/* =========================
   UNIFIED BOOKING TYPES
   Resolves merge conflicts between chat/lifecycle and deposit/refund branches
========================= */

// Core booking status that works for all user types
export type UnifiedBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

// Payment state consistent across all booking types
export type UnifiedPaymentState = "pending" | "paid" | "failed";

// Deposit status for security deposit management
export type UnifiedDepositStatus =
  | "NOT_REQUIRED"
  | "HELD_IN_ESCROW"
  | "REFUNDED_TO_RENTER"
  | "RELEASED_TO_OWNER"
  | "UNDER_REVIEW";

// Return condition for trip completion
export type UnifiedReturnCondition = "CLEAN" | "ISSUE_REPORTED" | null;

// Base booking interface with all fields needed for both branches
export interface BaseUnifiedBooking {
  id: string;
  bookingId: string;
  status: UnifiedBookingStatus;
  paymentState: UnifiedPaymentState;
  startTime: string | null;
  endTime: string | null;
  actualReturnTime: string | null;
  withDriver: boolean;
  contactPhone: string | null;
  pickupAddress: string | null;
  returnAddress: string | null;
  cancelReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;

  // Pricing and payment
  pricing: {
    pricePerHour: number;
    rentalSubtotal: number;
    totalHours: number;
    systemCommission: number;
    totalAmount: number;
    currency: string;
  };

  // Security deposit fields (from deposit/refund branch)
  securityDepositAmount: number;
  depositStatus: UnifiedDepositStatus;

  // Document verification (from without driver branch)
  pickupVerifiedAt: string | null;
  pickupVerifiedBy: string | null;
  originalDocsChecked: boolean;
  manualDocumentHoldNote: string | null;
  returnConfirmedAt: string | null;
  returnConfirmedBy: string | null;
  returnCondition: UnifiedReturnCondition;

  // Payment details
  payment: {
    method: "CHAPA" | "CASH" | "BANK_TRANSFER" | "TELEBIRR" | null;
    status: "PENDING" | "PAID" | "FAILED" | null;
    txRef: string | null;
    checkoutUrl: string | null;
    checkoutExpiresAt: string | null;
    referenceId: string | null;
    paidAt: string | null;
    lastVerifiedAt: string | null;
  };
}

// Renter booking with renter-specific fields
export interface RenterUnifiedBooking extends BaseUnifiedBooking {
  renterId?: string;
  vehicle: {
    id: string;
    make: string | null;
    model: string | null;
    year: number | null;
    plate: string | null;
    imageUrl: string | null;
    availability: string | null;
    delivery: string | null;
  } | null;
}

// PeerHost booking with guest information
export interface PeerHostUnifiedBooking extends RenterUnifiedBooking {
  renter: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

// Company booking with customer information
export interface CompanyUnifiedBooking extends PeerHostUnifiedBooking {
  // Company-specific fields can be added here if needed in the future
}

// Chat functionality fields (from chat/lifecycle branch)
export interface ChatEnabledBooking extends BaseUnifiedBooking {
  // Chat is available for confirmed, active, and completed bookings
  chatAvailable: boolean;
}

/* =========================
   STATUS MAPPING FUNCTIONS
   Handle conversion between different status formats
========================= */

// Map backend status to unified status
export function mapToUnifiedStatus(status: string): UnifiedBookingStatus {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "PENDING";
    case "CONFIRMED":
      return "CONFIRMED";
    case "ACTIVE":
      return "ACTIVE";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    case "DISPUTED":
      return "DISPUTED";
    default:
      return "PENDING";
  }
}

// Map unified status to UI-friendly display status (lowercase)
export function mapToDisplayStatus(status: UnifiedBookingStatus): string {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "DISPUTED":
      return "disputed";
    default:
      return "pending";
  }
}

// Map unified status to company booking status (approved/rejected format)
export function mapToCompanyStatus(
  status: UnifiedBookingStatus,
): "pending" | "approved" | "rejected" | "completed" {
  switch (status) {
    case "CONFIRMED":
    case "ACTIVE":
      return "approved";
    case "PENDING":
      return "pending";
    case "CANCELLED":
    case "DISPUTED":
      return "rejected";
    case "COMPLETED":
      return "completed";
    default:
      return "pending";
  }
}

// Check if chat is available for a booking
export function isChatAvailable(
  status: UnifiedBookingStatus,
  paymentState: UnifiedPaymentState,
): boolean {
  return (
    (status === "CONFIRMED" || status === "ACTIVE" || status === "COMPLETED") &&
    paymentState === "paid"
  );
}

// Check if booking can be activated
export function canActivateBooking(
  status: UnifiedBookingStatus,
  paymentState: UnifiedPaymentState,
): boolean {
  return status === "CONFIRMED" && paymentState === "paid";
}

// Check if booking return can be confirmed
export function canConfirmReturn(status: UnifiedBookingStatus): boolean {
  return status === "ACTIVE";
}

/* =========================
   DEPOSIT STATUS HELPERS
========================= */

export function getDepositStatusDisplay(status: UnifiedDepositStatus): string {
  return status.replaceAll("_", " ");
}

export function isDepositHeld(status: UnifiedDepositStatus): boolean {
  return status === "HELD_IN_ESCROW";
}

export function isDepositRefunded(status: UnifiedDepositStatus): boolean {
  return status === "REFUNDED_TO_RENTER";
}

export function isDepositUnderReview(status: UnifiedDepositStatus): boolean {
  return status === "UNDER_REVIEW";
}

/* =========================
   TYPE GUARDS
========================= */

export function isRenterBooking(
  booking: BaseUnifiedBooking,
): booking is RenterUnifiedBooking {
  return booking && typeof booking === "object" && "vehicle" in booking;
}

export function isPeerHostBooking(
  booking: BaseUnifiedBooking,
): booking is PeerHostUnifiedBooking {
  return (
    isRenterBooking(booking) &&
    "renter" in booking &&
    booking.renter !== null &&
    typeof booking.renter === "object" &&
    "name" in booking.renter
  );
}

export function isCompanyBooking(
  booking: BaseUnifiedBooking,
): booking is CompanyUnifiedBooking {
  return isPeerHostBooking(booking); // Company bookings have the same structure as peerhost bookings
}
