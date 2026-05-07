import { Booking } from "../models/Booking.js";
import { Company } from "../models/Company.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Verification } from "../models/Verification.js";
import { startOfMonthUTC, startOfNextMonthUTC } from "../utils/dateRange.js";

type MonthKey = { year: number; month: number };

export type MonthlyExecutiveReport = {
  period: {
    year: number;
    month: number; // 1-12
    startUtc: string;
    endUtcExclusive: string;
  };
  generatedAt: string;
  overview: {
    grossRevenue: number;
    platformCommission: number;
    paidBookings: number;
    totalBookings: number;
    activeBookings: number;
  };
  users: {
    total: number;
    newThisMonth: number;
    active: number;
    suspended: number;
    peerHosts: number;
    newPeerHostsThisMonth: number;
  };
  companies: {
    total: number;
    newThisMonth: number;
    active: number;
    pendingApproval: number;
    suspended: number;
    verified: number;
    newlyVerifiedThisMonth: number;
  };
  supply: {
    vehiclesTotal: number;
    vehiclesNewThisMonth: number;
    vehiclesAvailable: number;
    vehiclesPendingApproval: number;
    vehiclesSuspended: number;
  };
  trustAndSafety: {
    verificationsSubmittedThisMonth: number;
    verificationsPending: number;
    verificationsApprovedThisMonth: number;
    verificationsRejectedThisMonth: number;
    reportsOpenedThisMonth: number;
    reportsOpenNow: number;
    reportsResolvedThisMonth: number;
  };
};

export class AdminReportsService {
  async getMonthlyExecutiveReport(input: MonthKey): Promise<MonthlyExecutiveReport> {
    const start = startOfMonthUTC(input.year, input.month);
    const endExclusive = startOfNextMonthUTC(input.year, input.month);

    const [
      paidAgg,
      paidBookings,
      totalBookings,
      activeBookings,
      usersTotal,
      usersNew,
      usersActive,
      usersSuspended,
      peerHosts,
      peerHostsNew,
      companiesTotal,
      companiesNew,
      companiesActive,
      companiesPending,
      companiesSuspended,
      companiesVerified,
      companiesNewlyVerified,
      vehiclesTotal,
      vehiclesNew,
      vehiclesAvailable,
      vehiclesPending,
      vehiclesSuspended,
      verificationsSubmitted,
      verificationsPending,
      verificationsApprovedThisMonth,
      verificationsRejectedThisMonth,
      reportsOpenedThisMonth,
      reportsOpenNow,
      reportsResolvedThisMonth,
    ] = await Promise.all([
      Booking.aggregate<{ _id: null; grossRevenue: number; platformCommission: number }>([
        {
          $match: {
            createdAt: { $gte: start, $lt: endExclusive },
            "payment.status": "PAID",
          },
        },
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: "$priceSnapshot.totalAmount" },
            platformCommission: { $sum: "$priceSnapshot.systemCommission" },
          },
        },
      ]),
      Booking.countDocuments({
        createdAt: { $gte: start, $lt: endExclusive },
        "payment.status": "PAID",
      }),
      Booking.countDocuments({ createdAt: { $gte: start, $lt: endExclusive } }),
      Booking.countDocuments({
        createdAt: { $gte: start, $lt: endExclusive },
        status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      }),

      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: start, $lt: endExclusive } }),
      User.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ status: "SUSPENDED" }),
      // Peer host is represented by verificationLevel
      User.countDocuments({ verificationLevel: "PEER_HOST" }),
      User.countDocuments({
        verificationLevel: "PEER_HOST",
        updatedAt: { $gte: start, $lt: endExclusive },
      }),

      Company.countDocuments({}),
      Company.countDocuments({ createdAt: { $gte: start, $lt: endExclusive } }),
      Company.countDocuments({ status: "ACTIVE" }),
      Company.countDocuments({ status: "PENDING_APPROVAL" }),
      Company.countDocuments({ status: "SUSPENDED" }),
      Company.countDocuments({ isVerified: true }),
      Company.countDocuments({ isVerified: true, verifiedAt: { $gte: start, $lt: endExclusive } }),

      Vehicle.countDocuments({}),
      Vehicle.countDocuments({ createdAt: { $gte: start, $lt: endExclusive } }),
      Vehicle.countDocuments({ status: "AVAILABLE" }),
      Vehicle.countDocuments({ status: "PENDING_APPROVAL" }),
      Vehicle.countDocuments({ status: "SUSPENDED" }),

      Verification.countDocuments({ createdAt: { $gte: start, $lt: endExclusive } }),
      Verification.countDocuments({ status: "PENDING" }),
      Verification.countDocuments({ status: "APPROVED", verifiedAt: { $gte: start, $lt: endExclusive } }),
      Verification.countDocuments({ status: "REJECTED", updatedAt: { $gte: start, $lt: endExclusive } }),

      Report.countDocuments({ createdAt: { $gte: start, $lt: endExclusive } }),
      Report.countDocuments({ status: { $in: ["OPEN", "UNDER_REVIEW"] } }),
      Report.countDocuments({
        status: { $in: ["RESOLVED", "CLOSED"] },
        updatedAt: { $gte: start, $lt: endExclusive },
      }),
    ]);

    const totals = paidAgg?.[0] ?? { grossRevenue: 0, platformCommission: 0 };

    return {
      period: {
        year: input.year,
        month: input.month,
        startUtc: start.toISOString(),
        endUtcExclusive: endExclusive.toISOString(),
      },
      generatedAt: new Date().toISOString(),
      overview: {
        grossRevenue: totals.grossRevenue ?? 0,
        platformCommission: totals.platformCommission ?? 0,
        paidBookings,
        totalBookings,
        activeBookings,
      },
      users: {
        total: usersTotal,
        newThisMonth: usersNew,
        active: usersActive,
        suspended: usersSuspended,
        peerHosts,
        newPeerHostsThisMonth: peerHostsNew,
      },
      companies: {
        total: companiesTotal,
        newThisMonth: companiesNew,
        active: companiesActive,
        pendingApproval: companiesPending,
        suspended: companiesSuspended,
        verified: companiesVerified,
        newlyVerifiedThisMonth: companiesNewlyVerified,
      },
      supply: {
        vehiclesTotal,
        vehiclesNewThisMonth: vehiclesNew,
        vehiclesAvailable,
        vehiclesPendingApproval: vehiclesPending,
        vehiclesSuspended,
      },
      trustAndSafety: {
        verificationsSubmittedThisMonth: verificationsSubmitted,
        verificationsPending,
        verificationsApprovedThisMonth,
        verificationsRejectedThisMonth,
        reportsOpenedThisMonth,
        reportsOpenNow,
        reportsResolvedThisMonth,
      },
    };
  }
}

export const adminReportsService = new AdminReportsService();
