export type Review = {
  id: string;
  vehicleName: string;
  guestName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string; // ISO date string
};

