/**
 * System-wide constants.
 * Use ENV vars for secrets/configurable values; use this file for fixed business rules.
 */

export const SYSTEM_CONSTANTS = {
  // Sets the platform cut used by payout and settlement logic across the system.
  /** Platform commission rate (0.15 = 15%) */
  COMMISSION_RATE: parseFloat(process.env.COMMISSION_RATE || "0.15"),

  // Defines the minimum balance a user must reach before requesting a payout.
  /** Minimum payout threshold in ETB */
  PAYOUT_MINIMUM_AMOUNT: parseFloat(
    process.env.PAYOUT_MINIMUM_AMOUNT || "500",
  ),

  // Controls how long an unconfirmed booking can stay pending before auto-cancellation.
  /** Hours before an unconfirmed booking is auto-cancelled */
  BOOKING_CONFIRM_DEADLINE_HOURS: parseInt(
    process.env.BOOKING_CONFIRM_DEADLINE_HOURS || "24",
    10,
  ),

  /** Default currency */
  DEFAULT_CURRENCY: "ETB",
} as const;

/**
 * Default system role names (seeded on first startup).
 */
// Provides canonical role names so auth, seeding, and business logic stay in sync.
export const SYSTEM_ROLES = {
  RENTER: "renter",
  PEERHOST: "peerhost",
  COMPANY: "company",
  ADMIN: "admin",
} as const;
