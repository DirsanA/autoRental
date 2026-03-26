import mongoose from "mongoose";
import { Role } from "../models/Role.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { connectDatabase } from "../config/database.js";

const rolesData = [
  {
    name: SYSTEM_ROLES.RENTER,
    description:
      "Standard customer who manages their own profile and bookings after verification",
    isSystemRole: true,
    permissions: [
      { action: "read", subject: "Vehicle" },
      { action: "read", subject: "User", conditions: { _id: "${userId}" } },
      { action: "update", subject: "User", conditions: { _id: "${userId}" } },
      {
        action: "manage",
        subject: "Booking",
        conditions: { customerId: "${userId}" },
      },
    ],
  },
  {
    name: SYSTEM_ROLES.PEERHOST,
    description:
      "Verified individual host who manages only their own vehicles and host bookings",
    isSystemRole: true,
    permissions: [
      { action: "read", subject: "Vehicle" },
      {
        action: "manage",
        subject: "Vehicle",
        conditions: { ownerId: "${userId}" },
      },
      { action: "read", subject: "User", conditions: { _id: "${userId}" } },
      { action: "update", subject: "User", conditions: { _id: "${userId}" } },
      {
        action: "manage",
        subject: "Booking",
        conditions: { ownerId: "${userId}" },
      },
    ],
  },
  {
    name: SYSTEM_ROLES.COMPANY,
    description:
      "Independent company account that manages only its own company profile after admin approval",
    isSystemRole: true,
    permissions: [
      {
        action: "read",
        subject: "Company",
        conditions: { authUserId: "${userId}" },
      },
      {
        action: "update",
        subject: "Company",
        conditions: { authUserId: "${userId}" },
      },
    ],
  },
  {
    name: SYSTEM_ROLES.ADMIN,
    description:
      "Platform administrator with full access to approvals, reviews, company moderation, and operations",
    isSystemRole: true,
    permissions: [{ action: "manage", subject: "all" }],
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
