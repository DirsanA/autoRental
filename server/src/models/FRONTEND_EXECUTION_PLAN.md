# Frontend Execution Plan

> Auto-generated from backend models on 2026-03-19.
> Source: `server/src/models/*.ts` (14 models, 1 barrel export).
> Audience: frontend developers implementing role-based dashboards & flows.

---

## Entity Reference (Backend → Frontend)

| # | Model           | Key Enums / Statuses                                                                                 |
|---|-----------------|------------------------------------------------------------------------------------------------------|
| 1 | User            | verificationLevel: `BASIC` · `ID_VERIFIED` · `LICENSE_VERIFIED` / status: `PENDING` · `ACTIVE` · `SUSPENDED` |
| 2 | Role            | Dynamic permissions via `{ action, subject, conditions }` array                                      |
| 3 | Company         | status: `PENDING_APPROVAL` · `ACTIVE` · `SUSPENDED`                                                 |
| 4 | Vehicle         | ownerType: `User` · `Company` / status: `AVAILABLE` · `BOOKED` · `MAINTENANCE` · `RETIRED` · `PENDING_APPROVAL` / category: `SEDAN` · `SUV` · `LUXURY` · `TRUCK` · `VAN` |
| 5 | Booking         | status: `PENDING` · `CONFIRMED` · `ACTIVE` · `COMPLETED` · `CANCELLED` · `DISPUTED`                 |
| 6 | Availability    | reason: `BOOKING` · `MAINTENANCE` · `OWNER_USE` · `OFF_SEASON` · `ADMIN_HOLD` · `PENDING_DELIVERY` / source: `SYSTEM` · `OWNER` · `ADMIN` |
| 7 | Maintenance     | status: `SCHEDULED` · `IN_PROGRESS` · `COMPLETED` · `CANCELLED`                                     |
| 8 | FleetDocument   | type: `INSURANCE` · `INSPECTION_BOLO` · `LIBRE` · `OPERATIONAL_PERMIT` · `THIRD_PARTY_LIABILITY` · `CUSTOMS_CLEARANCE` / status: `VALID` · `EXPIRING_SOON` · `EXPIRED` · `PENDING_RENEWAL` · `REJECTED` |
| 9 | Transaction     | type: `RENTAL_FEE` · `COLLATERAL_DEPOSIT` · `REFUND` · `PAYOUT` · `COMMISSION` / status: `PENDING` · `HELD_IN_ESCROW` · `COMPLETED` · `FAILED` · `REFUNDED` |
| 10| Payout          | ownerType: `User` · `Company` / status: `PENDING` · `PROCESSING` · `PAID` · `FAILED` · `CANCELLED` / method: `BANK_TRANSFER` · `TELEBIRR` · `CHAPA` · `MANUAL` |
| 11| Dispute         | subjectModel: `Booking` · `Transaction` · `Vehicle` · `Review` · `User` / status: `OPEN` · `UNDER_REVIEW` · `AWAITING_RESPONSE` · `RESOLVED` · `CLOSED` / issueCategory: 7 values / actionTaken: 6 values |
| 12| Review          | targetType: `Vehicle` · `Company` · `User` / rating: 1–5                                            |
| 13| Verification    | documentType: `NATIONAL_ID` · `PASSPORT` · `DRIVER_LICENSE` · `BUSINESS_LICENSE` / status: `PENDING` · `APPROVED` · `REJECTED` |
| 14| Notification    | category: 9 values / priority: `LOW` · `MEDIUM` · `HIGH` · `URGENT` / channel: `IN_APP` · `EMAIL` · `SMS` · `PUSH` |

---

# Role 1: Renter (Normal User)

## 1. Features / Pages

| Page                  | Route (proposed)                  | Purpose                                                                 |
|-----------------------|-----------------------------------|-------------------------------------------------------------------------|
| Vehicle Search        | `/vehicles`                       | Browse, filter, and search available vehicles by location, category, price, and features |
| Vehicle Detail        | `/vehicles/[vehicleId]`           | View full vehicle specs, images, availability calendar, host profile, and reviews |
| Booking Create        | `/vehicles/[vehicleId]/book`      | Select dates, driver option, see price breakdown, submit booking        |
| My Bookings           | `/bookings`                       | List all renter bookings with status filters                            |
| Booking Detail        | `/bookings/[bookingId]`           | View booking timeline, price snapshot, pickup/return info, actions      |
| My Transactions       | `/transactions`                   | View all personal payment history                                       |
| My Reviews            | `/reviews`                        | List all reviews the renter has written                                  |
| Write Review          | `/bookings/[bookingId]/review`    | Submit rating + comment + images after a completed booking              |
| My Disputes           | `/disputes`                       | View disputes the renter has raised                                     |
| Raise Dispute         | `/bookings/[bookingId]/dispute`   | Open a new dispute against a booking                                    |
| Profile & Verification| `/profile`                        | View/edit personal info, upload ID/license docs, see verification level |
| Wallet                | `/wallet`                         | View wallet balance, transaction history, top-up / refund status        |
| Notifications         | `/notifications`                  | In-app notification inbox                                               |

## 2. Data Used

