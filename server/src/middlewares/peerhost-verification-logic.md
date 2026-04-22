# Peerhost Verification & Promotion Logic Specification

## 1. Overview
This document defines the process of transitioning a standard `RENTER` user to a `PEERHOST` role within the auto-rental platform. This involves a user-initiated application and a manual administrative approval.

## 2. User Roles & Initial State
- **Roles (SYSTEM_ROLES):** `renter`, `peerhost`, `company`, `admin`.
- **Initial State:** 
    - `accountType`: "USER"
    - `roles`: `["renter"]`
    - `verificationLevel`: "NONE"
    - `status`: "PENDING" (until email verification) -> "ACTIVE"

## 3. The Peerhost Application Flow (User Action)
A user becomes a Peerhost candidate by submitting a specific verification payload.

### 3.1 Validation (Server-side)
The system uses `submitPeerhostVerificationSchema` to validate the request:
- **Vehicle Images:**  `front,back,side,interior,gallery'
- **Identity Documents:** `documentFrontUrl` and `documentBackUrl` (Valid URL or app-relative path).
- **License Details:** `licenseNumber` (min 4 chars) and `licenseExpiry` (YYYY-MM-DD).
- **Personal Data:** `dateOfBirth` (YYYY-MM-DD).
- **Peerhost-specific Requirement:** `address` (min 5 chars).

### 3.2 Submission Result
- A `Verification` record is created in the database with `status: "PENDING"`.
- The user's application appears in the Admin P2P Portal for review.

## 4. Administrative Promotion Flow (Admin Action)
Administrators manage the promotion via the P2P Review API.

### 4.1 Review Process
1. **Fetch Applicants:** Admin calls `fetchP2PHosts` to list users with pending applications.
2. **Review Detail:** Admin calls `fetchP2PHostDetail(hostId)` to inspect documents and user metadata.
3. **Submit Decision:** Admin calls the decision endpoint with `adminP2PDecisionSchema`:
    - `status`: "approved" | "rejected"
    - `adminComment`: (Optional string)

### 4.2 Promotion Logic (Approval)
If the admin sets the status to **"approved"**, the server must execute the following state changes:

1. **Update Verification Level:** Set `user.verificationLevel = "PEER_HOST"`.
2. **Grant Role:** Append `"peerhost"` to the `user.roles` array.
3. **Persistence:** Save the updated User object.

### 4.3 Rejection Logic
If the admin sets the status to **"rejected"**:
- The user's `verificationLevel` remains as is.
- The `Verification` record status is updated to `"REJECTED"`.
- The `adminComment` is stored to provide feedback to the user.

## 5. Permission & Access Control
Once promoted, the system grants access based on the following:

### 5.1 RBAC (Role-Based Access Control)
The `authorize` middleware checks for the `peerhost` role. Permissions defined in `seedRoles.ts` are activated:
- **Fleet Management:** `create`, `read`, `update` on `Vehicle`.
- **Operations:** Manage `Availability`, `FleetDocument`, and `Maintenance`.
- **Finance:** `create`, `read`, `update` on `Payout`.

### 5.2 Client-Side Recognition
The `hasPeerHostAccess` logic determines UI visibility:
```typescript
return (
  user.verificationLevel === "PEER_HOST" ||
  user.roles.includes("peerhost")
);
```

## 6. Constraints & Business Rules
- **Unique Identity:** One `licenseNumber` per user.
- **Age Verification:** Logic should ensure `dateOfBirth` meets local legal requirements for hosting.
- **Address Verification:** Required specifically for Peerhosts to facilitate vehicle handovers/insurance compliance.

## 7. API Reference
- **Submit Application:** `POST /api/verifications/peerhost`
- **Admin Decision:** `POST /api/admin/p2p/:hostId/decision`

---
