# Renter Dashboard Data & Feature Extraction

## 1. Feature: Renter Dashboard Shell

Pages:
- `client/src/app/(dashboard)/renter/layout.tsx` → `/renter/*`

Data Used:
- children
- activeRole

Actions:
- redirect to peerhost dashboard when `activeRole !== "renter"`
- navigate via sidebar links

---

## 2. Feature: Renter Dashboard

Pages:
- `client/src/app/(dashboard)/renter/dashboard/page.tsx` → `/renter/dashboard`

Data Used:
- static dashboard heading and description copy
- static quick actions placeholder copy
- static next trip placeholder copy

Actions:
- no clickable dashboard actions in current UI

---

## 3. Feature: Renter Booking History

Pages:
- `client/src/app/(dashboard)/renter/booking-history/page.tsx` → `/renter/booking-history`

Data Used:
- search
- statusFilter
- bookings[].id
- bookings[].vehicleName
- bookings[].guestName
- bookings[].status
- bookings[].startDate
- bookings[].endDate
- bookings[].totalAmount
- bookings[].pickupLocation

Actions:
- search bookings
- filter by All
- filter by Pending
- filter by Confirmed
- filter by Completed
- filter by Cancelled
- filter by Declined

---

## 4. Feature: Renter Profile Verification

Pages:
- `client/src/app/(dashboard)/renter/profile-verification/page.tsx` → `/renter/profile-verification`

Data Used:
- status
- form.fullName
- form.dob
- form.licenseNumber
- form.expiry
- uploadedFiles[].file.name
- uploadedFiles[].file.size
- uploadedFiles[].file.type
- uploadedFiles[].preview
- uploadedFiles[].type

Actions:
- enter full name
- enter date of birth
- enter license expiry
- enter license number
- upload license file
- remove uploaded file
- upload back side
- submit for verification

---

## 5. Feature: Entities (JSON Schema)

```json
{
  "Booking": {
    "id": "string",
    "vehicleName": "string",
    "guestName": "string",
    "status": "string",
    "startDate": "string",
    "endDate": "string",
    "totalAmount": "number",
    "pickupLocation": "string"
  },
  "VerificationSubmission": {
    "status": "string",
    "fullName": "string",
    "dateOfBirth": "string",
    "address": "string",
    "driverLicenseNumber": "string",
    "driverLicenseExpiry": "string",
    "documents": {
      "driverLicenseFront": "string",
      "driverLicenseBack": "string",
      "selfie": "string",
      "proofOfAddress": "string"
    },
    "lastUpdatedAt": "string",
    "rejectionReason": "string"
  },
  "UploadedFile": {
    "file": "string",
    "preview": "string",
    "type": "string"
  }
}
```