| Entity        | Properties consumed by frontend                                                                                     | Relationships                |
|---------------|----------------------------------------------------------------------------------------------------------------------|------------------------------|
| Vehicle       | `id`, `brand`, `model`, `year`, `plateNumber`, `category`, `pricePerHour`, `minRentalHours`, `isDriverAvailable`, `canSelfDrive`, `pickupLocation`, `returnLocation`, `addressName`, `status`, `features.*`, `images` | → Owner (User or Company)    |
| Availability  | `startDate`, `endDate`, `reason`                                                                                     | → Vehicle                    |
| Booking       | `id`, `bookingId`, `startTime`, `endTime`, `actualReturnTime`, `withDriver`, `status`, `priceSnapshot.*`, `pickupAddress`, `returnAddress`, `collateralDetails.*`, `createdAt` | → Vehicle, → Renter (self)   |
| Transaction   | `id`, `amount`, `currency`, `type`, `status`, `paymentGatewayId`, `invoiceUrl`, `createdAt`                          | → Booking                    |
| Review        | `id`, `rating`, `comment`, `images`, `createdAt`, `targetType`                                                       | → Booking, → Target          |
| Dispute       | `id`, `issueCategory`, `description`, `evidenceUrls`, `status`, `notes[]`, `adminResolution`, `createdAt`            | → Booking/Subject            |
| User (self)   | `id`, `firstName`, `lastName`, `email`, `phoneNumber`, `verificationLevel`, `status`, `walletBalance`, `lastLogin`   | → Roles                      |
| Verification  | `id`, `documentType`, `documentFrontUrl`, `documentBackUrl`, `status`, `adminComment`, `createdAt`                   | → User (self)                |
| Notification  | `id`, `title`, `message`, `category`, `priority`, `isRead`, `readAt`, `actionUrl`, `createdAt`                       | → User (self)                |

## 3. Actions

| Action                         | API Interaction (REST)                         | State Transition / Notes                                     |
|--------------------------------|------------------------------------------------|--------------------------------------------------------------|
| Search vehicles                | `GET /vehicles?location=&category=&minPrice=&maxPrice=&startDate=&endDate=` | Filters against Availability blocks server-side |
| View vehicle detail            | `GET /vehicles/:id` (populate owner, reviews)  | Read-only                                                    |
| Check availability calendar    | `GET /vehicles/:id/availability`               | Returns blocked date ranges; UI renders inverse as available  |
| Create booking                 | `POST /bookings`                               | Vehicle: `AVAILABLE` → `BOOKED` · Booking: → `PENDING`       |
| Cancel booking                 | `PATCH /bookings/:id/cancel`                   | Booking: `PENDING`/`CONFIRMED` → `CANCELLED`                 |
| View booking detail            | `GET /bookings/:id`                            | Populate vehicle, host, transactions                          |
| Pay for booking                | `POST /bookings/:id/pay`                       | Creates Transaction `RENTAL_FEE` → `PENDING`/`HELD_IN_ESCROW`|
| Submit review                  | `POST /bookings/:id/review`                    | Only when Booking.status === `COMPLETED`                      |
| Raise dispute                  | `POST /disputes`                               | Creates Dispute `OPEN`; Booking optionally → `DISPUTED`       |
| Add dispute note               | `POST /disputes/:id/notes`                     | Appends to notes[]                                            |
| Upload verification doc        | `POST /verifications`                          | Creates Verification `PENDING`                                |
| Mark notification read         | `PATCH /notifications/:id/read`                | `isRead` → true, `readAt` set                                |
| Mark all notifications read    | `PATCH /notifications/read-all`                | Bulk update                                                   |
| Update profile                 | `PATCH /users/me`                              | firstName, lastName, phoneNumber, email                       |
| View wallet & transactions     | `GET /users/me/wallet`, `GET /transactions?payerId=me` | Read-only                                         |

## 4. Business Rules

| Rule                                          | Detail                                                                              |
|-----------------------------------------------|--------------------------------------------------------------------------------------|
| Booking date validation                       | `startTime` must be ≥ now; `endTime - startTime` ≥ `vehicle.minRentalHours`         |
| Driver option constraint                      | `withDriver: true` only if `vehicle.isDriverAvailable === true`                      |
| Self-drive constraint                         | Self-drive only if `vehicle.canSelfDrive === true`; requires `LICENSE_VERIFIED`       |
| Collateral required for self-drive            | If `withDriver === false`, `collateralDetails` must be provided                      |
| Review gating                                 | Can only review after Booking.status === `COMPLETED`; one review per booking/reviewer |
| Dispute gating                                | Can only dispute `CONFIRMED` / `ACTIVE` / `COMPLETED` bookings                      |
| Verification level progression                | `BASIC` → `ID_VERIFIED` (submit NATIONAL_ID/PASSPORT) → `LICENSE_VERIFIED` (DRIVER_LICENSE) |
| Cancellation window                           | Frontend should warn if cancellation is within X hours of startTime                  |
| Wallet balance display                        | `walletBalance` is read-only on frontend; mutations happen server-side via Transactions |

## 5. Edge Cases

| Scenario                                   | Frontend Handling                                                         |
|--------------------------------------------|---------------------------------------------------------------------------|
| No vehicles found for search criteria      | Empty state with "No vehicles available. Try adjusting your filters."     |
| Vehicle becomes unavailable between search & booking | API returns 409 Conflict → show "Vehicle is no longer available" |
| Double-booking attempt                     | Server rejects via Availability overlap check → show error toast          |
| Payment gateway failure                    | Transaction → `FAILED` → show retry option                               |
| Booking cancelled by host                  | Push notification + Booking → `CANCELLED` → show refund status            |
| Dispute on already-disputed booking        | Server returns 409 → "A dispute is already open for this booking"         |
| Verification document rejected             | Show `adminComment` with re-upload option                                 |
| Expired notification                       | TTL auto-deletes; frontend receives empty result — handle gracefully      |

