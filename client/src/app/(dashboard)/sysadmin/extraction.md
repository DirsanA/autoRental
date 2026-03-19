Feature: System Admin Dashboard

Pages:
- Dashboard page (`/sysadmin/dashboard`)

Data Used:
- KPI cards (static values): Total Revenue, Subscriptions, Sales, Active Now
- Tabs: Overview, Analytics, Reports, Notifications
- Overview chart items: { name, total }
- Analytics cards (static values): Total Clicks, Unique Visitors, Bounce Rate, Avg. Session
- Referrers list items: { name, value }
- Devices list items: { name, value }
- Recent sales list items: { name, email, amount, avatar }

Actions:
- download dashboard report

Feature: Company Management

Pages:
- List page (`/sysadmin/companies`)
- Detail page (`/sysadmin/companies/[companyId]`)

Data Used:
- company.id
- company.name
- company.slug
- company.ownerName
- company.ownerEmail
- company.plan
- company.status
- company.seatsUsed
- company.seatsTotal
- company.createdAt
- company.country
- search
- planFilter
- statusFilter

Actions:
- view company details
- edit company
- suspend company
- reactivate company
- delete company
- add company

Feature: Company Detail

Pages:
- Detail page (`/sysadmin/companies/[companyId]`)

Data Used:
- company.id
- company.name
- company.slug
- company.status
- company.verificationStatus
- company.owner.name
- company.owner.email
- company.owner.phone
- company.contactEmail
- company.contactPhone
- company.address.street
- company.address.city
- company.address.state
- company.address.country
- company.address.zip
- company.registrationDate
- company.totalVehicles
- company.totalBookings
- company.averageRating
- company.totalReviews
- vehicles[].id
- vehicles[].name
- vehicles[].model
- vehicles[].year
- vehicles[].plateNumber
- vehicles[].status
- vehicles[].rentalRate
- vehicles[].mileage
- vehicles[].fuelType
- vehicles[].transmission
- reviews[].id
- reviews[].customerName
- reviews[].rating
- reviews[].comment
- reviews[].date
- reviews[].vehicleName
- reviews[].flagged
- financials.totalBookings
- financials.totalRevenue
- financials.pendingPayments
- financials.completedPayments
- financials.avgBookingValue
- financials.revenueByMonth[].month
- financials.revenueByMonth[].revenue
- financials.revenueByMonth[].bookings
- financials.recentTransactions[].id
- financials.recentTransactions[].date
- financials.recentTransactions[].customerName
- financials.recentTransactions[].vehicleName
- financials.recentTransactions[].amount
- financials.recentTransactions[].status

Actions:
- edit company
- suspend company
- reactivate company
- delete company
- view vehicle details
- suspend vehicle
- delete vehicle
- flag review
- unflag review
- delete review
- back to companies

Feature: Dispute Management

Pages:
- List page (`/sysadmin/disputes`)
- Detail page (`/sysadmin/disputes/[disputeId]`)

Data Used:
- dispute.id
- dispute.caseNumber
- dispute.title
- dispute.category
- dispute.status
- dispute.priority
- dispute.createdAt
- dispute.updatedAt
- dispute.resolvedAt
- dispute.claimant.id
- dispute.claimant.name
- dispute.claimant.email
- dispute.claimant.role
- dispute.claimant.avatarInitials
- dispute.respondent.id
- dispute.respondent.name
- dispute.respondent.email
- dispute.respondent.role
- dispute.respondent.avatarInitials
- dispute.bookingRef
- dispute.amountClaimed
- dispute.currency
- dispute.assignedTo
- dispute.shortDescription
- search
- statusFilter
- categoryFilter
- priorityFilter

Actions:
- view dispute
- assign or reassign
- resolve dispute
- escalate dispute
- close dispute

Feature: Dispute Detail

Pages:
- Detail page (`/sysadmin/disputes/[disputeId]`)

Data Used:
- dispute.id
- dispute.caseNumber
- dispute.title
- dispute.category
- dispute.status
- dispute.priority
- dispute.createdAt
- dispute.updatedAt
- dispute.resolvedAt
- dispute.claimant.id
- dispute.claimant.name
- dispute.claimant.email
- dispute.claimant.role
- dispute.claimant.avatarInitials
- dispute.respondent.id
- dispute.respondent.name
- dispute.respondent.email
- dispute.respondent.role
- dispute.respondent.avatarInitials
- dispute.bookingRef
- dispute.amountClaimed
- dispute.currency
- dispute.assignedTo
- dispute.shortDescription
- messages[].id
- messages[].author
- messages[].authorRole
- messages[].content
- messages[].timestamp
- messages[].isInternal
- timeline[].id
- timeline[].type
- timeline[].description
- timeline[].actor
- timeline[].timestamp

