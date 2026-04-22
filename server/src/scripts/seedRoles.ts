import mongoose from "mongoose";
import { Role } from "../models/Role.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { connectDatabase } from "../config/database.js";

const selfUserCondition = { _id: "${userMongoId}" };
const selfCompanyCondition = { authUserId: "${userId}" };
const selfNotificationsCondition = { recipientId: "${userMongoId}" };
const selfVerificationsCondition = { userId: "${userMongoId}" };
const selfRenterBookingsCondition = { renterId: "${userMongoId}" };
const selfUserVehicleCondition = {
  ownerId: "${userMongoId}",
  ownerType: "User",
};
const selfCompanyVehicleCondition = {
  ownerId: "${companyId}",
  ownerType: "Company",
};
const selfUserPayoutCondition = {
  ownerId: "${userMongoId}",
  ownerType: "User",
};
const selfCompanyPayoutCondition = {
  ownerId: "${companyId}",
  ownerType: "Company",
};
const selfUserLedgerCondition = {
  $or: [
    { payerId: "${userMongoId}" },
    { receiverId: "${userMongoId}", receiverModel: "User" },
  ],
};
const selfCompanyLedgerCondition = {
  $or: [
    { payerId: "${userMongoId}" },
    { receiverId: "${companyId}", receiverModel: "Company" },
  ],
};
const selfDisputesCondition = {
  $or: [
    { raisedBy: "${userMongoId}" },
    { respondentId: "${userMongoId}" },
  ],
};
const publicMarketplacePermissions = [
  { action: "read", subject: "Vehicle" },
  { action: "read", subject: "Company" },
  { action: "read", subject: "Review" },
];
const selfAccountPermissions = [
  { action: "read", subject: "User", conditions: selfUserCondition },
  { action: "update", subject: "User", conditions: selfUserCondition },
  { action: "read", subject: "Notification", conditions: selfNotificationsCondition },
  { action: "update", subject: "Notification", conditions: selfNotificationsCondition },
];
const selfVerificationPermissions = [
  { action: "create", subject: "Verification", conditions: selfVerificationsCondition },
  { action: "read", subject: "Verification", conditions: selfVerificationsCondition },
];
const renterBookingPermissions = [
  { action: "create", subject: "Booking", conditions: selfRenterBookingsCondition },
  { action: "read", subject: "Booking", conditions: selfRenterBookingsCondition },
  { action: "update", subject: "Booking", conditions: selfRenterBookingsCondition },
  { action: "create", subject: "Transaction", conditions: { payerId: "${userMongoId}" } },
  { action: "read", subject: "Transaction", conditions: selfUserLedgerCondition },
  { action: "create", subject: "Review", conditions: { reviewerId: "${userMongoId}" } },
];
const selfDisputePermissions = [
  { action: "create", subject: "Dispute", conditions: { raisedBy: "${userMongoId}" } },
  { action: "read", subject: "Dispute", conditions: selfDisputesCondition },
  { action: "update", subject: "Dispute", conditions: selfDisputesCondition },
];