---

# Role 2: Individual Host (P2P Host)

## 1. Features / Pages

| Page                     | Route (proposed)                        | Purpose                                                      |
|--------------------------|-----------------------------------------|--------------------------------------------------------------|
| Host Dashboard           | `/host/dashboard`                       | KPIs: total vehicles, active bookings, total earnings, avg rating |
| My Vehicles              | `/host/vehicles`                        | List all owned vehicles with status filters                  |
| Add Vehicle              | `/host/vehicles/new`                    | Multi-step form to list a new vehicle                        |
| Edit Vehicle             | `/host/vehicles/[vehicleId]/edit`       | Update details, images, pricing, availability                |
| Vehicle Detail           | `/host/vehicles/[vehicleId]`            | Full vehicle info + bookings on this vehicle + reviews       |
| Availability Manager     | `/host/vehicles/[vehicleId]/availability` | Calendar view; block dates (OWNER_USE, OFF_SEASON, etc.)   |
| Fleet Documents          | `/host/vehicles/[vehicleId]/documents`  | Upload/manage INSURANCE, BOLO, LIBRE, etc.                   |
| Maintenance Log          | `/host/vehicles/[vehicleId]/maintenance`| Schedule & track maintenance tasks                           |
| Booking Requests         | `/host/bookings`                        | List incoming booking requests + active bookings             |
| Booking Detail           | `/host/bookings/[bookingId]`            | View details, confirm/reject, verify collateral, mark complete |
| Earnings & Payouts       | `/host/earnings`                        | Revenue overview, payout history, request payout             |
| Reviews Received         | `/host/reviews`                         | All reviews targeting host's vehicles or host profile        |
| Disputes                 | `/host/disputes`                        | Disputes where host is respondent + host-raised disputes     |
| Profile & Verification   | `/host/profile`                         | Same as renter profile + host-specific KPIs                  |
| Notifications            | `/host/notifications`                   | In-app notification inbox                                    |

## 2. Data Used

| Entity        | Properties consumed                                                                                                 | Relationships                     |
|---------------|----------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| Vehicle       | All properties (host is the owner)                                                                                   | → User (self as ownerId, ownerType: "User") |
| Availability  | `id`, `vehicleId`, `startDate`, `endDate`, `reason`, `source`, `notes`, `bookingId`, `maintenanceId`                 | → Vehicle, → Booking, → Maintenance |
| FleetDocument | `id`, `vehicleId`, `type`, `documentNumber`, `issuedDate`, `expiryDate`, `fileUrl`, `status`, `remindersSent`, `notes` | → Vehicle                        |
| Maintenance   | `id`, `vehicleId`, `taskName`, `description`, `status`, `scheduledDate`, `completedDate`, `cost`, `performedBy`, `attachments` | → Vehicle                |
| Booking       | `id`, `bookingId`, `renterId`, `vehicleId`, `priceSnapshot.*`, `startTime`, `endTime`, `actualReturnTime`, `withDriver`, `status`, `pickupAddress`, `returnAddress`, `collateralDetails.*` | → Vehicle (owned), → Renter |
| Transaction   | `id`, `amount`, `currency`, `type`, `status`, `createdAt`                                                            | → Booking                        |
| Payout        | `id`, `amount`, `currency`, `status`, `payoutMethod`, `gatewayReference`, `failureReason`, `processedAt`, `paidAt`, `transactionIds` | → User (self)         |
| Review        | `id`, `bookingId`, `reviewerId`, `rating`, `comment`, `images`, `createdAt`                                          | → Vehicle (target)               |
| Dispute       | `id`, `subjectId`, `subjectModel`, `raisedBy`, `respondentId`, `issueCategory`, `description`, `evidenceUrls`, `status`, `notes`, `adminResolution` | → Booking, → Host |
| User (self)   | `id`, `firstName`, `lastName`, `email`, `phoneNumber`, `verificationLevel`, `status`, `walletBalance`                | → Roles                          |
| Verification  | `id`, `documentType`, `status`, `adminComment`, `createdAt`                                                           | → User (self)                    |
| Notification  | `id`, `title`, `message`, `category`, `priority`, `isRead`, `actionUrl`, `createdAt`                                 | → User (self)                    |

## 3. Actions

