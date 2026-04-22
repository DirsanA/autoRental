# AutoRental Codebase Guide

This document is a practical map of the current codebase, based on the implementation that exists today in `client/` and `server/`.

It is intended to help you recover project context quickly after a lot of rapid "vibe coding".

It focuses on:

- what the product currently does
- how the frontend and backend are organized
- the main business flows
- which parts are live vs partial vs mostly scaffolded
- the important implementation details and risks to know before continuing development

---

## 1. Executive Summary

AutoRental is a multi-role car rental platform with four major personas:

- renter
- peer host / individual host
- company host
- system admin

At a domain level, the project is designed around:

- user and company onboarding
- identity / license verification
- vehicle listing and moderation
- peer-host promotion flow
- admin management of users, companies, and P2P applicants
- future booking, dispute, transaction, payout, and notification flows

The codebase is currently strongest in these areas:

- authentication and account creation
- verification submission and admin review
- vehicle submission and admin review
- admin user management
- admin company management
- admin P2P / peer-host approval

The codebase is currently weaker or more UI-first in these areas:

- renter dashboard and renter booking flows
- peer-host reviews and booking history
- company operational pages
- admin revenue and dispute pages
- full booking/payment/payout/review/dispute REST APIs

Important reality:

- the data models for a much larger system already exist
- the frontend also has many routes for that larger system
- but only a subset of backend routes are actually mounted and live today

So the project is best understood as:

1. A real implemented moderation/onboarding core
2. Plus a wider planned platform surface that is partially scaffolded

---

## 2. Tech Stack

### Frontend

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI based components under `client/src/components/ui`
- Local client state + fetch-based API calls

### Backend

- Express
- TypeScript
- Mongoose
- MongoDB
- better-auth for auth/session management
- CASL-style role permissions via stored `Role.permissions`
- Zod validation
- Cloudinary for vehicle image/doc uploads

### Shared Platform Patterns

- multi-role access
- REST APIs under `/api`
- better-auth mounted under `/api/auth/*`
- Mongo-backed domain models even for features not fully wired yet

---

## 3. Repository Structure

### Root

- `client/` - Next.js frontend
- `server/` - Express + Mongoose backend
- `server/BACKEND_IMPLEMENTATION_PLAN.md` - broad backend design/reference
- `server/src/models/FRONTEND_EXECUTION_PLAN.md` - broad model-to-frontend reference

### Backend Key Folders

- `server/src/config` - env, DB, auth, constants
- `server/src/models` - Mongoose schemas
- `server/src/routes` - mounted API modules
- `server/src/controllers` - request/response orchestration
- `server/src/services` - business logic
- `server/src/middlewares` - auth, authorization, account type checks, validation, errors
- `server/src/validators` - Zod schemas
- `server/src/utils` - request context, Cloudinary, error helpers

### Frontend Key Folders

- `client/src/app` - Next.js route tree
- `client/src/components` - page components and shared UI
- `client/src/lib` - API clients and session helpers
- `client/src/hooks` - role and session sync helpers

---

## 4. High-Level Architecture

### Backend Request Flow

The backend follows a standard layered pattern:

`route -> middleware -> controller -> service -> model`

In practice:

- routes declare endpoints and attach validation/auth middleware
- controllers are thin and mostly delegate to services
- services contain the real business logic
- models define persistence, enums, and indexes

### Frontend Page Flow

The frontend uses:

- App Router pages as lightweight route wrappers
- page components inside `client/src/components/...`
- dedicated API helpers under `client/src/lib/...`

A common pattern is:

`page.tsx -> page component -> lib API client -> backend endpoint`

However, some areas still use:

- mock data files like `data.ts`
- placeholder dashboards
- UI-only interactions with no backend persistence yet

---

## 5. Current Backend API Surface

The mounted backend APIs are defined in `server/src/routes/index.ts`.

### Currently mounted route groups

- `/api/auth`
- `/api/users`
- `/api/companies`
- `/api/verifications`
- `/api/vehicles`
- `/api/admin/p2p`

### Important consequence

Models exist for:

- bookings
- transactions
- payouts
- reviews
- disputes
- notifications
- availability
- maintenance
- fleet documents

But those are not currently mounted as standalone route modules in `createApiRoutes()`.

So the backend data model is broader than the current live API surface.

---

## 6. Domain Model Overview

These are the most important entities in the codebase.