Actions:
- assign case to self
- mark resolved
- escalate case
- close case
- back to disputes

Feature: P2P Approval

Pages:
- List page (`/sysadmin/p2p`)
- Host detail page (`/sysadmin/p2p/[hostId]`)

Data Used:
- listing.id
- listing.ownerName
- listing.ownerEmail
- listing.vehicleTitle
- listing.vehicleType
- listing.location
- listing.dailyRate
- listing.status
- listing.submittedAt
- listing.documentsVerified
- listing.insuranceValid
- search
- statusFilter

Actions:
- view host listing
- approve listing
- reject listing
- flag listing

Feature: P2P Host Detail

Pages:
- Detail page (`/sysadmin/p2p/[hostId]`)

Data Used:
- host.id
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
- listings[].id
- listings[].title
- listings[].category
- listings[].plate
- listings[].dailyRate
- listings[].status
- listings[].totalTrips
- listings[].rating
- earnings[].id
- earnings[].date
- earnings[].amount
- earnings[].listingName
- earnings[].payoutStatus

Actions:
- mark host active
- suspend host
- reject host
- delete host profile
- approve document
- reject document
- view full listing
- force delist vehicle
- back to P2P approvals

Feature: P2P Vehicle Detail

Pages:
- Detail page (`/sysadmin/p2p/vehicles/[vehicleId]`)

Data Used:
- vehicle.id
- vehicle.hostId
- vehicle.title
- vehicle.category
- vehicle.plateNumber
- vehicle.vin
- vehicle.year
- vehicle.make
- vehicle.model
- vehicle.color
- vehicle.mileage
- vehicle.transmission
- vehicle.fuelType
- vehicle.seats
- vehicle.dailyRate
- vehicle.status
- vehicle.images
- vehicle.features
- vehicle.description
- vehicle.insuranceExpiry
- vehicle.lastServiced
- trips[].id
- trips[].renterName
- trips[].startDate
- trips[].endDate
- trips[].amount
- trips[].status
- trips[].rating

Actions:
- edit listing
- approve listing
- suspend listing
- reactivate listing
- view trip details
- back to host details

Feature: Revenue

Pages:
- Revenue page (`/sysadmin/revenue`)

Data Used:
- transaction.id
- transaction.invoice
- transaction.companyName
- transaction.description
- transaction.type
- transaction.status
- transaction.amount
- transaction.date
- monthlyRevenue[].month
- monthlyRevenue[].revenue
- monthlyRevenue[].commissions
- search
- typeFilter
- statusFilter

Actions:
- export CSV
- view invoice
- retry charge

Feature: User Management

Pages:
- List page (`/sysadmin/users`)
- Detail page (`/sysadmin/users/[userId]`)

Data Used:
- user.id
- user.name
- user.username
- user.email
- user.role
- user.status
- user.joined
- search
- roleFilter
- statusFilter

Actions:
- view user details
- edit user
- suspend user
- delete user
- resend invite
- invite user

Feature: User Detail

Pages:
- Detail page (`/sysadmin/users/[userId]`)

Data Used:
- user.id
- user.name
- user.username
- user.email
- user.role
- user.status
- user.joined
- user.lastLogin
- user.department
- user.manager
- activities[].id
- activities[].action
- activities[].module
- activities[].ipAddress
- activities[].timestamp
- securityEvents[].id
- securityEvents[].event
- securityEvents[].status
- securityEvents[].device
- securityEvents[].location
- securityEvents[].timestamp

Actions:
- force auth reset
- mark user active
- mark user inactive
- suspend account
- delete user
- edit profile
- back to user management

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

DashboardReferrerItem:
```json
{
  "name": "string",
  "value": "number"
}
```

DashboardDeviceItem:
```json
{
  "name": "string",
  "value": "number"
}
```

DashboardRecentSale:
```json
{
  "name": "string",
  "email": "string",
  "amount": "string",
  "avatar": "string"
}
```

Company:
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "ownerName": "string",
  "ownerEmail": "string",
  "plan": "string",
  "status": "string",
  "seatsUsed": "number",
  "seatsTotal": "number",
  "createdAt": "string",
  "country": "string"
}
```

CompanyDetail:
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "status": "string",
  "verificationStatus": "string",
  "owner": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "contactEmail": "string",
  "contactPhone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "zip": "string"
  },
  "registrationDate": "string",
  "totalVehicles": "number",
  "totalBookings": "number",
  "averageRating": "number",
  "totalReviews": "number"
}
```