| Action                           | API Interaction                                    | State Transition / Notes                                      |
|----------------------------------|----------------------------------------------------|---------------------------------------------------------------|
| List own vehicles                | `GET /vehicles?ownerId=me&ownerType=User`          | Filtered by ownership                                         |
| Add vehicle                      | `POST /vehicles`                                   | Vehicle → `PENDING_APPROVAL` (admin must approve)             |
| Edit vehicle                     | `PATCH /vehicles/:id`                              | Only if `ownerType === "User"` and `ownerId === me`           |
| Delete/retire vehicle            | `PATCH /vehicles/:id` (status → `RETIRED`)         | Only if no active bookings                                    |
| Upload fleet document            | `POST /fleet-documents`                            | FleetDocument → status `VALID` (or `PENDING_RENEWAL`)         |
| Block availability               | `POST /availability`                               | source: `OWNER`; reason: `OWNER_USE` / `OFF_SEASON`          |
| Unblock availability             | `DELETE /availability/:id`                         | Only if source === `OWNER`                                    |
| Schedule maintenance             | `POST /maintenance`                                | Maintenance → `SCHEDULED`; auto-creates Availability block    |
| Update maintenance status        | `PATCH /maintenance/:id`                           | `SCHEDULED` → `IN_PROGRESS` → `COMPLETED`                    |
| Confirm booking                  | `PATCH /bookings/:id/confirm`                      | Booking: `PENDING` → `CONFIRMED`                              |
| Reject booking                   | `PATCH /bookings/:id/reject`                       | Booking: `PENDING` → `CANCELLED`; Availability block removed  |
| Start trip (mark active)         | `PATCH /bookings/:id/activate`                     | Booking: `CONFIRMED` → `ACTIVE`                               |
| Complete booking                 | `PATCH /bookings/:id/complete`                     | Booking: `ACTIVE` → `COMPLETED`; sets `actualReturnTime`      |
| Verify collateral                | `PATCH /bookings/:id/collateral`                   | Sets `collateralDetails.verifiedByStaff`                      |
| Request payout                   | `POST /payouts`                                    | Aggregates COMPLETED transactions → Payout `PENDING`          |
| Respond to dispute               | `POST /disputes/:id/notes`                         | Adds note to dispute thread                                   |
| Raise dispute (against renter)   | `POST /disputes`                                   | e.g., LATE_RETURN, VEHICLE_CONDITION                          |
| View payout history              | `GET /payouts?ownerId=me&ownerType=User`           | Filtered by ownership                                         |

## 4. Business Rules

| Rule                                            | Detail                                                                         |
|--------------------------------------------------|--------------------------------------------------------------------------------|
| Vehicle must have valid documents to be AVAILABLE| If any FleetDocument has `status === EXPIRED`, vehicle cannot be `AVAILABLE`   |
| Ownership check on all mutations                 | `ownerId` must match authenticated user for Vehicle, Availability, Maintenance |
| Booking confirmation deadline                    | ⚠️ **Not in model** — consider adding `confirmByTime` field or handling with business logic timer |
| Payout minimum threshold                         | ⚠️ **Not in model** — frontend should enforce or API should reject below threshold |
| Collateral verification before trip start        | If `withDriver === false`, `collateralDetails.verifiedByStaff` should be set before `ACTIVE` |
| Cannot retire vehicle with active bookings       | Server must reject; frontend should grey out the option                        |
| One active Availability block per reason/date    | Prevent duplicate blocks on overlapping ranges                                 |
| Maintenance auto-blocks availability             | Creating maintenance auto-generates Availability with reason: `MAINTENANCE`, source: `SYSTEM` |
| FleetDocument expiry alert                       | Show warning badge when `status === "EXPIRING_SOON"`                           |

## 5. Edge Cases

| Scenario                                    | Frontend Handling                                                        |
|---------------------------------------------|--------------------------------------------------------------------------|
| Vehicle pending approval indefinitely       | Show status badge + "Under review" message; no booking possible          |
| All fleet documents expired                 | Vehicle auto-set to `MAINTENANCE` status; show "Renew documents" CTA     |
| Booking cancelled by renter after confirm   | Notification received; calendar block released automatically             |
| Payout failed                               | Show `failureReason`; allow retry or contact support                     |
| Late return by renter                       | `actualReturnTime > endTime` — show overdue badge on booking detail      |
| Dispute raised against host                 | Notification + dispute badge in sidebar; host can respond via notes      |
| Zero earnings (new host)                    | Empty state: "Once your first trip completes, your earnings will appear" |
| Document upload fails                       | Retry mechanism + file size/type validation on frontend                  |

---

# Role 3: Company (Enterprise Host)

## 1. Features / Pages

| Page                        | Route (proposed)                            | Purpose                                                       |
|-----------------------------|---------------------------------------------|---------------------------------------------------------------|
| Company Dashboard           | `/company/dashboard`                        | KPIs: fleet size, total bookings, revenue, avg rating, wallet balance |
| Company Profile             | `/company/profile`                          | Edit company info, logo, bio, social links, contact info       |
| Fleet Management            | `/company/vehicles`                         | List all company-owned vehicles                                |
| Add Vehicle                 | `/company/vehicles/new`                     | Register a new vehicle under the company                       |
| Edit Vehicle                | `/company/vehicles/[vehicleId]/edit`        | Update vehicle details, pricing, location                      |
| Vehicle Detail              | `/company/vehicles/[vehicleId]`             | Full vehicle info + bookings + documents + maintenance         |
| Fleet Documents             | `/company/vehicles/[vehicleId]/documents`   | Upload/manage compliance documents per vehicle                 |
| Maintenance Management      | `/company/vehicles/[vehicleId]/maintenance` | Schedule and track maintenance                                 |
| Availability Calendar       | `/company/vehicles/[vehicleId]/availability`| Block/unblock dates across fleet                               |
| Booking Management          | `/company/bookings`                         | All bookings across all company vehicles                       |
| Booking Detail              | `/company/bookings/[bookingId]`             | View/manage individual booking                                 |
| Revenue & Payouts           | `/company/revenue`                          | Financial overview, transaction ledger, payout requests        |
| Reviews                     | `/company/reviews`                          | Reviews on company vehicles and company profile                |
| Disputes                    | `/company/disputes`                         | Company-wide dispute management                                |
| Verification                | `/company/verification`                     | Business license upload, company verification status           |
| Notifications               | `/company/notifications`                    | Notification center for company owner                          |

## 2. Data Used

