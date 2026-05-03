Feature: Peer Host Dashboard

Pages:

- Dashboard page (`/peerhost/dashboard`)

Data Used:

- KPI cards (static values): Total Earnings ($45,231.89), Active listings (+3), Pending (5), Average Rating (4.9 stars)
- Tabs: Overview, Analytics, Reports, Notifications
- Overview chart data: { name: "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec", total: 4500|3000|2000|4500|5900|2400|1000|4000|2000|4500|5200|1000 }
- Recent bookings list: { name: "Olivia Martin|Jackson Lee|Isabella Nguyen|William Kim|Sofia Davis", email: "olivia.martin@email.com|jackson.lee@email.com|isabella.nguyen@email.com|will@email.com|sofia.davis@email.com", amount: "+$1,999.00|+$39.00|+$299.00|+$99.00|+$39.00", avatar: "/avatars/01.png|/avatars/02.png|/avatars/03.png|/avatars/04.png|/avatars/05.png" }
- Analytics cards: Total Clicks (1,248), Unique Visitors (832), Bounce Rate (42%), Avg. Session (3m 24s)
- Referrers list: { name: "Direct|Product Hunt|Twitter|Blog", value: 512|238|174|104 }
- Devices list: { name: "Desktop|Mobile|Tablet", value: 74|22|4 }
- Weekly traffic data: { name: "Mon|Tue|Wed|Thu|Fri|Sat|Sun", clicks: 800|650|900|700|850|500|600, uniques: 600|500|700|550|620|400|450 }

Actions:

- download dashboard report

Feature: Vehicle Management

Pages:

- List page (`/peerhost/vehicles`)
- Detail page (`/peerhost/vehicles/[vehicleId]`)

Data Used:

- vehicle.id: "veh_001"|"veh_002"
- vehicle.make: "Tesla"|"Toyota"
- vehicle.model: "Model 3"|"Corolla"
- vehicle.year: 2023|2021
- vehicle.dailyRate: 85|35
- vehicle.status: "available"|"rented"|"maintenance"
- vehicle.location: "Accra, GH"|"Kumasi, GH"
- vehicle.imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"|"https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&w=1200&q=80"
- vehicle.ratingAvg: 4.8|4.4
- vehicle.ratingCount: 32|18
- filter: "available"|"rented"|"maintenance"
- Vehicle specifications: mileage: "45,000 mi", fuelType: "Gasoline", transmission: "Automatic", seats: 5, mpg: "28 city / 34 hwy", ac: "Dual Zone", connectivity: "Apple CarPlay"
- Vehicle features: ["Bluetooth", "Backup Camera", "Heated Seats", "Lane Assist", "Keyless Entry", "USB Ports", "Sunroof", "Premium Sound"]
- Vehicle description: "Well-maintained vehicle in excellent condition. Perfect for road trips or daily commuting. Features include premium audio, leather seats, and advanced safety systems."

Actions:

- view vehicle details
- edit vehicle
- add vehicle
- delete vehicle

Feature: Vehicle Detail

Pages:

- Detail page (`/peerhost/vehicles/[vehicleId]`)

Data Used:

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

Actions:

- edit listing
- approve listing
- suspend listing
- reactivate listing
- back to vehicles

Feature: Booking History

Pages:

- List page (`/peerhost/booking-history`)

Data Used:

- booking.id
- booking.guestName
- booking.vehicleName
- booking.startDate
- booking.endDate
- booking.amount
- booking.status
- booking.rating
- search
- statusFilter

Actions:

- view booking details
- cancel booking
- contact guest

Feature: Reviews Management

Pages:

- List page (`/peerhost/reviews`)

Data Used:

- review.id: "rev_001"|"rev_002"|"rev_003"
- review.vehicleName: "2023 Tesla Model 3"|"2021 Toyota Corolla"|"2022 BMW X5"
- review.guestName: "Nana R."|"Joan D."|"Michael K."
- review.rating: 5|4|5
- review.comment: "Smooth pickup, super clean car. Host was responsive. Will book again."|"Great value. AC worked well. Only small delay during return inspection."|"Luxury experience. Exactly as listed. Easy handover."
- review.createdAt: "2026-02-20T10:12:00.000Z"|"2026-02-14T16:45:00.000Z"|"2026-02-02T09:05:00.000Z"
- search
- ratingFilter

