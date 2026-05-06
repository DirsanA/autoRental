# PeerHost Dashboard Data & Feature Extraction

## 1. Feature: PeerHost Dashboard Shell

Pages:
- `client/src/app/(dashboard)/peerhost/layout.tsx` → `/peerhost/*`

Data Used:
- children
- activeRole

Actions:
- redirect to renter dashboard when `activeRole !== "peerhost"`
- navigate via sidebar links

---

## 2. Feature: PeerHost Dashboard

Pages:
- `client/src/app/(dashboard)/peerhost/dashboard/page.tsx` → `/peerhost/dashboard`

Data Used:
- overviewData[].name
- overviewData[].total
- analyticsData[].name
- analyticsData[].clicks
- analyticsData[].uniques
- referrers[].name
- referrers[].value
- devices[].name
- devices[].value
- static overview summary card values
- static recent booking name, email, and amount literals

Actions:
- download dashboard data
- switch tab to Overview
- switch tab to Analytics
- switch tab to Reports
- switch tab to Notifications

---

## 3. Feature: PeerHost Vehicles

Pages:
- `client/src/app/(dashboard)/peerhost/vehicles/page.tsx` → `/peerhost/vehicles`
- `client/src/app/(dashboard)/peerhost/vehicles/[id]/page.tsx` → `/peerhost/vehicles/[id]`

Data Used:
- filter
- params.id
- vehicles[].id
- vehicles[].make
- vehicles[].model
- vehicles[].year
- vehicles[].dailyRate
- vehicles[].status
- vehicles[].location
- vehicles[].imageUrl
- vehicles[].ratingAvg
- vehicles[].ratingCount
- vehicle.id
- vehicle.make
- vehicle.model
- vehicle.year
- vehicle.dailyRate
- vehicle.status
- vehicle.location
- vehicle.imageUrl
- vehicle.ratingAvg
- vehicle.ratingCount
- editableRate
- activeImage
- isEditDialogOpen
- showSaveSuccess
- editableDetails.make
- editableDetails.model
- editableDetails.year
- editableDetails.location
- editableDetails.dailyRate
- editableDetails.description
- editableDetails.features[]
- editableDetails.specifications.mileage
- editableDetails.specifications.fuelType
- editableDetails.specifications.transmission
- editableDetails.specifications.seats
- editableDetails.specifications.mpg
- editableDetails.specifications.ac
- editableDetails.specifications.connectivity
- recentTrips[].guest
- recentTrips[].dates
- recentTrips[].amount
- recentTrips[].status

Actions:
- add vehicle
- view vehicle details
- filter vehicles by status via `filter` query param
- add first vehicle
- go back to previous page
- change active gallery image
- open vehicle actions menu
- edit vehicle details
- duplicate vehicle
- remove vehicle
- switch detail tab to Specifications
- switch detail tab to Features
- switch detail tab to Recent Trips
- update vehicle rate
- save vehicle rate
- apply suggested rate preset
- edit availability
- enable maintenance mode
- remove listing
- open edit dialog
- update editable vehicle fields
- add feature
- remove feature
- cancel vehicle edits
- save vehicle changes

---

## 4. Feature: PeerHost Booking History

Pages:
- `client/src/app/(dashboard)/peerhost/booking-history/page.tsx` → `/peerhost/booking-history`

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

## 5. Feature: PeerHost Reviews

Pages:
- `client/src/app/(dashboard)/peerhost/reviews/page.tsx` → `/peerhost/reviews`

Data Used:
- reviews[].id
- reviews[].vehicleName
- reviews[].guestName
- reviews[].rating
- reviews[].comment
- reviews[].createdAt
- distribution[].star
- distribution[].count
- distribution[].percent

Actions:
- no row-level actions in current UI

---

## 6. Feature: PeerHost Become Host

Pages:
- `client/src/app/(dashboard)/peerhost/become-host/page.tsx` → `/peerhost/become-host`

Data Used:
- step
- currentStepIndex
- isSubmitted
- selectedProtection
- formData.make
- formData.model
- formData.year
- formData.vin
- formData.plate
- formData.mileage
- formData.fuel
- formData.transmission
- formData.price
- photos.front
- photos.back
- photos.side
- photos.interior
- photos.front.preview
- photos.front.name
- photos.front.size
- photos.front.type
- photos.back.preview
- photos.back.name
- photos.back.size
- photos.back.type
- photos.side.preview
- photos.side.name
- photos.side.size
- photos.side.type
- photos.interior.preview
- photos.interior.name
- photos.interior.size
- photos.interior.type
- documents.nationalId
- documents.ownership
- documents.insurance
- documents.license
- documents.nationalId.preview
- documents.nationalId.name
- documents.nationalId.size
- documents.nationalId.type
- documents.ownership.preview
- documents.ownership.name
- documents.ownership.size
- documents.ownership.type
- documents.insurance.preview
- documents.insurance.name
- documents.insurance.size
- documents.insurance.type
- documents.license.preview
- documents.license.name
- documents.license.size
- documents.license.type

Actions:
- view submitted application
- request notification
- enter vehicle make
- enter vehicle model
- enter vehicle year
- enter VIN
- enter license plate
- enter mileage
- select fuel type
- select transmission
- upload front photo
- upload rear photo
- upload side photo
- upload interior photo
- replace photo
- remove photo
- upload national ID
- upload ownership document
- upload insurance document
- upload driver license
- preview uploaded document
- remove uploaded document
- select protection plan
- set daily price
- go to previous onboarding step
- go to next onboarding step
- submit host application

---

## 7. Feature: PeerHost Profile Verification

Pages:
- `client/src/app/(dashboard)/peerhost/profile-verification/page.tsx` → `/peerhost/profile-verification`

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

## 8. Feature: Entities (JSON Schema)

```json
{
  "Vehicle": {
    "id": "string",
    "make": "string",
    "model": "string",
    "year": "number",
    "dailyRate": "number",
    "status": "string",
    "location": "string",
    "imageUrl": "string",
    "ratingAvg": "number",
    "ratingCount": "number"
  },
  "VehicleSpecifications": {
    "mileage": "string",
    "fuelType": "string",
    "transmission": "string",
    "seats": "number",
    "mpg": "string",
    "ac": "string",
    "connectivity": "string"
  },
  "EditableVehicleDetails": {
    "make": "string",
    "model": "string",
    "year": "number",
    "location": "string",
    "dailyRate": "number",
    "description": "string",
    "features": "string[]",
    "specifications": "VehicleSpecifications"
  },
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
  "Review": {
    "id": "string",
    "vehicleName": "string",
    "guestName": "string",
    "rating": "number",
    "comment": "string",
    "createdAt": "string"
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
    "name": "string",
    "size": "string",
    "type": "string"
  }
}
```