// Vehicle-dependent resources below stay subject-level for host roles because the current
// schemas do not embed owner ids on Booking, Availability, FleetDocument, or Maintenance.
// Service-layer ownership checks still need to enforce that the host only touches their fleet.
const rolesData = [
  {
    name: SYSTEM_ROLES.RENTER,
    description:
      "Verified renter who manages their own profile, verification, bookings, payments, reviews, and disputes",
    isSystemRole: true,
    permissions: [
      ...publicMarketplacePermissions,
      ...selfAccountPermissions,
      ...selfVerificationPermissions,
      ...renterBookingPermissions,
      ...selfDisputePermissions,
    ],
  },
  {
    name: SYSTEM_ROLES.PEERHOST,
    description:
      "Verified individual host who can still rent vehicles while also managing their own fleet, host bookings, compliance, payouts, and disputes",
    isSystemRole: true,
    permissions: [
      ...publicMarketplacePermissions,
      ...selfAccountPermissions,
      ...selfVerificationPermissions,
      ...renterBookingPermissions,
      ...selfDisputePermissions,
      { action: "create", subject: "Vehicle", conditions: selfUserVehicleCondition },
      { action: "read", subject: "Vehicle", conditions: selfUserVehicleCondition },
      { action: "update", subject: "Vehicle", conditions: selfUserVehicleCondition },
      { action: "create", subject: "Availability" },
      { action: "read", subject: "Availability" },
      { action: "update", subject: "Availability" },
      { action: "delete", subject: "Availability" },
      { action: "create", subject: "FleetDocument" },
      { action: "read", subject: "FleetDocument" },
      { action: "update", subject: "FleetDocument" },
      { action: "delete", subject: "FleetDocument" },
      { action: "create", subject: "Maintenance" },
      { action: "read", subject: "Maintenance" },
      { action: "update", subject: "Maintenance" },
      { action: "read", subject: "Booking" },
      { action: "update", subject: "Booking" },
      { action: "create", subject: "Payout", conditions: selfUserPayoutCondition },
      { action: "read", subject: "Payout", conditions: selfUserPayoutCondition },
      { action: "update", subject: "Payout", conditions: selfUserPayoutCondition },
      { action: "read", subject: "Transaction", conditions: selfUserLedgerCondition },
    ],
  },
  {
    name: SYSTEM_ROLES.COMPANY,
    description:
      "Independent company account that manages its own company profile, fleet operations, host-side bookings, ledger, payouts, and notifications after admin approval",
    isSystemRole: true,
    permissions: [
      ...selfAccountPermissions,
      { action: "read", subject: "Company", conditions: selfCompanyCondition },
      { action: "update", subject: "Company", conditions: selfCompanyCondition },
      { action: "create", subject: "Vehicle", conditions: selfCompanyVehicleCondition },
      { action: "read", subject: "Vehicle", conditions: selfCompanyVehicleCondition },
      { action: "update", subject: "Vehicle", conditions: selfCompanyVehicleCondition },
      { action: "create", subject: "Availability" },
      { action: "read", subject: "Availability" },
      { action: "update", subject: "Availability" },
      { action: "delete", subject: "Availability" },
      { action: "create", subject: "FleetDocument" },
      { action: "read", subject: "FleetDocument" },
      { action: "update", subject: "FleetDocument" },
      { action: "delete", subject: "FleetDocument" },
      { action: "create", subject: "Maintenance" },
      { action: "read", subject: "Maintenance" },
      { action: "update", subject: "Maintenance" },
      { action: "read", subject: "Booking" },
      { action: "update", subject: "Booking" },
      { action: "read", subject: "Transaction", conditions: selfCompanyLedgerCondition },
      { action: "create", subject: "Payout", conditions: selfCompanyPayoutCondition },
      { action: "read", subject: "Payout", conditions: selfCompanyPayoutCondition },
      { action: "update", subject: "Payout", conditions: selfCompanyPayoutCondition },
      ...selfDisputePermissions,
    ],
  },
  {
    name: SYSTEM_ROLES.ADMIN,
    description:
      "Platform administrator with full access to approvals, moderation, role management, finance, and platform operations",
    isSystemRole: true,
    permissions: [
      { action: "read", subject: "User" },
      { action: "update", subject: "User" },
      { action: "delete", subject: "User" },
      { action: "read", subject: "Company" },
      { action: "create", subject: "Company" },
      { action: "update", subject: "Company" },
      { action: "delete", subject: "Company" },
      { action: "read", subject: "Vehicle" },
      { action: "create", subject: "Vehicle" },
      { action: "update", subject: "Vehicle" },
      { action: "delete", subject: "Vehicle" },
      { action: "read", subject: "Booking" },
      { action: "update", subject: "Booking" },
      { action: "read", subject: "Availability" },
      { action: "create", subject: "Availability" },
      { action: "update", subject: "Availability" },
      { action: "delete", subject: "Availability" },
      { action: "read", subject: "FleetDocument" },
      { action: "create", subject: "FleetDocument" },
      { action: "update", subject: "FleetDocument" },
      { action: "delete", subject: "FleetDocument" },
      { action: "read", subject: "Maintenance" },
      { action: "create", subject: "Maintenance" },
      { action: "update", subject: "Maintenance" },
      { action: "delete", subject: "Maintenance" },
      { action: "read", subject: "Transaction" },
      { action: "update", subject: "Transaction" },
      { action: "read", subject: "Payout" },
      { action: "create", subject: "Payout" },
      { action: "update", subject: "Payout" },
      { action: "delete", subject: "Payout" },
      { action: "read", subject: "Review" },
      { action: "delete", subject: "Review" },
      { action: "read", subject: "Dispute" },
      { action: "create", subject: "Dispute" },
      { action: "update", subject: "Dispute" },
      { action: "delete", subject: "Dispute" },
      { action: "read", subject: "Verification" },
      { action: "update", subject: "Verification" },
      { action: "read", subject: "Notification" },
      { action: "create", subject: "Notification" },
      { action: "update", subject: "Notification" },
      { action: "delete", subject: "Notification" },
      { action: "read", subject: "Role" },
      { action: "create", subject: "Role" },
      { action: "update", subject: "Role" },
      { action: "delete", subject: "Role" },
      // Keep the legacy blanket rule until admin routes stop depending on authorize("manage", "all").
      { action: "manage", subject: "all" },
    ],
  },
];

/**
 * Script to seed the platform's base system roles.
 * Run via: pnpm tsx src/scripts/seedRoles.ts
 */
export async function seedRoles() {
  console.log("🌱 Seeding roles...");

  for (const r of rolesData) {
    await Role.findOneAndUpdate(
      { name: r.name },
      { $set: r },
      { upsert: true, returnDocument: "after" },
    );
    console.log(`✅ Upserted role: ${r.name}`);
  }

  console.log("✨ Seeding complete.");
}

// Allow running this script directly
if (import.meta.url.endsWith("seedRoles.ts")) {
  connectDatabase()
    .then(() => seedRoles())
    .then(() => mongoose.connection.close())
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