| Entity        | Properties consumed                                                                                                 | Relationships                              |
|---------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| Company       | `id`, `name`, `tinNumber`, `website`, `logoUrl`, `bio`, `contactInfo.*`, `location`, `socialLinks.*`, `isVerified`, `verifiedAt`, `status`, `rejectionReason`, `walletBalance` | → Owner (User)               |
| Vehicle       | All properties; filtered by `ownerType === "Company"` and `ownerId === companyId`                                    | → Company                                  |
| Availability  | All properties; filtered by vehicles belonging to company                                                             | → Vehicle → Company                        |
| FleetDocument | All properties; per vehicle                                                                                           | → Vehicle → Company                        |
| Maintenance   | All properties; per vehicle                                                                                           | → Vehicle → Company                        |
| Booking       | All properties; filtered by `vehicleId` in company's fleet                                                            | → Vehicle → Company, → Renter              |
| Transaction   | `id`, `bookingId`, `amount`, `currency`, `type`, `status`, `createdAt`                                               | → Booking → Vehicle → Company              |
| Payout        | All properties; `ownerType === "Company"`, `ownerId === companyId`                                                    | → Company                                  |
| Review        | `id`, `bookingId`, `reviewerId`, `targetId`, `targetType`, `rating`, `comment`, `images`, `createdAt`                 | → Vehicle or Company (target)              |
| Dispute       | All properties; where company vehicles or company is involved                                                         | → Subject (Booking/Vehicle/etc.)           |
| Verification  | `id`, `companyId`, `documentType`, `status`, `adminComment`, `createdAt`                                              | → Company, → User (uploader)              |
| Notification  | Standard properties; sent to `ownerId` (the user who manages the company)                                             | → User (company owner)                    |

## 3. Actions

| Action                           | API Interaction                                         | State Transition / Notes                                    |
|----------------------------------|---------------------------------------------------------|-------------------------------------------------------------|
| Update company profile           | `PATCH /companies/:id`                                  | name, bio, contactInfo, socialLinks, logo, website          |
| List fleet vehicles              | `GET /vehicles?ownerId=:companyId&ownerType=Company`    | Filtered by company ownership                               |
| Add vehicle to fleet             | `POST /vehicles` (ownerType: "Company")                 | Vehicle → `PENDING_APPROVAL`                                |
| Edit vehicle                     | `PATCH /vehicles/:id`                                   | Ownership check via company                                 |
| Retire vehicle                   | `PATCH /vehicles/:id` (status → `RETIRED`)              | Only if no active bookings                                  |
| Upload fleet document            | `POST /fleet-documents`                                 | FleetDocument → `VALID`                                     |
| Block/unblock availability       | `POST/DELETE /availability`                             | source: `OWNER` (company acts as owner)                     |
| Schedule maintenance             | `POST /maintenance`                                     | Auto-block availability                                     |
| Confirm/reject booking           | `PATCH /bookings/:id/confirm` or `/reject`              | Same state machine as P2P host                              |
| Complete booking                 | `PATCH /bookings/:id/complete`                          | Booking → `COMPLETED`                                       |
| Verify collateral                | `PATCH /bookings/:id/collateral`                        | Company staff verifies collateral                           |
| Request payout                   | `POST /payouts` (ownerType: "Company")                  | Aggregates transactions → Payout `PENDING`                  |
| Upload business license          | `POST /verifications` (documentType: "BUSINESS_LICENSE", companyId) | Verification → `PENDING`                    |
| Respond to dispute               | `POST /disputes/:id/notes`                              | Company adds notes via owner user                           |
| Raise dispute                    | `POST /disputes`                                        | Against renter if issues arise                              |

## 4. Business Rules

| Rule                                              | Detail                                                                           |
|----------------------------------------------------|----------------------------------------------------------------------------------|
| Company must be ACTIVE to list vehicles            | If `Company.status !== "ACTIVE"`, block vehicle creation API-side                |
| Company verification required                      | `isVerified === true` required to have vehicles go `AVAILABLE`                   |
| Vehicle ownership is polymorphic                   | Frontend must always send `ownerType: "Company"` when acting as company          |
| Fleet document compliance                          | All required document types must be `VALID` for vehicle to be rentable           |
| `walletBalance` on Company (not User)              | Company earnings go to `Company.walletBalance`; personal funds stay in `User.walletBalance` |
| Company `ownerId` maps to a User                   | The User with this ID is the company admin; permissions flow through User.roles  |
| Booking actions scoped to company fleet             | Company can only manage bookings for vehicles where `ownerId === companyId`      |
| Payout via company-level methods                    | Company can set preferred `payoutMethod` (BANK_TRANSFER, TELEBIRR, CHAPA)       |

## 5. Edge Cases

| Scenario                                      | Frontend Handling                                                      |
|-----------------------------------------------|------------------------------------------------------------------------|
| Company suspended by admin                    | All pages show "Company suspended" banner; mutations blocked           |
| Rejection reason provided                     | Show `rejectionReason` prominently with "Contact support" option       |
| Company has zero vehicles                     | Empty state: "Add your first vehicle to start earning"                 |
| Multiple vehicles with expired documents      | Fleet-wide alert banner + per-vehicle badges                           |
| Company wallet shows negative after refund    | ⚠️ Wallet has `min: 0` — server should prevent; show error if occurs  |
| Payout requested exceeds wallet balance       | Server rejects → show "Insufficient balance" error                    |
| Booking on a vehicle pending approval         | Not possible; search excludes `PENDING_APPROVAL` vehicles             |
| Company owner's user account suspended        | Company dashboard inaccessible; show "Account suspended" on login     |

---

# Role 4: System Admin

## 1. Features / Pages

