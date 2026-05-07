import { Booking } from "../models/Booking.js";
import { Company } from "../models/Company.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Verification } from "../models/Verification.js";

type WeeklyRevenuePoint = { day: string; revenue: number; bookings: number };

export type AdminDashboardSnapshot = {
  totals: {
    grossRevenue: number;
    platformCommission: number;
    paidBookings: number;
    totalBookings: number;
    activeBookings: number;
  };
  counts: {
    users: number;
    companies: number;
    vehicles: number;
    pendingCompanies: number;
    pendingVehicles: number;
    pendingVerifications: number;
  };
  bookingStatus: Record<string, number>;
  revenueTrend: {
    weekly: WeeklyRevenuePoint[];
  };
};

export class AdminDashboardService {
  async getDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
    const now = new Date();
    const weeklyStart = new Date(now);
    weeklyStart.setHours(0, 0, 0, 0);
    weeklyStart.setDate(weeklyStart.getDate() - 6);

    const [
      userCount,
      companyCount,
      vehicleCount,
      pendingCompanies,
      pendingVehicles,
      pendingVerifications,
      totalBookings,
      activeBookings,
      paidAgg,
      bookingStatusAgg,
      recentPaidBookings,
    ] = await Promise.all([
      User.countDocuments({}),
      Company.countDocuments({}),
      Vehicle.countDocuments({}),
      Company.countDocuments({ status: "PENDING_APPROVAL" }),
      Vehicle.countDocuments({ status: "PENDING_APPROVAL" }),
      Verification.countDocuments({ status: "PENDING" }),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] } }),
      Booking.aggregate<{ _id: null; grossRevenue: number; platformCommission: number; paidBookings: number }>([
        { $match: { "payment.status": "PAID" } },
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: "$priceSnapshot.totalAmount" },
            platformCommission: { $sum: "$priceSnapshot.systemCommission" },
            paidBookings: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Booking.find({
        "payment.status": "PAID",
        createdAt: { $gte: weeklyStart },
      })
        .select("createdAt priceSnapshot.totalAmount")
        .lean(),
    ]);

    const paidTotals = paidAgg?.[0] ?? {
      grossRevenue: 0,
      platformCommission: 0,
      paidBookings: 0,
    };

    const dailyMap = new Map<string, { revenue: number; bookings: number }>();
    for (const booking of recentPaidBookings) {
      const createdAt = new Date((booking as any).createdAt);
      const key = createdAt.toISOString().slice(0, 10);
      const revenue = (booking as any).priceSnapshot?.totalAmount ?? 0;
      const existing = dailyMap.get(key) ?? { revenue: 0, bookings: 0 };
      existing.revenue += revenue;
      existing.bookings += 1;
      dailyMap.set(key, existing);
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly: WeeklyRevenuePoint[] = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weeklyStart);
      day.setDate(day.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      const stats = dailyMap.get(key) ?? { revenue: 0, bookings: 0 };
      return {
        day: dayNames[day.getDay()] ?? "",
        revenue: stats.revenue,
        bookings: stats.bookings,
      };
    });

    const bookingStatus: Record<string, number> = {};
    for (const entry of bookingStatusAgg) {
      if (entry?._id) bookingStatus[String(entry._id)] = entry.count ?? 0;
    }

    return {
      totals: {
        grossRevenue: paidTotals.grossRevenue ?? 0,
        platformCommission: paidTotals.platformCommission ?? 0,
        paidBookings: paidTotals.paidBookings ?? 0,
        totalBookings,
        activeBookings,
      },
      counts: {
        users: userCount,
        companies: companyCount,
        vehicles: vehicleCount,
        pendingCompanies,
        pendingVehicles,
        pendingVerifications,
      },
      bookingStatus,
      revenueTrend: {
        weekly,
      },
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
