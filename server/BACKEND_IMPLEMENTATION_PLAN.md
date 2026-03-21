# Backend Implementation Plan

> Generated from 14 Mongoose models, `FRONTEND_EXECUTION_PLAN.md`, and `agent.md`.
> Stack: Express.js · Mongoose · better-auth · nodemailer · helmet · express-rate-limit · Chapa

---

## 1. Project Overview

### Backend Responsibilities

- User authentication and session management (better-auth)
- Role-based access control with dynamic CASL permissions
- Vehicle listing lifecycle (creation → approval → availability → retirement)
- Booking lifecycle (creation → confirmation → active trip → completion/cancellation/dispute)
- Payment processing via Chapa (initialization, verification, webhooks)
- Payout disbursement to hosts (User or Company)
- Availability calendar management with overlap prevention
- Fleet document compliance tracking with expiry-based background jobs
- Maintenance scheduling with automatic availability blocking
- Dispute management with threaded notes and admin resolution workflow
- Review submission and aggregation
- Notification dispatch (in-app, email via nodemailer)
- Verification document review pipeline (ID, license, business license)
- Admin operations: user management, company approval, financial oversight
- Wallet balance management with transactional consistency

### Intentionally Out of Scope (v1)

- Real-time WebSocket/SSE push notifications (use polling initially)
- SMS and push notification channels (IN_APP + EMAIL only for v1)
- Stripe integration (documented as optional fallback)
- OCR/AI extraction for verification documents (store `extractedData` but don't auto-populate)
- Advanced analytics dashboards (defer to Phase 7+)
- Audit log entity (noted as needed but deferred)

### System Goals

1. Secure multi-tenant platform supporting Renter, Individual Host, Company Host, and System Admin roles
2. Financial integrity through immutable transaction records and escrow patterns
3. Availability consistency through database-level overlap prevention
4. Modular, testable codebase following controller → service → model layering

---

## 2. Source Analysis Summary

### What the Models Indicate

- **14 entities** with well-defined schemas, indexes, and TypeScript interfaces
- Polymorphic ownership on Vehicle (`User | Company`), Transaction receiver (`User | Company | System`), Payout owner (`User | Company`), Review target (`Vehicle | Company | User`), Dispute subject (5 models)
- Financial model: `pricePerHour`-based rental with `systemCommission` captured in `priceSnapshot`, separate `Transaction` records per financial event, batched `Payout` disbursement
- RBAC via `Role` model with CASL-compatible `{ action, subject, conditions }` permission structure
- Availability implemented as "blackout blocks" (inverse availability pattern)
- Wallet balances on both `User` and `Company`
- Fleet compliance via `FleetDocument` with status lifecycle and `remindersSent` counter
- Notification system with TTL auto-delete, multi-channel design, and flexible `relatedEntity`

### What the Frontend Execution Plan Adds

- Complete API route expectations for all 4 roles
- Booking state machine with role-based transition permissions
- Business rules: self-drive requires `LICENSE_VERIFIED`, collateral required for non-driver bookings, review gating on `COMPLETED` status
- Several **missing fields** identified: `Booking.confirmByTime`, `Booking.cancelledBy`, `Booking.cancellationReason`, `User.avatarUrl`, `Dispute.priority`, `Dispute.title`, `Dispute.assignedTo`
- Payout minimum threshold needed (system config, not model field)
- Commission rate not stored anywhere — needs system configuration

### What the Mock UI Suggests (Weak References)

- Dashboard KPI cards for each role (aggregation endpoints needed)
- Sidebar navigation with unread notification badges
- Data table patterns with pagination, sorting, filtering

### Contradictions and Missing Information

| Item                                 | Detail                                       | Resolution                                                                |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| Commission rate                      | Not in any model or config                   | Add to system config / environment variable                               |
| `confirmByTime` on Booking           | Frontend plan flags as missing HIGH priority | Add field to Booking model                                                |
| `cancelledBy` / `cancellationReason` | Not in Booking model                         | Add fields for audit trail                                                |
| `User.avatarUrl`                     | Not in User model                            | Add optional field                                                        |
| `Dispute.priority` / `assignedTo`    | Not in Dispute model                         | Add fields for admin workflow                                             |
| Payout minimum threshold             | Not modeled                                  | Add as system config constant                                             |
| File upload strategy                 | URLs stored but no upload mechanism defined  | Use local disk + signed URLs or free cloud storage (Cloudinary free tier) |

---

## 3. Domain and Business Logic Breakdown

### Core Entities

| Entity        | Domain Role                                                     |
| ------------- | --------------------------------------------------------------- |
| User          | Identity, authentication, personal wallet, verification level   |
| Role          | Dynamic RBAC permission sets (CASL)                             |
| Company       | Enterprise host entity, company wallet, verification lifecycle  |
| Vehicle       | Rental asset with polymorphic ownership, geo-location, features |
| Booking       | Rental transaction lifecycle, price snapshot, collateral        |
| Availability  | Vehicle blackout calendar (inverse availability)                |
| FleetDocument | Vehicle compliance documents with expiry tracking               |
| Maintenance   | Vehicle service scheduling                                      |
| Transaction   | Immutable financial record per payment event                    |
| Payout        | Batched host earnings disbursement                              |
| Review        | Polymorphic rating/feedback tied to bookings                    |
| Dispute       | Issue resolution workflow with threaded notes                   |
| Verification  | Identity/license/business document review pipeline              |
| Notification  | Multi-channel user notification with TTL                        |

### Relationships

```
User ──1:N──→ Role (via roles[])
User ──1:1──→ Company (via Company.ownerId)
User|Company ──1:N──→ Vehicle (polymorphic via ownerId + ownerType)
Vehicle ──1:N──→ Availability (blackout blocks)
Vehicle ──1:N──→ FleetDocument
Vehicle ──1:N──→ Maintenance
Vehicle ──1:N──→ Booking (via vehicleId)
Booking ──1:N──→ Transaction (via bookingId)
User|Company ──1:N──→ Payout (polymorphic)
Payout ──N:M──→ Transaction (via transactionIds[])
Booking ──1:1──→ Review (per reviewer, unique index)
Booking|etc ──1:N──→ Dispute (polymorphic subject)
User ──1:N──→ Verification
User ──1:N──→ Notification (via recipientId)
```

### Role-Based Behavior

| Role                | Key Capabilities                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Renter**          | Search vehicles, create bookings, pay, review, raise disputes, manage profile/verification                                       |
| **Individual Host** | List vehicles, manage availability/documents/maintenance, confirm/reject/complete bookings, request payouts, respond to disputes |
| **Company Host**    | Same as Individual Host but scoped to Company entity; manage company profile, company wallet, fleet-wide operations              |
| **System Admin**    | Full CRUD on all entities, approve vehicles/companies/verifications, manage disputes, process payouts, manage roles              |

### Important Domain Rules

1. **Immutability**: Transactions and Bookings are never deleted — status flags only
2. **Price snapshot**: `priceSnapshot` on Booking is frozen at creation time — never recalculated
3. **Availability = blackout blocks**: A vehicle is available if NO Availability block overlaps the requested range
4. **Self-drive gating**: `withDriver === false` requires both `vehicle.canSelfDrive === true` AND `user.verificationLevel === "LICENSE_VERIFIED"`
5. **Collateral requirement**: Self-drive bookings require `collateralDetails`
6. **Fleet document compliance**: Vehicle cannot be `AVAILABLE` if any required FleetDocument is `EXPIRED`
7. **Wallet consistency**: All balance mutations must use MongoDB transactions
8. **Commission**: Platform takes `systemCommission` from each booking — stored in `priceSnapshot`
9. **Payout eligibility**: Only `COMPLETED` transactions can be included in a payout batch

### State Machines

**Booking**: `PENDING → CONFIRMED → ACTIVE → COMPLETED` | `PENDING/CONFIRMED → CANCELLED` | `any active → DISPUTED`

**Vehicle**: `PENDING_APPROVAL → AVAILABLE ↔ BOOKED/MAINTENANCE` | `→ RETIRED`

**Dispute**: `OPEN → UNDER_REVIEW ↔ AWAITING_RESPONSE → RESOLVED → CLOSED`

**Payout**: `PENDING → PROCESSING → PAID/FAILED` | `PENDING → CANCELLED`

---

## 4. Backend Architecture Overview

### Layering Approach

```
Request → Middleware (auth, RBAC, validation, rate-limit) → Controller → Service → Model/DB
```

- **Controllers**: Parse request, call service, format response. No business logic.
- **Services**: All business logic, state transitions, cross-entity operations. Unit-testable.
- **Models**: Schema, validation, indexes, transforms. Already defined.
- **Middlewares**: Auth guard, role/permission check, request validation, error handler.
- **Validators**: Zod or Joi schemas for request body/query/params validation.
- **Utils**: Price calculator, ID generator, date helpers.
- **Integrations**: Chapa client, nodemailer transport, file upload handler.

### Recommended Folder Structure

```
src/
├── config/
│   ├── env.ts                  # Environment variables (exists)
│   ├── database.ts             # Mongoose connection
│   ├── auth.ts                 # better-auth configuration
│   ├── email.ts                # nodemailer transport
│   └── constants.ts            # System constants (commission rate, payout min, etc.)
├── models/                     # Mongoose schemas (exists — 14 models)
├── routes/
│   ├── index.ts                # Route aggregator
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── vehicle.routes.ts
│   ├── booking.routes.ts
│   ├── availability.routes.ts
│   ├── fleetDocument.routes.ts
│   ├── maintenance.routes.ts
│   ├── transaction.routes.ts
│   ├── payout.routes.ts
│   ├── review.routes.ts
│   ├── dispute.routes.ts
│   ├── verification.routes.ts
│   ├── notification.routes.ts
│   ├── company.routes.ts
│   └── role.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── vehicle.controller.ts
│   ├── booking.controller.ts
│   ├── availability.controller.ts
│   ├── fleetDocument.controller.ts
│   ├── maintenance.controller.ts
│   ├── transaction.controller.ts
│   ├── payout.controller.ts
│   ├── review.controller.ts
│   ├── dispute.controller.ts
│   ├── verification.controller.ts
│   ├── notification.controller.ts
│   ├── company.controller.ts
│   └── role.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── vehicle.service.ts
│   ├── booking.service.ts
│   ├── availability.service.ts
│   ├── fleetDocument.service.ts
│   ├── maintenance.service.ts
│   ├── transaction.service.ts
│   ├── payout.service.ts
│   ├── review.service.ts
│   ├── dispute.service.ts
│   ├── verification.service.ts
│   ├── notification.service.ts
│   ├── company.service.ts
│   └── role.service.ts
├── middlewares/
│   ├── authenticate.ts         # better-auth session/token check
│   ├── authorize.ts            # CASL permission check
│   ├── validate.ts             # Request validation middleware factory
│   ├── rateLimiter.ts          # express-rate-limit configs
│   └── errorHandler.ts         # Global error handler
├── validators/
│   ├── auth.validator.ts
│   ├── booking.validator.ts
│   ├── vehicle.validator.ts
│   └── ...                     # One per resource
├── utils/
│   ├── pricing.ts              # Price calculation helpers
│   ├── idGenerator.ts          # Human-readable ID generators (BK-XXX)
│   ├── dateHelpers.ts          # Date range overlap checks
│   ├── pagination.ts           # Pagination helper
│   ├── ApiError.ts             # Custom error class
│   └── asyncHandler.ts         # Express async wrapper
├── integrations/
│   ├── chapa.ts                # Chapa payment client
│   └── fileUpload.ts           # File upload handler (multer + storage)
├── jobs/
│   ├── fleetDocumentExpiry.ts  # Background: check expiring documents
│   └── bookingAutoCancel.ts    # Background: auto-cancel unconfirmed bookings
├── types/
│   └── express.d.ts            # Express request type augmentation
├── app.ts                      # Express app setup (exists)
└── server.ts                   # Entry point (exists)
```

---

## 5. Authentication and Authorization Design

### better-auth Integration

- Use **better-auth** for session-based authentication
- Configure with MongoDB adapter (Mongoose)
- Password hashing is handled by better-auth internally
- The existing `User.password` field (with `select: false`) aligns with better-auth's storage pattern

### Auth Flows

| Flow               | Endpoint                         | Notes                                                          |
| ------------------ | -------------------------------- | -------------------------------------------------------------- |
| Sign Up            | `POST /api/auth/sign-up`         | Create User with `status: PENDING`, assign default Renter role |
| Sign In            | `POST /api/auth/sign-in`         | Validate credentials, update `lastLogin`, return session       |
| Sign Out           | `POST /api/auth/sign-out`        | Invalidate session                                             |
| Forgot Password    | `POST /api/auth/forgot-password` | Send reset link via nodemailer                                 |
| Reset Password     | `POST /api/auth/reset-password`  | Token-based password reset                                     |
| Get Session        | `GET /api/auth/session`          | Return current user + roles                                    |
| Email Verification | `POST /api/auth/verify-email`    | Transition `status: PENDING → ACTIVE`                          |

### Route Protection Strategy

```typescript
// 1. Authentication middleware — attached to all /api/* except public routes
app.use("/api", authenticate);

// 2. Authorization middleware — per-route CASL check
router.patch(
  "/vehicles/:id",
  authorize("update", "Vehicle"),
  vehicleController.update,
);
```

### CASL Integration

- On login, load user's `Role.permissions[]` and build CASL `Ability` instance
- Attach ability to `req.ability`
- `authorize(action, subject)` middleware checks `req.ability.can(action, subject)`
- Conditions in permissions enable row-level access (e.g., `{ ownerId: "${user.id}" }`)

---

## 6. API Module Breakdown

### Auth Module

- **Purpose**: User registration, login, logout, password management
- **Routes**: `POST /sign-up`, `POST /sign-in`, `POST /sign-out`, `POST /forgot-password`, `POST /reset-password`, `GET /session`
- **Service**: Create user with hashed password, assign default role, manage sessions
- **Validation**: Email format, password strength (min 8 chars, mixed case + number), phone E.164, name length

### User Module

- **Purpose**: Profile management, user listing (admin), role assignment
- **Routes**: `GET /users/me`, `PATCH /users/me`, `GET /users` (admin), `GET /users/:id` (admin), `PATCH /users/:id` (admin), `PATCH /users/:id/roles` (admin), `DELETE /users/:id` (admin)
- **Service**: Profile updates with field-level validation, role assignment with system role protection, status transitions
- **Response**: Always exclude password; include populated roles

### Vehicle Module

- **Purpose**: Vehicle CRUD, approval workflow, search with geo/availability filtering
- **Routes**: `GET /vehicles` (public search), `GET /vehicles/:id`, `POST /vehicles` (host), `PATCH /vehicles/:id` (host/admin), `GET /vehicles/:id/availability`
- **Service**: Ownership validation, status transitions, geo-query support, availability overlap check via Availability model, fleet document compliance check before `AVAILABLE` status
- **Validation**: Required fields (brand, model, year, plate, category, pricePerHour, pickup/return locations), valid coordinate ranges, positive pricing

### Booking Module

- **Purpose**: Full booking lifecycle management
- **Routes**: `POST /bookings`, `GET /bookings` (filtered by role), `GET /bookings/:id`, `PATCH /bookings/:id/confirm`, `PATCH /bookings/:id/reject`, `PATCH /bookings/:id/activate`, `PATCH /bookings/:id/complete`, `PATCH /bookings/:id/cancel`, `PATCH /bookings/:id/collateral`
- **Service**: Availability overlap check (atomic), price snapshot calculation, state machine enforcement, auto-create Availability block on confirmation, auto-remove on cancellation, collateral verification, late return detection
- **Critical**: Use MongoDB transactions for booking creation + availability block creation

### Transaction Module

- **Purpose**: Financial record keeping, payment initiation
- **Routes**: `POST /bookings/:id/pay`, `GET /transactions` (filtered by role), `GET /transactions/:id`
- **Service**: Create transaction records, interface with Chapa for payment init, handle webhook verification, update transaction status, update wallet balances (within MongoDB transaction)

### Payout Module

- **Purpose**: Host earnings disbursement
- **Routes**: `POST /payouts` (host), `GET /payouts` (filtered by role), `PATCH /payouts/:id` (admin — process/reject/cancel)
- **Service**: Aggregate completed transactions for owner, validate minimum threshold, process via Chapa transfer API, update payout status and wallet balance

### Availability Module

- **Purpose**: Vehicle blackout calendar management
- **Routes**: `POST /availability` (host/admin), `GET /availability?vehicleId=` (public), `DELETE /availability/:id` (host — owner blocks only)
- **Service**: Overlap detection, source-based deletion rules (owners can only delete `OWNER` blocks), system blocks are managed internally

### Fleet Document Module

- **Purpose**: Vehicle compliance document management
- **Routes**: `POST /fleet-documents`, `GET /fleet-documents?vehicleId=`, `PATCH /fleet-documents/:id`, `DELETE /fleet-documents/:id`
- **Service**: Document upload, status lifecycle, expiry checking, reminder counter increment

### Maintenance Module

- **Purpose**: Vehicle service scheduling
- **Routes**: `POST /maintenance`, `GET /maintenance?vehicleId=`, `PATCH /maintenance/:id`
- **Service**: Create maintenance record + auto-create Availability block (reason: `MAINTENANCE`, source: `SYSTEM`), status transitions, auto-remove availability block on cancellation

### Review Module

- **Purpose**: Post-booking ratings and feedback
- **Routes**: `POST /bookings/:id/review`, `GET /reviews?targetId=&targetType=`, `GET /reviews/:id`, `DELETE /reviews/:id` (admin)
- **Service**: Validate booking is `COMPLETED`, enforce one review per booking/reviewer (unique index), validate target matches booking context

### Dispute Module

- **Purpose**: Issue resolution workflow
- **Routes**: `POST /disputes`, `GET /disputes` (filtered by role), `GET /disputes/:id`, `PATCH /disputes/:id` (admin — status transitions), `PATCH /disputes/:id/resolve` (admin), `POST /disputes/:id/notes`
- **Service**: Create dispute, optionally transition booking to `DISPUTED`, append-only notes, admin resolution with `actionTaken`, trigger refund transactions on `FULL_REFUND` / `PARTIAL_REFUND`

### Verification Module

- **Purpose**: Identity/license document review pipeline
- **Routes**: `POST /verifications`, `GET /verifications` (admin queue), `GET /verifications/:id`, `PATCH /verifications/:id` (admin — approve/reject)
- **Service**: Create verification record, on approval update `User.verificationLevel` accordingly (`NATIONAL_ID/PASSPORT → ID_VERIFIED`, `DRIVER_LICENSE → LICENSE_VERIFIED`), set `verifiedBy` and `verifiedAt`

### Notification Module

- **Purpose**: In-app notification delivery
- **Routes**: `GET /notifications` (self), `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- **Service**: Create notifications (called internally by other services), mark read, bulk mark read, TTL handled by MongoDB index

### Company Module

- **Purpose**: Company profile management, admin approval
- **Routes**: `POST /companies`, `GET /companies/:id`, `PATCH /companies/:id`, `GET /companies` (admin), `DELETE /companies/:id` (admin)
- **Service**: Create company linked to user, profile updates, admin approval (set `isVerified`, `verifiedAt`, `status: ACTIVE`), suspension with reason

### Role Module

- **Purpose**: RBAC role management (admin)
- **Routes**: `GET /roles`, `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id`
- **Service**: CRUD with system role protection (`isSystemRole === true` cannot be deleted)

---

## 7. Payments Design

### Chapa Flow

1. **Initialization**: Client requests `POST /bookings/:id/pay` → server creates Transaction (`PENDING`), calls Chapa Initialize API with amount, currency (ETB), callback URL, return URL
2. **Redirect**: Server returns Chapa checkout URL → client redirects user
3. **Callback/Webhook**: Chapa sends webhook to `POST /api/webhooks/chapa` → server verifies signature, calls Chapa Verify API, updates Transaction status (`COMPLETED` or `FAILED`)
4. **Return URL**: User redirected back to booking detail page; frontend polls or checks transaction status

### Transaction State Handling

```
Payment initiated → Transaction: PENDING
Chapa confirms    → Transaction: HELD_IN_ESCROW (payment received, trip not complete)
Trip completes    → Transaction: COMPLETED (funds available for payout)
Payment fails     → Transaction: FAILED
Refund issued     → New Transaction: type REFUND, status COMPLETED → Original: REFUNDED
```

### Commission Handling

- On booking creation, calculate: `totalAmount = pricePerHour × hours`; `systemCommission = totalAmount × COMMISSION_RATE`
- Store in `priceSnapshot`
- On trip completion, create two logical transactions:
  - `RENTAL_FEE` (total to platform)
  - `COMMISSION` (platform's cut — receiver: System)
- Host receives `totalAmount - systemCommission` when payout is processed

### Payout Processing

1. Host requests payout → service aggregates `COMPLETED` transactions not yet in a payout
2. Validates: sum ≥ minimum threshold, all transactions are `COMPLETED`
3. Creates Payout record (`PENDING`)
4. Admin reviews → processes via Chapa Transfer API or manual
5. On success: `PAID`, deduct from owner's `walletBalance`; on failure: `FAILED` with reason

### Optional Stripe Fallback

- Stripe is **optional** and only relevant if accepting international payments
- If implemented: separate Stripe integration module mirroring Chapa interface
- Decision: Defer Stripe to Phase 7+ unless explicit requirement surfaces

---

## 8. Email and Notification Design

### nodemailer Usage

- Configure SMTP transport (Gmail free tier with app passwords, or Mailtrap for dev)
- Centralized `EmailService` with template-based sending

### Notification Categories and Triggers

| Category         | Trigger Points                                                        | Priority |
| ---------------- | --------------------------------------------------------------------- | -------- |
| `BOOKING_UPDATE` | Booking created, confirmed, rejected, activated, completed, cancelled | HIGH     |
| `PAYMENT`        | Payment received, failed, refund issued                               | HIGH     |
| `VERIFICATION`   | Verification submitted, approved, rejected                            | MEDIUM   |
| `SYSTEM_ALERT`   | Account suspended, platform announcements                             | URGENT   |
| `DISPUTE`        | Dispute opened, status changed, resolved                              | HIGH     |
| `MAINTENANCE`    | Maintenance scheduled, completed                                      | LOW      |
| `REVIEW`         | New review received                                                   | LOW      |
| `ACCOUNT`        | Profile updated, password changed, role changed                       | MEDIUM   |
| `PROMOTION`      | Promotional offers (future)                                           | LOW      |

### Template Strategy

- Store email templates as HTML string templates in `src/templates/emails/`
- Use simple string interpolation (no template engine needed for v1)
- Templates: welcome, booking-confirmation, payment-receipt, verification-status, dispute-update, payout-processed

### Error Handling

- Email sending is fire-and-forget — log failures but do not block the primary operation
- Retry strategy: simple retry (1 attempt) on transient SMTP errors
- Queue-based email sending deferred to later phase

---

## 9. Security and Abuse Protection

### Helmet

```typescript
app.use(helmet()); // Sets secure HTTP headers
```

### Rate Limiting

| Route Group                  | Limit        | Window     |
| ---------------------------- | ------------ | ---------- |
| `POST /auth/sign-in`         | 5 requests   | 15 minutes |
| `POST /auth/sign-up`         | 3 requests   | 1 hour     |
| `POST /auth/forgot-password` | 3 requests   | 1 hour     |
| `POST /bookings`             | 10 requests  | 1 hour     |
| `POST /disputes`             | 5 requests   | 1 hour     |
| General API                  | 100 requests | 15 minutes |

### Input Validation

- All request bodies validated via Zod schemas before reaching controllers
- Mongoose schema validation as second layer of defense
- Sanitize string inputs: trim whitespace, escape HTML entities

### Auth Hardening

- Password field: `select: false` in schema + deleted in `toJSON` transform
- Session tokens: HTTP-only, secure, SameSite cookies
- CORS: Restrict to known frontend origins
- No sensitive data in error messages

### Access Control

- All mutations require ownership check or admin role
- Polymorphic queries scoped by authenticated user's ID and role
- System roles cannot be deleted or modified

### Error Handling

- Never expose stack traces in production
- Never expose internal field names or database errors to client

---

## 10. Data Validation and Error Handling

### Validation Strategy

- **Layer 1**: Zod schemas at route level (request body, query params, path params)
- **Layer 2**: Mongoose schema validators (type, enum, min, max, required)
- **Layer 3**: Service-level business rule validation (state machine, ownership, date logic)

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      { "field": "startTime", "message": "Start time must be in the future" }
    ]
  }
}
```

### Common Error Classes

| Code               | HTTP | Usage                                                               |
| ------------------ | ---- | ------------------------------------------------------------------- |
| `VALIDATION_ERROR` | 400  | Invalid request data                                                |
| `UNAUTHORIZED`     | 401  | Missing or invalid auth                                             |
| `FORBIDDEN`        | 403  | Insufficient permissions                                            |
| `NOT_FOUND`        | 404  | Resource does not exist                                             |
| `CONFLICT`         | 409  | Duplicate booking, availability overlap, duplicate review           |
| `UNPROCESSABLE`    | 422  | Business rule violation (wrong state transition, expired documents) |
| `RATE_LIMITED`     | 429  | Too many requests                                                   |
| `INTERNAL_ERROR`   | 500  | Unexpected server error                                             |

---

## 11. API Route Map

### Auth — `/api/auth`

| Method | Path               | Purpose                   | Auth |
| ------ | ------------------ | ------------------------- | ---- |
| POST   | `/sign-up`         | Register new user         | No   |
| POST   | `/sign-in`         | Login                     | No   |
| POST   | `/sign-out`        | Logout                    | Yes  |
| GET    | `/session`         | Get current session       | Yes  |
| POST   | `/forgot-password` | Request password reset    | No   |
| POST   | `/reset-password`  | Reset password with token | No   |
| POST   | `/verify-email`    | Verify email address      | No   |

### Users — `/api/users`

| Method | Path         | Purpose            | Access        |
| ------ | ------------ | ------------------ | ------------- |
| GET    | `/me`        | Get own profile    | Authenticated |
| PATCH  | `/me`        | Update own profile | Authenticated |
| GET    | `/me/wallet` | Get wallet info    | Authenticated |
| GET    | `/`          | List all users     | Admin         |
| GET    | `/:id`       | Get user detail    | Admin         |
| PATCH  | `/:id`       | Update user        | Admin         |
| PATCH  | `/:id/roles` | Assign roles       | Admin         |
| DELETE | `/:id`       | Delete user        | Admin         |

### Vehicles — `/api/vehicles`

| Method | Path                | Purpose                 | Access      |
| ------ | ------------------- | ----------------------- | ----------- |
| GET    | `/`                 | Search/list vehicles    | Public      |
| GET    | `/:id`              | Vehicle detail          | Public      |
| GET    | `/:id/availability` | Get availability blocks | Public      |
| POST   | `/`                 | Create vehicle          | Host        |
| PATCH  | `/:id`              | Update vehicle          | Owner/Admin |

### Bookings — `/api/bookings`

| Method | Path              | Purpose                       | Access            |
| ------ | ----------------- | ----------------------------- | ----------------- |
| POST   | `/`               | Create booking                | Renter            |
| GET    | `/`               | List bookings (role-filtered) | Authenticated     |
| GET    | `/:id`            | Booking detail                | Participant/Admin |
| POST   | `/:id/pay`        | Initiate payment              | Renter            |
| PATCH  | `/:id/confirm`    | Confirm booking               | Host/Admin        |
| PATCH  | `/:id/reject`     | Reject booking                | Host/Admin        |
| PATCH  | `/:id/activate`   | Start trip                    | Host/Admin        |
| PATCH  | `/:id/complete`   | Complete trip                 | Host/Admin        |
| PATCH  | `/:id/cancel`     | Cancel booking                | Renter/Host/Admin |
| PATCH  | `/:id/collateral` | Verify collateral             | Host/Admin        |
| POST   | `/:id/review`     | Submit review                 | Renter            |

### Availability — `/api/availability`

| Method | Path   | Purpose                | Access        |
| ------ | ------ | ---------------------- | ------------- |
| POST   | `/`    | Create block           | Host/Admin    |
| GET    | `/`    | List blocks by vehicle | Authenticated |
| DELETE | `/:id` | Remove owner block     | Owner         |

### Fleet Documents — `/api/fleet-documents`

| Method | Path   | Purpose         | Access      |
| ------ | ------ | --------------- | ----------- |
| POST   | `/`    | Upload document | Host        |
| GET    | `/`    | List by vehicle | Owner/Admin |
| PATCH  | `/:id` | Update document | Owner/Admin |
| DELETE | `/:id` | Delete document | Owner/Admin |

### Maintenance — `/api/maintenance`

| Method | Path   | Purpose              | Access      |
| ------ | ------ | -------------------- | ----------- |
| POST   | `/`    | Schedule maintenance | Host        |
| GET    | `/`    | List by vehicle      | Owner/Admin |
| PATCH  | `/:id` | Update status        | Owner       |

### Transactions — `/api/transactions`

| Method | Path   | Purpose                           | Access            |
| ------ | ------ | --------------------------------- | ----------------- |
| GET    | `/`    | List transactions (role-filtered) | Authenticated     |
| GET    | `/:id` | Transaction detail                | Participant/Admin |

### Payouts — `/api/payouts`

| Method | Path   | Purpose                      | Access      |
| ------ | ------ | ---------------------------- | ----------- |
| POST   | `/`    | Request payout               | Host        |
| GET    | `/`    | List payouts (role-filtered) | Owner/Admin |
| PATCH  | `/:id` | Process/reject/cancel        | Admin       |

### Reviews — `/api/reviews`

| Method | Path   | Purpose                | Access |
| ------ | ------ | ---------------------- | ------ |
| GET    | `/`    | List reviews by target | Public |
| GET    | `/:id` | Review detail          | Public |
| DELETE | `/:id` | Remove review          | Admin  |

### Disputes — `/api/disputes`

| Method | Path           | Purpose                       | Access            |
| ------ | -------------- | ----------------------------- | ----------------- |
| POST   | `/`            | Raise dispute                 | Authenticated     |
| GET    | `/`            | List disputes (role-filtered) | Authenticated     |
| GET    | `/:id`         | Dispute detail                | Participant/Admin |
| PATCH  | `/:id`         | Update status                 | Admin             |
| PATCH  | `/:id/resolve` | Resolve dispute               | Admin             |
| POST   | `/:id/notes`   | Add note                      | Participant/Admin |

### Verifications — `/api/verifications`

| Method | Path   | Purpose             | Access        |
| ------ | ------ | ------------------- | ------------- |
| POST   | `/`    | Submit verification | Authenticated |
| GET    | `/`    | List queue          | Admin         |
| GET    | `/:id` | Verification detail | Owner/Admin   |
| PATCH  | `/:id` | Approve/reject      | Admin         |

### Companies — `/api/companies`

| Method | Path   | Purpose          | Access        |
| ------ | ------ | ---------------- | ------------- |
| POST   | `/`    | Register company | Authenticated |
| GET    | `/:id` | Company detail   | Public        |
| PATCH  | `/:id` | Update company   | Owner/Admin   |
| GET    | `/`    | List companies   | Admin         |
| DELETE | `/:id` | Delete company   | Admin         |

### Roles — `/api/roles`

| Method | Path   | Purpose     | Access |
| ------ | ------ | ----------- | ------ |
| GET    | `/`    | List roles  | Admin  |
| POST   | `/`    | Create role | Admin  |
| PATCH  | `/:id` | Update role | Admin  |
| DELETE | `/:id` | Delete role | Admin  |

### Notifications — `/api/notifications`

| Method | Path        | Purpose                | Access        |
| ------ | ----------- | ---------------------- | ------------- |
| GET    | `/`         | Get user notifications | Authenticated |
| PATCH  | `/:id/read` | Mark as read           | Owner         |
| PATCH  | `/read-all` | Mark all as read       | Authenticated |

### Webhooks — `/api/webhooks`

| Method | Path     | Purpose                | Access                      |
| ------ | -------- | ---------------------- | --------------------------- |
| POST   | `/chapa` | Chapa payment callback | Public (signature verified) |

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goals**: Project scaffolding, database connection, environment config
**Deliverables**:

- Express app with helmet, cors, morgan, express-rate-limit
- MongoDB connection via Mongoose
- Environment config with validation
- Global error handler and async wrapper
- API error class hierarchy
- Pagination utility
- Health check endpoint (exists)

**Dependencies**: None

### Phase 2: Authentication & Authorization (Week 2)

**Goals**: User auth, RBAC
**Deliverables**:

- better-auth integration with MongoDB adapter
- Sign up, sign in, sign out, session endpoints
- Password reset flow with nodemailer
- Email verification flow
- CASL ability builder from Role permissions
- `authenticate` and `authorize` middlewares
- Default system roles seeded: `renter`, `host`, `company_admin`, `system_admin`

**Dependencies**: Phase 1

### Phase 3: Core Domain — Vehicles & Availability (Week 3)

**Goals**: Vehicle CRUD, search, availability
**Deliverables**:

- Vehicle CRUD with ownership validation
- Geo-search with `$nearSphere`
- Availability CRUD with overlap detection
- Vehicle search with availability filtering
- Zod validators for vehicle and availability

**Dependencies**: Phase 2

### Phase 4: Bookings & Reviews (Week 4)

**Goals**: Complete booking lifecycle, reviews
**Deliverables**:

- Booking creation with atomic availability check (MongoDB transaction)
- All booking state transitions with role enforcement
- Price snapshot calculation with commission
- Review creation with booking status gating and uniqueness
- Collateral verification flow

**Dependencies**: Phase 3

### Phase 5: Payments & Payouts (Week 5)

**Goals**: Chapa integration, transaction recording, payout flow
**Deliverables**:

- Chapa integration module (initialize, verify)
- Webhook handler with signature verification
- Transaction creation on payment events
- Wallet balance updates (MongoDB transactions)
- Payout request and admin processing
- Refund transaction creation

**Dependencies**: Phase 4

### Phase 6: Fleet Management & Compliance (Week 6)

**Goals**: Documents, maintenance, verification
**Deliverables**:

- Fleet document CRUD with file upload
- Maintenance CRUD with auto-availability blocking
- User verification document pipeline
- Admin verification queue and approval
- Background job: fleet document expiry scanner

**Dependencies**: Phase 3

### Phase 7: Disputes & Notifications (Week 7)

**Goals**: Dispute workflow, notification system
**Deliverables**:

- Dispute CRUD with polymorphic subjects
- Threaded notes (append-only)
- Admin resolution workflow with action enforcement
- Notification service (create, mark read, bulk read)
- Email notification sending on key events
- Background job: booking auto-cancel for unconfirmed

**Dependencies**: Phase 4, Phase 5

### Phase 8: Admin & Company Features (Week 8)

**Goals**: Admin dashboard APIs, company management
**Deliverables**:

- Company CRUD with approval workflow
- Admin user management (status, roles)
- Admin vehicle approval flow
- Admin payout processing
- Admin dashboard aggregation endpoints (KPIs)
- Role management CRUD with system role protection

**Dependencies**: Phase 2–7

### Phase 9: Hardening & Testing (Week 9-10)

**Goals**: Security, performance, test coverage
**Deliverables**:

- Rate limiting fine-tuning per endpoint
- Input sanitization audit
- Integration tests for all critical flows
- Unit tests for services
- Load testing on booking creation (race condition validation)
- API documentation (Swagger/OpenAPI)

**Dependencies**: All phases

---

## 13. Suggested Project Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   ├── email.ts
│   │   └── constants.ts
│   ├── models/                  # (exists — 14 models + barrel export)
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── integrations/
│   │   ├── chapa.ts
│   │   └── fileUpload.ts
│   ├── jobs/
│   ├── templates/
│   │   └── emails/
│   ├── types/
│   ├── app.ts
│   └── server.ts
├──
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 14. Environment Variables / Secrets Checklist

### App Config

- `PORT` — Server port (default: 5000)
- `NODE_ENV` — `development | staging | production`
- `FRONTEND_URL` — Frontend origin for CORS and email links

### Database

- `DATABASE_URL` — MongoDB connection string

### Auth (better-auth)

- `BETTER_AUTH_SECRET` — Session encryption secret
- `BETTER_AUTH_URL` — Auth server base URL

### Email (nodemailer)

- `SMTP_HOST` — SMTP server host
- `SMTP_PORT` — SMTP server port
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `EMAIL_FROM` — Default sender address

### Payment (Chapa)

- `CHAPA_SECRET_KEY` — Chapa API secret key
- `CHAPA_WEBHOOK_SECRET` — Webhook signature verification secret
- `CHAPA_BASE_URL` — Chapa API base URL (default: `https://api.chapa.co/v1`)

### Payment (Stripe — optional)

- `STRIPE_SECRET_KEY` — Stripe API key (deferred)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook secret (deferred)

### Security

- `RATE_LIMIT_WINDOW_MS` — Rate limit window (default: 900000)
- `RATE_LIMIT_MAX` — Max requests per window (default: 100)

### File Upload

- `UPLOAD_DIR` — Local upload directory
- `MAX_FILE_SIZE` — Max upload size in bytes
- `CLOUDINARY_URL` — Cloudinary URL (optional, for cloud storage)

### System

- `COMMISSION_RATE` — Platform commission percentage (e.g., `0.15` for 15%)
- `PAYOUT_MINIMUM_AMOUNT` — Minimum payout threshold in ETB
- `BOOKING_CONFIRM_DEADLINE_HOURS` — Hours before unconfirmed booking auto-cancels

---

## 15. Feasibility Notes

### Fully Free to Build

- Express.js, Mongoose, helmet, express-rate-limit — all free/open-source
- better-auth — free, open-source
- nodemailer — free with Gmail app passwords or Mailtrap (dev)
- Chapa — free Ethiopian payment gateway (no monthly fees, per-transaction fees only)
- MongoDB Atlas — free tier (512MB, sufficient for development and early production)
- Cloudinary — free tier (25GB bandwidth/month) for image hosting
- All background jobs can use simple `setInterval`/`node-cron` — no paid queue service needed

### Optional (Deferred)

- Stripe integration — requires Stripe account approval, may have country restrictions
- SMS notifications — requires paid SMS gateway (Twilio, Africa's Talking)
- Push notifications — requires Firebase Cloud Messaging setup
- Redis for session storage — free tier available on Upstash, but not needed initially
- Dedicated job queue (Bull/BullMQ) — nice to have but `node-cron` suffices for v1

### External Provider Limits

- **MongoDB Atlas Free Tier**: 512MB storage, shared RAM — sufficient for MVP, upgrade for production
- **Gmail SMTP**: 500 emails/day — sufficient for early stage
- **Cloudinary Free Tier**: 25 credits/month — monitor usage
- **Chapa**: Per-transaction fees only; no upfront cost

### Do Not Over-Engineer

- No microservices — monolith is correct for this team size and stage
- No GraphQL — REST is simpler and sufficient
- No event sourcing — simple status fields with state machine logic
- No Kubernetes — deploy to a single VPS or Railway/Render free tier

---

## 16. Risks, Gaps, and Open Questions

### Missing Model Fields (Action Required)

| Field                | Model   | Priority | Recommendation                                              |
| -------------------- | ------- | -------- | ----------------------------------------------------------- |
| `confirmByTime`      | Booking | HIGH     | Add `Date` field; auto-cancel via background job if expired |
| `cancelledBy`        | Booking | HIGH     | Add `ObjectId` ref to User who cancelled                    |
| `cancellationReason` | Booking | MEDIUM   | Add `String` field                                          |
| `avatarUrl`          | User    | HIGH     | Add optional `String` field                                 |
| `priority`           | Dispute | HIGH     | Add `LOW \| MEDIUM \| HIGH \| URGENT` enum                  |
| `assignedTo`         | Dispute | HIGH     | Add `ObjectId` ref to admin User                            |
| `title`              | Dispute | MEDIUM   | Add short `String` field for list views                     |

### Risky Assumptions

1. **Chapa availability**: Assumed Chapa API is stable and supports transfer/payout. If not, payout becomes manual-only.
2. **File storage**: Plan assumes Cloudinary free tier or local disk. Production may need paid storage.
3. **Email deliverability**: Gmail SMTP may hit rate limits or spam filters at scale.
4. **Commission rate**: Assumed configurable via env var. No model for dynamic/tiered commission.
5. **Currency**: Models default to ETB. Multi-currency support not designed.

### Open Questions

1. What is the platform commission rate? (Need concrete number for `COMMISSION_RATE`)
2. What documents are required per vehicle before it can go `AVAILABLE`? (All 6 FleetDocument types or a subset?)
3. Should booking auto-cancellation deadline be configurable per host?
4. Is there a cancellation fee policy? (Model doesn't support penalty transactions)
5. Should admin be able to broadcast notifications to all users? (Requires bulk-create endpoint)
6. What is the minimum payout threshold in ETB?
7. Should company staff (non-owner) have access to the company dashboard? (Current model: only `ownerId`)
8. File upload: local disk or cloud storage for v1?

---

## 17. Development Rules for AI Agents

1. **Models are the source of truth**. Do not invent fields, enums, or relationships that do not exist in the Mongoose schemas unless explicitly adding a documented missing field.
2. **Do not rely on mock UI data for business logic**. Use the frontend execution plan for API contract expectations only.
3. **Follow the controller → service → model layering**. Controllers must not contain business logic. Services must not import `req` or `res`.
4. **Keep modules isolated**. Each domain module (vehicle, booking, etc.) should have its own route, controller, service, and validator files.
5. **Preserve naming consistency**. Use the exact enum values from models (e.g., `PENDING_APPROVAL`, not `pending_approval` or `PendingApproval`).
6. **Never silently change domain behavior**. If a state transition is not documented in this plan, do not implement it without flagging it.
7. **Use MongoDB transactions** for any operation that mutates multiple documents (booking + availability, payment + wallet balance).
8. **Never delete Transactions or Bookings**. Use status flags only.
9. **Always validate ownership** before allowing mutations on Vehicle, Availability, Maintenance, FleetDocument.
10. **Always check state machine rules** before allowing status transitions. Invalid transitions must return 422.
11. **API responses must follow the standard format**: `{ success: true, data: ... }` or `{ success: false, error: { code, message, details } }`.
12. **Prefer small, composable services**. A booking confirmation service should call availability service, notification service, etc. — not inline everything.
13. **Add comments only where the intent is non-obvious**. Use a single line of roughly 70 to 120 characters that explains the logic, handoff, or purpose of the code without restating the syntax.
14. **Keep validation schemas co-located** with their routes in the validators directory.
15. **All new endpoints must be added to the route map** in this document.
16. **Do not install paid-only npm packages** without explicit approval.
17. **Test critical paths**: booking creation with overlap detection, payment flow, state machine transitions.