### User

File: `server/src/models/User.ts`

Main role:

- represents people accounts and admins

Important fields:

- `accountType`: `USER | COMPANY | ADMIN`
- `verificationLevel`: `NONE | ID_VERIFIED | LICENSE_VERIFIED | PEER_HOST`
- `status`: `PENDING | ACTIVE | SUSPENDED`
- `roles`: references `Role`
- `walletBalance`
- `idNumber`
- `idImageUrl`
- `address`
- `lastLogin`

Important interpretation:

- `accountType` describes account category
- `roles` describe permissions and operational roles
- `verificationLevel` tracks trust and host eligibility progression

### Company

File: `server/src/models/Company.ts`

Main role:

- represents a business/enterprise host profile

Important fields:

- `authUserId` - links to the better-auth user account
- company profile fields
- `contactInfo`
- `licenseDocumentUrl`
- `status`
- `isVerified`
- `walletBalance`

### Vehicle

File: `server/src/models/Vehicle.ts`

Main role:

- represents a rentable vehicle

Important fields:

- `ownerId`
- `ownerType`: `User | Company`
- car details
- pricing
- uploaded media and ownership/insurance docs
- `status`: `AVAILABLE | BOOKED | MAINTENANCE | RETIRED | PENDING_APPROVAL`
- admin review metadata

Important interpretation:

- vehicles are polymorphic: they can belong to either an individual user or a company

### Verification

File: `server/src/models/Verification.ts`

Main role:

- stores identity / license / business verification submissions

Important fields:

- `userId`
- optional `companyId`
- `documentType`
- `documentFrontUrl`
- `documentBackUrl`
- `extractedData`
- `status`
- admin review fields

### Booking

File: `server/src/models/Booking.ts`

Main role:

- future booking core record

Important fields:

- `renterId`
- `vehicleId`
- `priceSnapshot`
- `startTime`
- `endTime`
- `withDriver`
- `status`
- `collateralDetails`

Important note:

- model exists and admin detail pages aggregate from it
- but booking REST modules are not currently mounted

### Transaction

File: `server/src/models/Transaction.ts`

Main role:

- future financial ledger / payment records

Important fields:

- `bookingId`
- `payerId`
- polymorphic `receiverId` + `receiverModel`
- `amount`
- `currency`
- `type`
- `status`

### Dispute

File: `server/src/models/Dispute.ts`

Main role:

- future dispute resolution object

Important fields:

- polymorphic subject
- `raisedBy`
- `respondentId`
- `issueCategory`
- `status`
- `notes`
- `adminResolution`

### Role

File: `server/src/models/Role.ts`

Main role:

- stores permission bundles

Important fields:

- `name`
- `permissions[]`
- `isSystemRole`

Important interpretation:

- permissions are dynamic and later converted into CASL abilities

---

## 7. Authentication and Authorization

### Authentication

Main files:

- `server/src/config/auth.ts`
- `server/src/middlewares/authenticate.ts`
- `server/src/services/auth.service.ts`

How it works:

- better-auth is configured against the same Mongo database
- the server first checks cookie/session auth through better-auth
- if that fails, it falls back to looking up a bearer token in the `session` collection

Important frontend behavior:

- the frontend stores an auth token in local storage via `client/src/lib/auth-token.ts`
- many API calls send both `credentials: "include"` and an `Authorization: Bearer ...` header

So auth is effectively hybrid:

- cookie/session first
- bearer token fallback second

### Authorization

Main files:

- `server/src/middlewares/authorize.ts`
- `server/src/middlewares/requireAccountType.ts`
- `server/src/services/auth.permission.service.ts`

There are two access-control layers:

1. `requireAccountType(...)`
   - used to restrict routes to `USER`, `COMPANY`, or `ADMIN`
   - admin-role users can also pass admin-only routes

2. `authorize(action, subject)`
   - builds CASL-style abilities from stored roles
   - used mostly in admin user/company routes

Important note:

- some routes rely more on account-type gating
- some rely on role permission checks
- a few important routes currently appear under-protected; see the "Current Risks / Gaps" section

---

## 8. Backend Features and Flows

This section describes the main flows that are actually implemented today.

### 8.1 User Registration and Login

Main files:

- `server/src/routes/auth.routes.ts`
- `server/src/services/auth.service.ts`
- `server/src/validators/auth.validator.ts`

Supported flows:

