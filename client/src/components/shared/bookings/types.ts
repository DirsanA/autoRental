export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined";

export type BookingReview = {
  rating: number;
  comment: string;
  submittedAt: string;
};

export type Booking = {
  id: string;
  vehicleName: string;
  guestName: string;
  status: BookingStatus;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalAmount: number;
  pickupLocation: string;
  review?: BookingReview;
};