| Page                     | Route (proposed)                        | Purpose                                                       |
|--------------------------|-----------------------------------------|---------------------------------------------------------------|
| Admin Dashboard          | `/sysadmin/dashboard`                   | Platform-wide KPIs: users, bookings, revenue, disputes, vehicles |
| User Management          | `/sysadmin/users`                       | List all users across roles; search, filter, sort              |
| User Detail              | `/sysadmin/users/[userId]`              | Full user profile, activity, verifications, bookings, disputes |
| Company Management       | `/sysadmin/companies`                   | List all companies; approve, suspend, manage                   |
| Company Detail           | `/sysadmin/companies/[companyId]`       | Company profile, fleet, financials, reviews, verifications     |
| P2P Host Approvals       | `/sysadmin/p2p`                         | List P2P hosts and their vehicle listings needing approval     |
| P2P Host Detail          | `/sysadmin/p2p/[hostId]`               | Host profile, vehicles, documents, earnings                    |
| Vehicle Approvals        | `/sysadmin/vehicles`                    | All vehicles across owners awaiting approval or flagged        |
| Vehicle Detail           | `/sysadmin/vehicles/[vehicleId]`        | Full vehicle detail, documents, bookings, maintenance          |
| Booking Overview         | `/sysadmin/bookings`                    | All bookings platform-wide; filter by status, date range       |
| Booking Detail           | `/sysadmin/bookings/[bookingId]`        | Full booking info + transactions + dispute links               |
| Dispute Management       | `/sysadmin/disputes`                    | All open/active disputes; queue management                     |
| Dispute Detail           | `/sysadmin/disputes/[disputeId]`        | Full dispute context, notes thread, resolution controls        |
| Revenue & Transactions   | `/sysadmin/revenue`                     | Platform-wide financial overview; commission tracking           |
| Payout Management        | `/sysadmin/payouts`                     | Review and process pending payouts                             |
| Verification Queue       | `/sysadmin/verifications`               | Review pending document submissions from users/companies       |
| Notification Management  | ⚠️ `/sysadmin/notifications`           | **Optional** — broadcast system notifications (requires backend addition) |
| Role Management          | `/sysadmin/roles`                       | View/edit roles and permission sets (CASL-based)               |

## 2. Data Used

| Entity        | Properties consumed                                                    | Notes                                |
|---------------|-------------------------------------------------------------------------|--------------------------------------|
| User          | All properties (excluding password)                                     | Full CRUD access                     |
| Role          | `id`, `name`, `description`, `permissions[]`, `isSystemRole`            | For role assignment UI               |
| Company       | All properties                                                          | Approve/suspend companies            |
| Vehicle       | All properties                                                          | Approve/flag vehicles globally       |
| Booking       | All properties                                                          | Read-only oversight + dispute link   |
| Transaction   | All properties                                                          | Financial audit                      |
| Payout        | All properties                                                          | Approve/reject/process payouts       |
| Dispute       | All properties including `adminResolution`, `notes[]`, `metadata`       | Full resolution workflow             |
| Review        | All properties                                                          | Moderate/flag/remove reviews         |
| Verification  | All properties including `extractedData`                                | Approve/reject documents             |
| FleetDocument | All properties                                                          | Compliance oversight                 |
| Maintenance   | All properties                                                          | Read-only (no admin intervention)    |
| Availability  | All properties                                                          | Can create `ADMIN_HOLD` blocks       |
| Notification  | All properties                                                          | View system-wide notifications       |

## 3. Actions