- register user
- register company account
- login user
- login company
- login admin
- logout
- get session
- forgot/reset password

#### User registration flow

1. `POST /api/auth/register`
2. better-auth creates the user
3. backend updates account type to `USER`
4. better-auth requires email verification
5. when the user later verifies email, `databaseHooks.user.update.after` promotes `status` from `PENDING` to `ACTIVE`

#### Company registration flow

1. `POST /api/auth/register/company`
2. create auth user through better-auth
3. set account type to `COMPANY`
4. assign the `company` role
5. create a `Company` document
6. company starts in pending approval state

#### Login flow

1. login endpoint is chosen by portal:
   - `/auth/login/user`
   - `/auth/login/company`
   - `/auth/login/admin`
2. backend checks the expected portal against `User.accountType`
3. better-auth signs in
4. `lastLogin` is updated through `userPersistenceService.markLastLogin`

### 8.2 Verification Flow

Main files:

- `server/src/routes/auth.routes.ts`
- `server/src/routes/verification.routes.ts`
- `server/src/services/verification.service.ts`
- `client/src/components/shared/verification/profile-verification-page.tsx`

Supported verification submission paths:

- renter ID verification
- renter license verification
- peerhost verification submission
- admin review of verification records
- current user can fetch their own verification history

#### Submission endpoints

- `POST /api/auth/upgrade/renter/id`
- `POST /api/auth/upgrade/renter/license`
- `POST /api/auth/upgrade/peerhost`

#### Behavior

- renter ID verification creates `NATIONAL_ID` verification targeting `ID_VERIFIED`
- renter license verification creates `DRIVER_LICENSE` verification targeting `LICENSE_VERIFIED`
- peerhost verification currently also submits a `DRIVER_LICENSE` verification targeting `LICENSE_VERIFIED`

Important implementation detail:

- verification submissions are stored directly with the provided `documentFrontUrl` / `documentBackUrl`
- unlike vehicle assets, verification files are not uploaded to Cloudinary by the backend
- if the frontend sends data URLs, those values can be stored directly in Mongo

#### Admin review behavior

Admin approves or rejects with:

- `PATCH /api/verifications/:id`

On approval:

- verification status becomes `APPROVED`
- `verifiedBy` and `verifiedAt` are set
- the user's `verificationLevel` is upgraded
- the user's `idNumber` is updated from extracted metadata
- the user's `idImageUrl` is set from the verification front image
- the user's `address` is updated if supplied

#### Verification progression

- `NONE`
- `ID_VERIFIED`
- `LICENSE_VERIFIED`
- `PEER_HOST`

`PEER_HOST` is not reached by document approval alone.

It is granted later by the admin P2P approval flow.

### 8.3 Vehicle Submission Flow

Main files:

- `server/src/routes/vehicle.routes.ts`
- `server/src/services/vehicle.service.ts`
- `client/src/components/peer-host/host-onboarding/become-host-page.tsx`
- `client/src/components/peer-host/vehicles/api.ts`

Supported behaviors:

- create vehicle
- list public vehicles
- list current user's/company's vehicles
- get vehicle by ID
- update vehicle status

#### Vehicle creation flow

1. authenticated `USER` or `COMPANY` calls `POST /api/vehicles`
2. service resolves owner:
   - company account -> use company `_id`
   - user account -> use user `_id`
3. user accounts must already be at least:
   - `ID_VERIFIED`
   - or `LICENSE_VERIFIED`
   - or `PEER_HOST`
4. vehicle assets sent as `data:` URLs are uploaded to Cloudinary
5. vehicle is created with status `PENDING_APPROVAL`

Important business rule:

- you do not need to be `PEER_HOST` to upload a vehicle
- you only need qualifying verification
- actual host promotion happens separately through admin review

### 8.4 Company Moderation Flow

Main files:

- `server/src/routes/company.routes.ts`
- `server/src/services/company.service.ts`
- `client/src/components/system-admin/company-management/CompanyManagementPage.tsx`

Supported admin actions:

- list companies
- view company detail
- approve company
- suspend company

Supported company self-service actions:

- fetch own company
- update own company

Flow:

1. company account registers
2. `Company` record starts in `PENDING_APPROVAL`
3. admin approves with `/api/companies/:id/approve`
4. company becomes `ACTIVE`, `isVerified = true`, `verifiedAt` set

### 8.5 Admin User Management Flow

