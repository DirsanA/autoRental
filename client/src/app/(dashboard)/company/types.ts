export type VehicleStatus = 'available' | 'booked' | 'maintenance';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  status: VehicleStatus;
  image: string;
  pricePerDay: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Booking {
  id: string;
  customerName: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    plate: 'ABC-1234',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop',
    pricePerDay: 89,
    lastMaintenance: '2023-10-15',
    nextMaintenance: '2024-04-15'
  },
  {
    id: '2',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    plate: 'XYZ-9876',
    status: 'booked',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=2096&auto=format&fit=crop',
    pricePerDay: 45,
    lastMaintenance: '2023-11-20',
    nextMaintenance: '2024-05-20'
  },
  {
    id: '3',
    make: 'Ford',
    model: 'Mustang',
    year: 2021,
    plate: 'DEF-5678',
    status: 'maintenance',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42a5?q=80&w=1974&auto=format&fit=crop',
    pricePerDay: 120,
    lastMaintenance: '2023-12-05',
    nextMaintenance: '2024-01-10'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'B001',
    customerName: 'John Smith',
    vehicleName: 'Tesla Model 3',
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    totalAmount: 445,
    status: 'pending',
    createdAt: '2024-03-15'
  },
  {
    id: 'B002',
    customerName: 'Sarah Johnson',
    vehicleName: 'Toyota Camry',
    startDate: '2024-03-18',
    endDate: '2024-03-22',
    totalAmount: 180,
    status: 'approved',
    createdAt: '2024-03-14'
  }
];
