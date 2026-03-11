# 🛸 Project Antigravity: Backend Architecture & Modeling Standards

This document serves as the **Source of Truth** for data modeling, directory structure, and coding patterns within the Antigravity ecosystem. All contributions must adhere to these standards to ensure the platform remains **scalable**, **type-safe**, and **maintainable**.

---

## 🏗️ 1. Core Architectural Principles

- **Type Safety First:** Every Mongoose model must be paired with a TypeScript `interface` and a `HydratedDocument` type for internal usage.
- **Clean Architecture:** Logic is strictly separated:
  - **Models:** Data structure, validation, and field-level security.
  - **Services:** Business logic (e.g., payment orchestration, availability calculations).
  - **Controllers:** Request handling and response mapping.
- **Polymorphic Ownership:** Use `refPath` for assets (Vehicles, Documents) that can be owned by either a `User` (P2P) or a `Company` (Enterprise).
- **Soft Immutability:** Sensitive records—especially **Transactions** and **Bookings**—must never be deleted. Use status flags (`CANCELLED`, `VOIDED`) to maintain a perfect audit trail.

---

## 📂 2. Directory Structure

```text
src/
├── models/           # Mongoose schemas & TS interfaces
├── services/         # Business logic (The "Brain" of the app)
├── controllers/      # Route handlers (The "Entry points")
├── middleware/       # Auth, CASL RBAC, and validation logic
├── types/            # Global TS declarations and shared enums
└── utils/            # Helpers (Price calculators, OCR, etc.)
```

---

## 🧭 3. Entity Relationship Map

| Entity | Primary Relation | Key Responsibility |
| :--- | :--- | :--- |
| **User** | Roles, Company | Identity, Auth, and Personal Wallet. |
| **Role** | Permissions | Dynamic RBAC using CASL actions and conditions. |
| **Vehicle** | Owner (Polymorphic) | Turo-style details, Transmission, and Geo-location. |
| **Booking** | Renter, Vehicle | Rental lifecycle, Pricing snapshots, and Escrow status. |
| **Availability** | Vehicle | High-performance "Blackout" calendar for car inventory. |
| **Transaction** | Booking | Financial audit trail for payments, refunds, and payouts. |

---

## 📏 4. Modeling & Validation Standards

### Naming Conventions
- **Enums/Types:** Use PascalCase for names, UPPER_CASE for union values (e.g., `"PENDING" | "ACTIVE"`).
- **Booleans:** Use prefixes `has`, `is`, or `can` (e.g., `hasBluetooth`, `isSystemRole`).
- **Interfaces:** Prefix with `I` (e.g., `IUser`, `IRole`).

### Data Logic
- **Geospatial:** Always use GeoJSON Point format `[longitude, latitude]` for 2DSphere indexing.
- **Timestamps:** All schemas must enable `{ timestamps: true }`.
- **Phone Numbers:** Must follow E.164 format validation (e.g., `+2519...`).

---

## 🔐 5. Security & Transformation Logic

- **Data Masking:** Sensitive fields (e.g., `password`) must be marked `select: false` in the schema AND deleted in the `toJSON` transform.
- **ID Mapping:** Always transform `_id` to `id` (string) in the `toJSON` layer for frontend-friendly consumption.
- **CASL Readiness:** The `Role.permissions.conditions` field must be typed as `Schema.Types.Mixed` to support dynamic MongoDB-style logic.
- **System Protection:** `isSystemRole` must be checked before any `DELETE` operation to prevent accidental removal of core platform roles (e.g., `SuperAdmin`).

---

## 🚀 6. Workflow: Adding a New Model

1. **Define Interface:** Create `IEntityName` in `src/models/`.
2. **Define Schema:** Implement validation, indexes, and timestamps.
3. **Add Transforms:** Configure `toJSON` to convert `_id` to `id` and remove `__v`.
4. **Export Types:** Export the model and the `HydratedDocument` type.
5. **Register:** Add the model to the central `src/models/index.ts` export hub.