Main files:

- `server/src/routes/user.routes.ts`
- `server/src/services/user.service.ts`
- `client/src/components/system-admin/user-management/*`
- `client/src/components/system-admin/user-detail/*`

Supported admin user actions:

- list users
- filter users
- view user detail
- update user status
- update verification level
- delete user

Important detail:

`UserService.getById()` is one of the richest aggregations in the codebase.

It combines:

- user base profile
- linked company
- verification records
- owned vehicles
- booking metrics
- review metrics
- dispute metrics
- transaction metrics

This is why the admin user detail page knows about models that do not yet have their own route modules.

### 8.6 Admin P2P / Peer-Host Approval Flow

Main files:

- `server/src/routes/p2p.admin.routes.ts`
- `server/src/services/p2p.admin.service.ts`
- `client/src/components/system-admin/p2p-approval/*`
- `client/src/components/system-admin/p2p-detail/*`
- `client/src/components/system-admin/p2p-vehicle-detail/*`

This is one of the most complete and important flows in the project.

#### What it does

It allows the admin to:

- view P2P host applicants
- inspect their identity/license documents
- inspect submitted vehicles
- approve/reject individual vehicles
- approve/reject individual verifications
- promote a user to `PEER_HOST`

#### Readiness logic

The service computes `reviewReadiness` from:

- account status
- verification evidence
- vehicle submission status

Current promotion rule:

- the applicant needs at least one approved ID or driver's license verification
- or an already qualifying user verification level (`ID_VERIFIED`, `LICENSE_VERIFIED`, `PEER_HOST`)
- and at least one vehicle submission
- and the account must be active

If all requirements pass and admin approves:

- user `verificationLevel` becomes `PEER_HOST`
- peerhost role is assigned to the user

This is the real "become host" completion step.

---

## 9. Frontend Architecture and Route Areas

### 9.1 Layout Strategy

Main files:

- `client/src/app/layout.tsx`
- `client/src/app/(dashboard)/layout.tsx`
- `client/src/app/(dashboard)/sysadmin/layout.tsx`
- `client/src/app/(dashboard)/peerhost/layout.tsx`
- `client/src/app/(dashboard)/renter/layout.tsx`
- `client/src/app/(dashboard)/company/layout.tsx`

The frontend uses separate dashboard layouts for each role area.

Important role-specific behavior:

- renter and peerhost layouts use client-side role switching
- the role state is stored locally in `role-store.ts`
- `useSyncUserRoleState()` pulls the real session and syncs local role access

Meaning:

- a normal `USER` can behave as renter or peerhost based on verification/role state
- the UI toggles which dashboard they can access

### 9.2 API Client Pattern

Main files:

- `client/src/lib/auth-api.ts`
- `client/src/lib/admin-users-api.ts`
- `client/src/lib/admin-p2p-api.ts`
- `client/src/lib/admin-companies-api.ts`
- `client/src/components/peer-host/vehicles/api.ts`

Pattern:

- each major area has a small fetch wrapper
- those wrappers normalize backend payloads into frontend-friendly types
- admin areas are the most mature examples of this pattern

---

## 10. Frontend Feature Status by Area

This section is important because the frontend is mixed maturity.

### 10.1 Admin Area - Mostly Live

Strongest frontend areas:

- user management
- user detail
- company management
- company detail
- P2P approval list
- P2P host detail
- P2P vehicle detail

Why these feel more complete:

- they have dedicated API clients
- they hit real backend endpoints
- they perform real moderation actions

Main files:

- `client/src/components/system-admin/user-management/*`
- `client/src/components/system-admin/user-detail/*`
- `client/src/components/system-admin/company-management/*`
- `client/src/components/system-admin/company-detail/*`
- `client/src/components/system-admin/p2p-approval/*`
- `client/src/components/system-admin/p2p-detail/*`
- `client/src/components/system-admin/p2p-vehicle-detail/*`

### 10.2 Verification UI - Live

Main file:

- `client/src/components/shared/verification/profile-verification-page.tsx`

This page is live and wired to backend verification routes.

Behavior:

- renter can choose "with driver" or "self drive"
- with-driver maps to ID verification
- self-drive maps to driver license verification
- peerhost audience also submits license verification
- the page also preloads current verification statuses from `/api/verifications/me`

### 10.3 Peer Host Vehicle Area - Hybrid / Live

