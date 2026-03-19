# Company Dashboard Data & Feature Extraction

## 1. Feature: Company Dashboard Shell

Pages:
- `client/src/app/(dashboard)/company/layout.tsx` → `/company/*`
- `client/src/app/(dashboard)/company/page.tsx` → `/company`

Data Used:
- children

Actions:
- navigate via sidebar links

---

## 2. Feature: Fleet Dashboard

Pages:
- `client/src/app/(dashboard)/company/dashboard/page.tsx` → `/company/dashboard`

Data Used:
- activeTab
- revenueData.weekly[].day
- revenueData.weekly[].revenue
- revenueData.weekly[].bookings
- revenueData.monthly[].day
- revenueData.monthly[].revenue
- revenueData.monthly[].bookings
- fleetData[].name
- fleetData[].value
- fleetData[].color
- stats[].icon
- stats[].label
- stats[].value
- stats[].trend
- stats[].color

Actions:
- generate report
- switch revenue view to Week
- switch revenue view to Month

---

## 3. Feature: Fleet Management

Pages:
- `client/src/app/(dashboard)/company/fleetmangment/page.tsx` → `/company/fleetmangment`

Data Used:
- vehicles[].id
- vehicles[].make
- vehicles[].model
- vehicles[].year
- vehicles[].plate
- vehicles[].status
- vehicles[].pricePerDay
- vehicles[].image
- vehicles[].lastMaintenance
- vehicles[].nextMaintenance
- searchTerm

Actions:
- add vehicle
- search vehicles
- open filters
- toggle manual availability
- edit vehicle
- view vehicle docs
- delete vehicle

---

## 4. Feature: Booking Management

Pages:
- `client/src/app/(dashboard)/company/bookings/page.tsx` → `/company/bookings`

Data Used:
- bookings[].id
- bookings[].customerName
- bookings[].vehicleName
- bookings[].startDate
- bookings[].endDate
- bookings[].createdAt
- bookings[].totalAmount
- bookings[].status

Actions:
- search bookings
- filter bookings
- export CSV
- approve booking (pending only)
- reject booking (pending only)
- open booking row menu
- go to previous page
- go to next page

---

## 5. Feature: Earnings & Reports

Pages:
- `client/src/app/(dashboard)/company/earnings/page.tsx` → `/company/earnings`

Data Used:
- monthlyData[].month
- monthlyData[].revenue
- monthlyData[].profit
- vehicleRevenue[].name
- vehicleRevenue[].value

Actions:
- open date range selector
- download Excel

---

## 6. Feature: Ratings & Reviews

Pages:
- `client/src/app/(dashboard)/company/reviews/page.tsx` → `/company/reviews`

Data Used:
- reviews[].name
- reviews[].vehicle
- reviews[].date
- reviews[].rating
- reviews[].comment
- ratingBreakdown[].star
- ratingBreakdown[].percent

Actions:
- search reviews
- sort reviews
- mark review helpful
- respond to review

---

## 7. Feature: Company Profile

Pages:
- `client/src/app/(dashboard)/company/profile/page.tsx` → `/company/profile`

Data Used:
- companyName (input default)
- website (input default)
- emailAddress (input default)
- phoneNumber (input default)
- officeAddress (textarea default)
- legalDocuments[].name
- legalDocuments[].size
- legalDocuments[].date

Actions:
- save changes
- upload company logo
- view legal document
- upload new document

---

## 8. Feature: Entities (JSON Schema)

```json
{
  "RevenuePoint": {
    "day": "string",
    "revenue": "number",
    "bookings": "number"
  },
  "FleetStatusItem": {
    "name": "string",
    "value": "number",
    "color": "string"
  },
  "DashboardStat": {
    "icon": "string",
    "label": "string",
    "value": "string",
    "trend": "string",
    "color": "string"
  },
  "Vehicle": {
    "id": "string",
    "make": "string",
    "model": "string",
    "year": "number",
    "plate": "string",
    "status": "string",
    "pricePerDay": "number",
    "image": "string",
    "lastMaintenance": "string",
    "nextMaintenance": "string"
  },
  "Booking": {
    "id": "string",
    "customerName": "string",
    "vehicleName": "string",
    "startDate": "string",
    "endDate": "string",
    "createdAt": "string",
    "totalAmount": "number",
    "status": "string"
  },
  "MonthlyEarning": {
    "month": "string",
    "revenue": "number",
    "profit": "number"
  },
  "VehicleRevenue": {
    "name": "string",
    "value": "number"
  },
  "Review": {
    "name": "string",
    "vehicle": "string",
    "date": "string",
    "rating": "number",
    "comment": "string"
  },
  "RatingBreakdown": {
    "star": "number",
    "percent": "number"
  },
  "LegalDocument": {
    "name": "string",
    "size": "string",
    "date": "string"
  }
}
```