| Action                            | API Interaction                                   | State Transition / Notes                                      |
|-----------------------------------|---------------------------------------------------|---------------------------------------------------------------|
| **Users**                         |                                                   |                                                               |
| View all users                    | `GET /users?page=&limit=&status=&role=&search=`   | Paginated with filters                                        |
| Edit user                         | `PATCH /users/:id`                                | Update status, roles, verification level                      |
| Change user status                | `PATCH /users/:id` (status)                       | `PENDING`/`ACTIVE`/`SUSPENDED`                                |
| Assign role                       | `PATCH /users/:id/roles`                          | Add/remove Role ObjectIds                                     |
| Delete user                       | `DELETE /users/:id`                               | Soft delete or hard delete per policy                         |
| **Companies**                     |                                                   |                                                               |
| Approve company                   | `PATCH /companies/:id` (status → `ACTIVE`)        | Sets `isVerified: true`, `verifiedAt: now`                    |
| Suspend company                   | `PATCH /companies/:id` (status → `SUSPENDED`)     | Sets `rejectionReason`                                        |
| Edit company                      | `PATCH /companies/:id`                            | Admin can edit any field                                      |
| Delete company                    | `DELETE /companies/:id`                           | Cascades: retire vehicles, cancel pending bookings            |
| **Vehicles**                      |                                                   |                                                               |
| Approve vehicle                   | `PATCH /vehicles/:id` (status → `AVAILABLE`)      | Vehicle: `PENDING_APPROVAL` → `AVAILABLE`; sets `verifiedAt`  |
| Reject/flag vehicle               | `PATCH /vehicles/:id` (status → `RETIRED`)        | Vehicle removed from listings                                 |
| Admin hold                        | `POST /availability` (source: `ADMIN`, reason: `ADMIN_HOLD`) | Blocks vehicle pending investigation              |
| **Bookings**                      |                                                   |                                                               |
| View all bookings                 | `GET /bookings?page=&status=&dateRange=`           | Platform-wide                                                 |
| Force cancel booking              | `PATCH /bookings/:id/cancel`                      | Admin override; triggers refund flow                          |
| **Disputes**                      |                                                   |                                                               |
| View dispute queue                | `GET /disputes?status=OPEN,UNDER_REVIEW&sort=-createdAt` | Newest first for triage                               |
| Take dispute under review         | `PATCH /disputes/:id` (status → `UNDER_REVIEW`)  | Admin claims the case                                         |
| Request response from party       | `PATCH /disputes/:id` (status → `AWAITING_RESPONSE`) | Notifies respondent                                       |
| Resolve dispute                   | `PATCH /disputes/:id/resolve`                     | Sets `adminResolution.*` (actionTaken, notes, resolvedBy)     |
| Close dispute                     | `PATCH /disputes/:id` (status → `CLOSED`)         | Terminal state                                                |
| Add internal note                 | `POST /disputes/:id/notes`                        | Admin-authored note                                           |
| **Financial**                     |                                                   |                                                               |
| View all transactions             | `GET /transactions?page=&type=&status=`            | Full ledger                                                   |
| Process payout                    | `PATCH /payouts/:id` (status → `PROCESSING`/`PAID`) | Sets `processedAt` or `paidAt`                             |
| Reject payout                     | `PATCH /payouts/:id` (status → `FAILED`)          | Sets `failureReason`                                          |
| Cancel payout                     | `PATCH /payouts/:id` (status → `CANCELLED`)       | Before processing only                                       |
| **Verifications**                 |                                                   |                                                               |
| View verification queue           | `GET /verifications?status=PENDING`                | Queue for manual review                                       |
| Approve verification              | `PATCH /verifications/:id` (status → `APPROVED`)  | Updates User.verificationLevel + sets `verifiedBy`, `verifiedAt` |
| Reject verification               | `PATCH /verifications/:id` (status → `REJECTED`)  | Sets `adminComment`                                           |
| **Roles**                         |                                                   |                                                               |
| List roles                        | `GET /roles`                                       | View all system roles                                         |
| Create role                       | `POST /roles`                                      | Define action/subject/conditions permissions                  |
| Edit role permissions             | `PATCH /roles/:id`                                 | Update permissions array                                      |
| Delete role                       | `DELETE /roles/:id`                                | Only if `isSystemRole === false`                              |

## 4. Business Rules

| Rule                                              | Detail                                                                    |
|----------------------------------------------------|---------------------------------------------------------------------------|
| Admin-only access                                  | All `/sysadmin/*` routes require role with `manage:all` permission        |
| Cannot delete system roles                         | `isSystemRole === true` roles are immutable                               |
| Verification → User level sync                     | Approving a verification must update `User.verificationLevel` accordingly |
| Dispute resolution requires `actionTaken`           | Admin must select one of the 6 actions when resolving                     |
| Payout processing requires all transactions `COMPLETED` | Cannot process payout if any linked transaction is still `PENDING`  |
| Company approval sets `isVerified` + `verifiedAt`   | These fields must be set atomically with status → `ACTIVE`                |
| Admin hold blocks all bookings                      | `ADMIN_HOLD` availability block prevents any new bookings on vehicle     |
| Force-cancel creates refund transaction              | System auto-creates Transaction type `REFUND` when admin force-cancels    |

## 5. Edge Cases

| Scenario                                     | Frontend Handling                                                      |
|----------------------------------------------|------------------------------------------------------------------------|
| Large verification queue (100+ pending)      | Paginate + sort by oldest first; show queue count badge in sidebar     |
| Dispute with no respondent                   | Show "Respondent not identified" — admin can manually assign           |
| Payout references failed transaction         | Show warning icon on payout; prevent processing until resolved         |
| Role permission conflict                     | UI should validate that no contradictory permissions exist              |
| Admin deletes own account                    | Prevent self-deletion; API should reject                               |
| Company with active bookings being suspended | Show confirmation modal with booking count; bookings should NOT be auto-cancelled |
| Vehicle approved but documents expired       | Show warning; auto-revert to `MAINTENANCE` via background job          |
| Dispute on a deleted entity                  | Show "Original [subject] no longer exists" with archived data snapshot |

---

# Cross-Role State Machine Reference

## Booking Lifecycle

```
PENDING ──┬──→ CONFIRMED ──→ ACTIVE ──→ COMPLETED
           │                                 │
           └──→ CANCELLED              DISPUTED ──→ (resolved back to COMPLETED or CLOSED)
```

**Who can trigger each transition:**

| Transition           | Renter | Host/Company | Admin |
|----------------------|--------|-------------|-------|
| → PENDING            | ✅ (create) | —     | —     |
| → CONFIRMED          | —      | ✅           | ✅    |
| → ACTIVE             | —      | ✅           | ✅    |
| → COMPLETED          | —      | ✅           | ✅    |
| → CANCELLED          | ✅ (own) | ✅ (reject) | ✅ (force) |
| → DISPUTED           | ✅ (raise) | ✅ (raise) | ✅  |

## Vehicle Status Lifecycle

```
PENDING_APPROVAL ──→ AVAILABLE ──┬──→ BOOKED
                                  ├──→ MAINTENANCE
                                  └──→ RETIRED
```

## Dispute Lifecycle

```
OPEN ──→ UNDER_REVIEW ──→ AWAITING_RESPONSE ──→ RESOLVED ──→ CLOSED
                     │                                │
                     └────────────────────────────────┘ (can loop between UNDER_REVIEW ↔ AWAITING_RESPONSE)
```

## Payout Lifecycle

```
PENDING ──→ PROCESSING ──→ PAID
        │              └──→ FAILED
        └──→ CANCELLED
```