Main files:

- `client/src/components/peer-host/host-onboarding/become-host-page.tsx`
- `client/src/components/peer-host/vehicles/api.ts`
- `client/src/components/peer-host/vehicles/vehicles-page.tsx`
- `client/src/components/peer-host/vehicles/vehicle-detail-page.tsx`

What is live:

- onboarding vehicle submission
- fetch my vehicles
- fetch vehicle by ID
- toggle vehicle status/availability

What is still hybrid:

- some UI metrics are derived locally
- some detail page interactions are still optimistic/UI-first

### 10.4 Renter / Shared Booking Area - Mostly Mock or Placeholder

Main files:

- `client/src/components/renter/dashboard/dashboard-page.tsx`
- `client/src/components/shared/bookings/booking-history-page.tsx`
- `client/src/components/shared/bookings/data.ts`

Observed state:

- renter dashboard is clearly placeholder
- booking history currently uses sample data
- booking/review/dispute interaction UI exists, but not against live backend routes

### 10.5 Peer Host Reviews - Mock

Main files:

- `client/src/components/peer-host/reviews/reviews-page.tsx`
- `client/src/components/peer-host/reviews/data.ts`

Observed state:

- review page uses sample reviews, not live backend data

### 10.6 Admin Revenue - Mock

Main files:

- `client/src/components/system-admin/revenue/RevenuePage.tsx`
- `client/src/components/system-admin/revenue/data.ts`

Observed state:

- analytics and transaction list are mock-data driven

### 10.7 Admin Disputes - Mock

Main files:

- `client/src/components/system-admin/dispute-management/*`
- `client/src/components/system-admin/dispute-detail/*`

Observed state:

- dispute list/detail pages are sophisticated UI
- but they run on mock data and local state transitions

### 10.8 Company Portal - Mostly UI-First / Partial

Observed from route tree and component organization:

- company dashboard, bookings, earnings, profile, reviews, fleet management pages exist
- but current backend route surface for company operations is still limited
- so a substantial portion of the company portal is likely still scaffolded or awaiting deeper backend wiring

---

## 11. Important End-to-End Functional Flows

These are the key flows to understand before continuing development.

### Flow A: Renter Signup to Active User

1. frontend submits signup
2. backend creates better-auth user
3. account type becomes `USER`
4. status remains `PENDING`
5. user verifies email
6. better-auth hook activates account to `ACTIVE`

### Flow B: User Gets Verified

1. user opens profile verification page
2. chooses ID or license path
3. frontend sends verification payload
4. backend creates `Verification` with `PENDING`
5. admin reviews and approves/rejects
6. user profile updates:
   - verification level
   - id number
   - id image
   - address if applicable

### Flow C: User Starts Peer-Host Journey

1. user reaches qualifying verification level
2. user submits vehicle through become-host flow
3. vehicle is stored as `PENDING_APPROVAL`
4. admin sees applicant in P2P approval list
5. admin reviews verification documents and vehicle
6. admin promotes user to `PEER_HOST`
7. peerhost role is attached
8. peerhost dashboard access becomes available on frontend

### Flow D: Company Onboarding

1. register company account
2. create company profile + company role
3. company remains pending
4. admin approves company
5. company becomes active and verified

### Flow E: Admin User Investigation

1. admin opens user detail page
2. backend aggregates user + linked company + verification + vehicles + activity metrics
3. admin can inspect verification images and associated data
4. admin can change user status or verification level

---

## 12. What Is Actually "Core" Right Now

If you need to continue development without drowning in the full vision, think of the current core as this:

### Real implemented core

- auth and session handling
- account typing (`USER`, `COMPANY`, `ADMIN`)
- user/company creation
- role assignment
- verification submission
- verification review
- vehicle submission
- vehicle moderation
- peer-host promotion
- admin user/company/P2P management UIs

### Wider but not fully wired platform shell

- booking lifecycle
- payments / transactions
- reviews
- disputes
- notifications
- revenue analytics
- company fleet operations
- renter operational flows

---

## 13. Current Risks, Gaps, and Important Observations

This is not a code review list, but these are important realities to know.

### 13.1 Route Surface Does Not Match Model Surface

There are many models for a larger rental platform, but only a subset of route modules are mounted.

Meaning:

- the schema layer is ahead of the live API layer
- some frontend pages are ahead of the backend

