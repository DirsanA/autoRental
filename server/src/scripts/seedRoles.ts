import mongoose from "mongoose";
import { Role } from "../models/Role.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { connectDatabase } from "../config/database.js";

const rolesData = [
  {
    name: SYSTEM_ROLES.RENTER,
    description: "Standard customer who can browse and rent vehicles",
    isSystemRole: true,
    permissions: [
      { action: "read", subject: "Vehicle" },
      { action: "read", subject: "User", conditions: { _id: "${userId}" } },
      { action: "update", subject: "User", conditions: { _id: "${userId}" } },
      { action: "manage", subject: "Booking", conditions: { customerId: "${userId}" } },
    ],
  },
  {
    name: SYSTEM_ROLES.PEERHOST,
    description: "Individual host who lists their own private vehicles",
    isSystemRole: true,
    permissions: [
      { action: "read", subject: "Vehicle" },
      { action: "manage", subject: "Vehicle", conditions: { ownerId: "${userId}" } },
      { action: "read", subject: "User", conditions: { _id: "${userId}" } },
      { action: "update", subject: "User", conditions: { _id: "${userId}" } },
      { action: "manage", subject: "Booking", conditions: { ownerId: "${userId}" } },
    ],
  },
  {
    name: SYSTEM_ROLES.COMPANY,
    description: "Admin of a registered rental company",
    isSystemRole: true,
    permissions: [
      { action: "read", subject: "Vehicle" },
      { action: "manage", subject: "Vehicle", conditions: { companyId: "${companyId}" } },
      { action: "manage", subject: "Company", conditions: { ownerId: "${userId}" } },
      { action: "manage", subject: "Booking", conditions: { companyId: "${companyId}" } },
      { action: "read", subject: "User", conditions: { _id: "${userId}" } },
      { action: "update", subject: "User", conditions: { _id: "${userId}" } },
    ],
  },
  {
    name: SYSTEM_ROLES.ADMIN,
    description: "Platform administrator with full root access",
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
      { upsert: true, returnDocument: "after" }
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