---

# Shared Frontend Components (Cross-Role)

| Component              | Used by Roles             | Purpose                                             |
|------------------------|---------------------------|-----------------------------------------------------|
| StatusBadge            | All                       | Consistent styling for all status enums              |
| NotificationBell       | All                       | Inbox with unread count, category icons              |
| AvailabilityCalendar   | Host, Company, Admin      | Block/view date ranges per vehicle                   |
| PriceBreakdown         | Renter, Host, Company     | pricePerHour × hours + commission = total            |
| ReviewStars            | All                       | 1–5 star display + input component                   |
| DocumentUploader       | Host, Company, Admin(view)| Upload + status display for fleet documents + verifications |
| DataTable              | All (lists)               | Paginated, sortable, filterable table                |
| ConfirmationModal      | All                       | Destructive action confirmations                     |
| EmptyState             | All                       | Consistent empty state messaging                     |
| FilePreview            | Host, Company, Admin      | Preview uploaded document images/PDFs                |
| TimelineView           | Admin (disputes)          | Chronological event display for dispute notes        |
| WalletCard             | Renter, Host, Company     | Balance display with transaction history link        |

---

# Suggestions & Improvements

## Missing Entities / Fields

| Item                                    | Recommendation                                                                                   | Priority |
|-----------------------------------------|--------------------------------------------------------------------------------------------------|----------|
| ⚠️ `Booking.confirmByTime`             | Add deadline for hosts to confirm; auto-cancel if expired. Prevents bookings stuck in `PENDING`  | HIGH     |
| ⚠️ `Booking.cancelledBy`               | Track who cancelled (renter, host, or admin) for audit trail and display                         | HIGH     |
| ⚠️ `Booking.cancellationReason`        | Capture reason for cancellation; useful for dispute context                                      | MEDIUM   |
| ⚠️ `User.avatarUrl`                    | Missing from User model; needed for all profile displays and review cards                        | HIGH     |
| ⚠️ `Vehicle.averageRating`             | Computed field — either denormalize or compute via aggregation. Required for search ranking       | MEDIUM   |
| ⚠️ `Vehicle.totalTrips`                | Computed field — count of COMPLETED bookings. Useful for trust signals                           | LOW      |
| ⚠️ `Company.averageRating`             | Computed field for company profile and search ranking                                            | MEDIUM   |
| ⚠️ `Payout.minimumAmount`              | Add system-level config for minimum payout threshold                                             | LOW      |
| ⚠️ `Dispute.priority`                  | Model lacks priority field; frontend dispute list extraction has it. Add `LOW/MEDIUM/HIGH/URGENT` | HIGH     |
| ⚠️ `Dispute.title`                     | Model uses `description` only; a short `title` field improves list views                         | MEDIUM   |
| ⚠️ `Dispute.assignedTo`                | Not in model; needed for admin dispatch and queue management                                     | HIGH     |
| ⚠️ `AuditLog` entity                   | No audit trail model exists; needed for User Detail → activity log and compliance                | MEDIUM   |
| ⚠️ Notification broadcast endpoint      | Admin cannot currently send platform-wide notifications; needs a bulk-create endpoint            | LOW      |

## Optimization Opportunities

| Area                                   | Suggestion                                                                    |
|----------------------------------------|-------------------------------------------------------------------------------|
| Vehicle search                         | Use geo-indexed queries with `$nearSphere` for "near me" feature              |
| Availability checks                    | Pre-compute available date ranges per vehicle on a nightly job to speed search |
| Review aggregation                     | Denormalize `averageRating` and `reviewCount` on Vehicle and Company models    |
| Notification inbox                     | Use WebSocket/SSE for real-time notification delivery instead of polling       |
| Payout batching                        | Allow admin to batch-process multiple payouts in one action                    |
| Dashboard KPIs                         | Cache aggregation results (hourly) to avoid expensive full-collection scans   |

## Simplifications

| Area                                          | Current State → Suggested Simplification                                     |
|-----------------------------------------------|------------------------------------------------------------------------------|
| Polymorphic dispute subject                   | Currently 5 subject types — consider limiting to `Booking` + `Transaction` for MVP; others rarely needed |
| Notification channels array                   | Frontend only uses `IN_APP`; other channels are backend concerns. Don't expose channel selection to users |
| FleetDocument types                           | All 6 types may not apply to every region. Consider making the required set configurable |
| Transaction `receiverModel: "System"`         | Platform commission doesn't need a receiver ID — handle with type `COMMISSION` only |

## Potential Technical Risks

| Risk                                          | Impact                                    | Mitigation                                        |
|-----------------------------------------------|-------------------------------------------|---------------------------------------------------|
| Availability overlap race condition           | Two renters book same vehicle simultaneously | Use database-level unique compound index or optimistic locking |
| Unbounded `notes[]` array in Dispute          | Could grow very large on contentious disputes | Paginate notes or set max limit (50)             |
| `Schema.Types.Mixed` for metadata/extractedData | No validation — could store anything      | Add JSON Schema validation on API layer           |
| File URL storage (images, documents)          | URLs could become stale if storage moves  | Use relative paths + CDN prefix config            |
| Wallet balance consistency                    | Concurrent transactions could create race conditions | Use MongoDB transactions for balance mutations |
| Large fleet document scans                    | Background expiry job may slow down       | Ensure compound index on (expiryDate, status) — already exists |
| Password field `select: false`               | Good. But ensure no API endpoint accidentally populates it | Add API-level middleware guard         |