CompanyVehicle:
```json
{
  "id": "string",
  "name": "string",
  "model": "string",
  "year": "number",
  "plateNumber": "string",
  "status": "string",
  "rentalRate": "number",
  "mileage": "number",
  "fuelType": "string",
  "transmission": "string"
}
```

CompanyReview:
```json
{
  "id": "string",
  "customerName": "string",
  "rating": "number",
  "comment": "string",
  "date": "string",
  "vehicleName": "string",
  "flagged": "boolean"
}
```

CompanyFinancials:
```json
{
  "totalBookings": "number",
  "totalRevenue": "number",
  "pendingPayments": "number",
  "completedPayments": "number",
  "avgBookingValue": "number",
  "revenueByMonth": [
    {
      "month": "string",
      "revenue": "number",
      "bookings": "number"
    }
  ],
  "recentTransactions": [
    {
      "id": "string",
      "date": "string",
      "customerName": "string",
      "vehicleName": "string",
      "amount": "number",
      "status": "string"
    }
  ]
}
```

Dispute:
```json
{
  "id": "string",
  "caseNumber": "string",
  "title": "string",
  "category": "string",
  "status": "string",
  "priority": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "resolvedAt": "string",
  "claimant": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "avatarInitials": "string"
  },
  "respondent": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "avatarInitials": "string"
  },
  "bookingRef": "string",
  "amountClaimed": "number",
  "currency": "string",
  "assignedTo": "string",
  "shortDescription": "string"
}
```

DisputeMessage:
```json
{
  "id": "string",
  "author": "string",
  "authorRole": "string",
  "content": "string",
  "timestamp": "string",
  "isInternal": "boolean"
}
```

DisputeEvent:
```json
{
  "id": "string",
  "type": "string",
  "description": "string",
  "actor": "string",
  "timestamp": "string"
}
```

P2PListing:
```json
{
  "id": "string",
  "ownerName": "string",
  "ownerEmail": "string",
  "vehicleTitle": "string",
  "vehicleType": "string",
  "location": "string",
  "dailyRate": "number",
  "status": "string",
  "submittedAt": "string",
  "documentsVerified": "boolean",
  "insuranceValid": "boolean"
}
```

P2PHost:
```json
{
  "id": "string",
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

P2PVerification:
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

P2PHostListing:
```json
{
  "id": "string",
  "title": "string",
  "category": "string",
  "plate": "string",
  "dailyRate": "number",
  "status": "string",
  "totalTrips": "number",
  "rating": "number"
}
```

P2PEarning:
```json
{
  "id": "string",
  "date": "string",
  "amount": "number",
  "listingName": "string",
  "payoutStatus": "string"
}
```

P2PVehicle:
```json
{
  "id": "string",
  "hostId": "string",
  "title": "string",
  "category": "string",
  "plateNumber": "string",
  "vin": "string",
  "year": "number",
  "make": "string",
  "model": "string",
  "color": "string",
  "mileage": "number",
  "transmission": "string",
  "fuelType": "string",
  "seats": "number",
  "dailyRate": "number",
  "status": "string",
  "images": ["string"],
  "features": ["string"],
  "description": "string",
  "insuranceExpiry": "string",
  "lastServiced": "string"
}
```

P2PTrip:
```json
{
  "id": "string",
  "renterName": "string",
  "startDate": "string",
  "endDate": "string",
  "amount": "number",
  "status": "string",
  "rating": "number"
}
```

RevenueTransaction:
```json
{
  "id": "string",
  "invoice": "string",
  "companyName": "string",
  "description": "string",
  "type": "string",
  "status": "string",
  "amount": "number",
  "date": "string"
}
```

MonthlyRevenue:
```json
{
  "month": "string",
  "revenue": "number",
  "commissions": "number"
}
```

User:
```json
{
  "id": "string",
  "name": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "status": "string",
  "joined": "string"
}
```

UserDetail:
```json
{
  "id": "string",
  "name": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "status": "string",
  "joined": "string",
  "lastLogin": "string",
  "department": "string",
  "manager": "string"
}
```

UserActivity:
```json
{
  "id": "string",
  "action": "string",
  "module": "string",
  "ipAddress": "string",
  "timestamp": "string"
}
```

SecurityEvent:
```json
{
  "id": "string",
  "event": "string",
  "status": "string",
  "device": "string",
  "location": "string",
  "timestamp": "string"
}
```
x