Actions:

- view review details
- respond to review
- flag review
- delete review

Feature: Profile Verification

Pages:

- Verification page (`/peerhost/profile-verification`)

Data Used:

- verification.identityStatus
- verification.drivingLicenseStatus
- verification.insuranceStatus
- verification.backgroundCheckStatus
- verification.documents[].id
- verification.documents[].title
- verification.documents[].type
- verification.documents[].uploadedAt
- verification.documents[].status
- verification.documents[].fileSize

Actions:

- upload document
- verify document
- reject document
- delete document

Feature: Become Host

Pages:

- Onboarding page (`/peerhost/become-host`)

Data Used:

- HostStep: "car"|"documents"|"protection"|"pricing"|"terms"
- PhotoKey: "front"|"back"|"side"|"interior"
- DocumentKey: "nationalId"|"ownership"|"insurance"|"license"
- UploadedFile: { file: File, preview: string, name: string, size: string }
- host.name
- host.email
- host.phone
- host.address
- host.joinDate
- host.status
- host.rating
- host.reviewCount
- host.totalTrips
- host.totalEarnings

Actions:

- complete onboarding
- submit verification
- add first vehicle
- upload photos
- upload documents

Feature: Entities (JSON)

DashboardKPI:

```json
{
  "label": "string",
  "value": "string"
}
```

DashboardOverviewItem:

```json
{
  "name": "string",
  "total": "number"
}
```

DashboardRecentBooking:

```json
{
  "name": "string",
  "email": "string",
  "amount": "string",
  "avatar": "string"
}
```

AnalyticsData:

```json
{
  "name": "string",
  "clicks": "number",
  "uniques": "number"
}
```

ReferrerItem:

```json
{
  "name": "string",
  "value": "number"
}
```

DeviceItem:

```json
{
  "name": "string",
  "value": "number"
}
```

Vehicle:

```json
{
  "id": "string",
  "make": "string",
  "model": "string",
  "year": "number",
  "dailyRate": "number",
  "status": "available|rented|maintenance",
  "location": "string",
  "imageUrl": "string",
  "ratingAvg": "number",
  "ratingCount": "number"
}
```

VehicleSpecifications:

```json
{
  "mileage": "string",
  "fuelType": "string",
  "transmission": "string",
  "seats": "number",
  "mpg": "string",
  "ac": "string",
  "connectivity": "string"
}
```

EditableVehicleDetails:

```json
{
  "make": "string",
  "model": "string",
  "year": "number",
  "location": "string",
  "dailyRate": "number",
  "description": "string",
  "features": ["string"],
  "specifications": "VehicleSpecifications"
}
```

Booking:

```json
{
  "id": "string",
  "guestName": "string",
  "vehicleName": "string",
  "startDate": "string",
  "endDate": "string",
  "amount": "number",
  "status": "string",
  "rating": "number"
}
```

Review:

```json
{
  "id": "string",
  "vehicleName": "string",
  "guestName": "string",
  "rating": "number",
  "comment": "string",
  "createdAt": "string"
}
```

Verification:

```json
{
  "identityStatus": "string",
  "drivingLicenseStatus": "string",
  "insuranceStatus": "string",
  "backgroundCheckStatus": "string",
  "documents": [
    {
      "id": "string",
      "title": "string",
      "type": "string",
      "uploadedAt": "string",
      "status": "string",
      "fileSize": "string"
    }
  ]
}
```

Host:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "joinDate": "string",
  "status": "string",
  "rating": "number",
  "reviewCount": "number",
  "totalTrips": "number",
  "totalEarnings": "number"
}
```

UploadedFile:

```json
{
  "file": "File",
  "preview": "string",
  "name": "string",
  "size": "string"
}
```

Team:

```json
{
  "name": "string",
  "logo": "React.ElementType",
  "plan": "string"
}
```

Route:

```json
{
  "id": "string",
  "title": "string",
  "icon": "React.ReactNode",
  "link": "string",
  "subs": [
    {
      "title": "string",
      "link": "string",
      "icon": "React.ReactNode"
    }
  ]
}
```