### 13.2 Admin Detail Pages Already Depend on "Future" Models

`UserService.getById()` aggregates bookings, reviews, disputes, transactions, and vehicles.

This means:

- those models are already part of the runtime codebase
- but much of their user-facing CRUD/API story is still incomplete

### 13.3 Verification File Handling Is Not Uniform

Vehicle uploads:

- base64 data URLs are uploaded to Cloudinary

Verification uploads:

- file references are stored directly as provided

This can lead to:

- inconsistent asset storage behavior
- large stored strings if base64 payloads are sent

### 13.4 Some Important Routes Look Under-Protected

Based on the current routing code:

- `server/src/routes/p2p.admin.routes.ts` authenticates users but the admin authorization line is commented out
- `server/src/routes/vehicle.routes.ts` allows `PATCH /:id/status` without auth middleware

These should be treated as high-priority security checks before production use.

### 13.5 Frontend Has Mixed Data Sources

Some screens use real backend data.
Some screens use local sample data.
Some screens are placeholders.

If you continue building features, be careful not to assume:

- "screen exists" means "backend is done"
- "model exists" means "route exists"
- "route exists" means "frontend is using it"

### 13.6 Company Ownership Logic Is Not Fully Symmetric Everywhere

The codebase generally supports both `User` and `Company` vehicle ownership, but some frontend/admin detail aggregations still seem more complete for user-owned data than company-owned operations.

Treat company-host support as partially implemented, not fully closed.

---

## 14. Best Mental Model for Continuing Development

Use the project in these layers:

### Layer 1: Foundation

- auth
- account types
- roles
- base models
- validation
- admin tooling

### Layer 2: Trust and Supply

- verification
- vehicle uploads
- company registration
- peer-host promotion

### Layer 3: Marketplace Operations

- bookings
- disputes
- reviews
- transactions
- payouts

### Layer 4: Analytics and polish

- dashboards
- notifications
- revenue reporting
- advanced moderation UX

If you continue development in order, Layer 3 is the biggest unfinished operational area.

---

## 15. Recommended Reading Order

If you want to rebuild context fast, read in this order:

### Backend first

1. `server/src/routes/index.ts`
2. `server/src/config/auth.ts`
3. `server/src/middlewares/authenticate.ts`
4. `server/src/services/auth.service.ts`
5. `server/src/services/verification.service.ts`
6. `server/src/services/vehicle.service.ts`
7. `server/src/services/company.service.ts`
8. `server/src/services/user.service.ts`
9. `server/src/services/p2p.admin.service.ts`
10. `server/src/models/*.ts` for the domain picture

### Frontend second

1. `client/src/lib/auth-api.ts`
2. `client/src/lib/role-store.ts`
3. `client/src/hooks/use-sync-user-role-state.ts`
4. `client/src/lib/admin-users-api.ts`
5. `client/src/lib/admin-companies-api.ts`
6. `client/src/lib/admin-p2p-api.ts`
7. `client/src/components/shared/verification/profile-verification-page.tsx`
8. `client/src/components/peer-host/host-onboarding/become-host-page.tsx`
9. `client/src/components/system-admin/user-management/*`
10. `client/src/components/system-admin/user-detail/*`
11. `client/src/components/system-admin/company-management/*`
12. `client/src/components/system-admin/p2p-approval/*`
13. `client/src/components/system-admin/p2p-detail/*`

---

## 16. Suggested Next Development Priorities

If the goal is to make the platform more coherent and easier to continue, the best next steps are:

1. Secure the currently under-protected routes.
2. Decide whether verification files should also be uploaded to Cloudinary or another asset store.
3. Finish booking APIs and make renter/peerhost/company booking pages use real data.
4. Replace mock dispute and revenue areas with real backend-backed flows.
5. Standardize which pages are "live", "mock", or "placeholder" and document that status in-code.
6. Add a project-wide README or docs folder that keeps this guide updated as the system evolves.

---

## 17. Bottom Line

This project already has a strong moderation and onboarding backbone:

- accounts
- roles
- verification
- vehicle submission
- company approval
- peer-host promotion
- admin management

The biggest gap is not the lack of domain modeling.

The biggest gap is that the operational marketplace layer is only partially connected end-to-end.

So when continuing development, think:

- the trust/supply side is real
- the booking/finance/dispute side is modeled but only partly wired
- the admin side is the most reliable place to understand the current true system behavior

