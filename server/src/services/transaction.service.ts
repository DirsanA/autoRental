import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Company } from "../models/Company.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { walletService } from "./wallet.service.js";
import { ApiError } from "../utils/ApiError.js";
import type { TransactionListQueryInput } from "../validators/transaction.validator.js";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapTransaction(doc: Record<string, any>) {
  const id = doc.id || doc._id?.toString?.() || String(doc._id);
  return {
    id,
    bookingId: doc.bookingId?.toString?.() ?? String(doc.bookingId),
    payerId: doc.payerId?.toString?.() ?? String(doc.payerId),
    receiverId: doc.receiverId ? (doc.receiverId?.toString?.() ?? String(doc.receiverId)) : null,
    receiverModel: doc.receiverModel ?? null,
    amount: doc.amount ?? 0,
    currency: doc.currency ?? "ETB",
    type: doc.type ?? null,
    status: doc.status ?? null,
    paymentGatewayId: doc.paymentGatewayId ?? null,
    invoiceUrl: doc.invoiceUrl ?? null,
    metadata: doc.metadata ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}

function formatUserName(user: Record<string, any> | null | undefined) {
  if (!user) return null;
  return (
    user.name
    || [user.firstName, user.lastName].filter(Boolean).join(" ")
    || user.email
    || null
  );
}

export class TransactionService {
  private getSecurityDepositActions(
    transaction: Record<string, any>,
    booking: Record<string, any> | null,
  ) {
    const canRefundDepositToRenter = Boolean(
      transaction.type === "COLLATERAL_DEPOSIT" &&
        transaction.status === "HELD_IN_ESCROW" &&
        booking?._id &&
        (booking.securityDepositAmount ?? 0) > 0 &&
        ["HELD_IN_ESCROW", "UNDER_REVIEW"].includes(String(booking.depositStatus || "")) &&
        ["COMPLETED", "CANCELLED", "DISPUTED"].includes(String(booking.status || "")),
    );

    const refundIneligibleReason = canRefundDepositToRenter
      ? null
      : transaction.type !== "COLLATERAL_DEPOSIT"
        ? "Only security deposit hold transactions can be refunded to the renter wallet."
        : transaction.status !== "HELD_IN_ESCROW"
          ? "This security deposit has already been settled."
          : !booking?._id
            ? "Booking details could not be resolved for this deposit."
            : (booking.securityDepositAmount ?? 0) <= 0
              ? "This booking does not have a valid held security deposit."
              : !["HELD_IN_ESCROW", "UNDER_REVIEW"].includes(String(booking.depositStatus || ""))
                ? "This booking deposit is not in a refundable state."
                : !["COMPLETED", "CANCELLED", "DISPUTED"].includes(String(booking.status || ""))
                  ? "Security deposits can only be manually refunded after completion, cancellation, or dispute."
                  : "This deposit is not eligible for renter refund.";

    const canReleaseDepositToOwner = Boolean(
      transaction.type === "COLLATERAL_DEPOSIT" &&
        transaction.status === "HELD_IN_ESCROW" &&
        booking?._id &&
        booking.depositStatus === "UNDER_REVIEW" &&
        booking.status === "DISPUTED",
    );

    const releaseIneligibleReason = canReleaseDepositToOwner
      ? null
      : transaction.type !== "COLLATERAL_DEPOSIT"
        ? "Only security deposit hold transactions can be released to the owner."
        : transaction.status !== "HELD_IN_ESCROW"
          ? "This security deposit has already been settled."
          : !booking?._id
            ? "Booking details could not be resolved for this deposit."
            : booking.depositStatus !== "UNDER_REVIEW"
              ? "The booking must be under review before releasing the deposit to the owner."
              : booking.status !== "DISPUTED"
                ? "Only disputed bookings can release a deposit to the owner."
                : "This deposit is not eligible for owner release.";

    return {
      canRefundDepositToRenter,
      refundIneligibleReason,
      canReleaseDepositToOwner,
      releaseIneligibleReason,
    };
  }

  async listAdminTransactions(query: TransactionListQueryInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.receiverModel) filter.receiverModel = query.receiverModel;

    if (query.from || query.to) {
      const createdAt: Record<string, Date> = {};
      if (query.from) createdAt.$gte = new Date(query.from);
      if (query.to) createdAt.$lte = new Date(query.to);
      filter.createdAt = createdAt;
    }

    const q = query.q?.trim();
    if (q) {
      const orFilters: Array<Record<string, unknown>> = [];

      if (mongoose.Types.ObjectId.isValid(q)) {
        orFilters.push({ _id: new mongoose.Types.ObjectId(q) });
        orFilters.push({ bookingId: new mongoose.Types.ObjectId(q) });
        orFilters.push({ payerId: new mongoose.Types.ObjectId(q) });
        orFilters.push({ receiverId: new mongoose.Types.ObjectId(q) });
      }

      const regex = new RegExp(escapeRegExp(q), "i");
      orFilters.push({ paymentGatewayId: regex });
      orFilters.push({ invoiceUrl: regex });
      orFilters.push({ "metadata.bookingId": regex });

      filter.$or = orFilters;
    }

    const [items, total] = await Promise.all([
      Transaction.find(filter as any)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter as any),
    ]);

    return {
      transactions: items.map((doc) => mapTransaction(doc as Record<string, any>)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getAdminTransactionDetail(transactionId: string) {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      throw ApiError.unprocessable("Invalid transaction id");
    }

    const transaction = await Transaction.findById(transactionId).lean();
    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    const booking = transaction.bookingId
      ? await Booking.findById(transaction.bookingId).lean()
      : null;

    const vehicle = booking?.vehicleId
      ? await Vehicle.findById(booking.vehicleId)
          .select("make model year plate ownerId ownerType")
          .lean()
      : null;

    const [renter, ownerUser, ownerCompany, ownerWallet] = await Promise.all([
      booking?.renterId
        ? User.findById(booking.renterId).select("name firstName lastName email").lean()
        : Promise.resolve(null),
      vehicle?.ownerType === "User"
        ? User.findById(vehicle.ownerId).select("name firstName lastName email").lean()
        : Promise.resolve(null),
      vehicle?.ownerType === "Company"
        ? Company.findById(vehicle.ownerId).select("name contactInfo.email").lean()
        : Promise.resolve(null),
      vehicle?.ownerId && vehicle?.ownerType
        ? walletService.getWalletByOwner(
            vehicle.ownerId as mongoose.Types.ObjectId,
            vehicle.ownerType,
          )
        : Promise.resolve(null),
    ]);

    const ownerName =
      vehicle?.ownerType === "Company"
        ? ownerCompany?.name || ownerCompany?.contactInfo?.email || null
        : formatUserName(ownerUser as Record<string, any> | null);

    const canRefundToSystemWallet = Boolean(
      transaction.type === "ESCROW_HOLD"
        && transaction.status === "HELD_IN_ESCROW"
        && booking?._id
        && vehicle?.ownerId
        && (ownerWallet?.pendingBalance ?? 0) >= (transaction.amount ?? 0),
    );

    const securityDepositActions = this.getSecurityDepositActions(transaction, booking);

    const ineligibleReason =
      canRefundToSystemWallet
        ? null
        : transaction.type !== "ESCROW_HOLD"
          ? "Only escrow-hold transactions support refund to the system wallet."
          : transaction.status !== "HELD_IN_ESCROW"
            ? "This escrow transaction has already been settled or refunded."
            : !vehicle?.ownerId
              ? "Owner account could not be resolved for this transaction."
              : (ownerWallet?.pendingBalance ?? 0) < (transaction.amount ?? 0)
                ? "Owner escrow balance is already lower than this transaction amount."
                : "This transaction is not eligible for refund.";

    return {
      transaction: mapTransaction(transaction as Record<string, any>),
      booking: booking
        ? {
            id: booking._id?.toString?.() ?? String(booking._id),
            bookingId: booking.bookingId || null,
            status: booking.status || null,
            paymentStatus: booking.payment?.status || null,
            startTime: booking.startTime?.toISOString?.() ?? null,
            endTime: booking.endTime?.toISOString?.() ?? null,
          }
        : null,
      vehicle: vehicle
        ? {
            id: vehicle._id?.toString?.() ?? String(vehicle._id),
            label: [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" "),
            plate: vehicle.plate || null,
            ownerType: vehicle.ownerType || null,
            ownerName,
          }
        : null,
      renter: renter
        ? {
            id: renter._id?.toString?.() ?? String(renter._id),
            name: formatUserName(renter as Record<string, any>),
            email: renter.email || null,
          }
        : null,
      ownerWallet: ownerWallet
        ? {
            pendingBalance: ownerWallet.pendingBalance ?? 0,
            availableBalance: ownerWallet.availableBalance ?? 0,
            currency: ownerWallet.currency || transaction.currency || "ETB",
          }
        : null,
      actions: {
        canRefundToSystemWallet,
        ineligibleReason,
        canRefundDepositToRenter: securityDepositActions.canRefundDepositToRenter,
        refundDepositIneligibleReason: securityDepositActions.refundIneligibleReason,
        canReleaseDepositToOwner: securityDepositActions.canReleaseDepositToOwner,
        releaseDepositIneligibleReason: securityDepositActions.releaseIneligibleReason,
      },
    };
  }

  async listAdminDepositRefunds(query: TransactionListQueryInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      type: "COLLATERAL_DEPOSIT",
    };

    if (query.status) {
      filter.status = query.status;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter as any)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter as any),
    ]);

    const bookingIds = transactions
      .map((item) => item.bookingId)
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

    const bookings = bookingIds.length
      ? await Booking.find({ _id: { $in: bookingIds } }).lean()
      : [];
    const bookingMap = new Map(bookings.map((booking) => [String(booking._id), booking]));

    const vehicleIds = bookings
      .map((booking) => booking.vehicleId)
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));
    const vehicles = vehicleIds.length
      ? await Vehicle.find({ _id: { $in: vehicleIds } })
          .select("make model year plate ownerId ownerType")
          .lean()
      : [];
    const vehicleMap = new Map(vehicles.map((vehicle) => [String(vehicle._id), vehicle]));

    const renterIds = bookings
      .map((booking) => booking.renterId)
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));
    const ownerUserIds = vehicles
      .filter((vehicle) => vehicle.ownerType === "User" && vehicle.ownerId)
      .map((vehicle) => vehicle.ownerId as mongoose.Types.ObjectId);
    const ownerCompanyIds = vehicles
      .filter((vehicle) => vehicle.ownerType === "Company" && vehicle.ownerId)
      .map((vehicle) => vehicle.ownerId as mongoose.Types.ObjectId);

    const [users, companies] = await Promise.all([
      renterIds.length || ownerUserIds.length
        ? User.find({ _id: { $in: [...renterIds, ...ownerUserIds] } })
            .select("name firstName lastName email")
            .lean()
        : Promise.resolve([]),
      ownerCompanyIds.length
        ? Company.find({ _id: { $in: ownerCompanyIds } })
            .select("name contactInfo.email")
            .lean()
        : Promise.resolve([]),
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const companyMap = new Map(companies.map((company) => [String(company._id), company]));

    const items = transactions.map((transaction) => {
      const booking = transaction.bookingId
        ? bookingMap.get(String(transaction.bookingId))
        : null;
      const vehicle = booking?.vehicleId
        ? vehicleMap.get(String(booking.vehicleId))
        : null;
      const renter = booking?.renterId
        ? userMap.get(String(booking.renterId))
        : null;
      const ownerName =
        vehicle?.ownerType === "Company"
          ? companyMap.get(String(vehicle.ownerId))?.name ||
            companyMap.get(String(vehicle.ownerId))?.contactInfo?.email ||
            null
          : formatUserName(userMap.get(String(vehicle?.ownerId)));
      const securityDepositActions = this.getSecurityDepositActions(transaction, booking || null);

      return {
        transaction: mapTransaction(transaction as Record<string, any>),
        booking: booking
          ? {
              id: String(booking._id),
              bookingId: booking.bookingId || null,
              status: booking.status || null,
              depositStatus: booking.depositStatus || null,
              paymentStatus: booking.payment?.status || null,
              startTime: booking.startTime?.toISOString?.() ?? null,
              endTime: booking.endTime?.toISOString?.() ?? null,
            }
          : null,
        renter: renter
          ? {
              id: String(renter._id),
              name: formatUserName(renter as Record<string, any>),
              email: renter.email || null,
            }
          : null,
        vehicle: vehicle
          ? {
              id: String(vehicle._id),
              label: [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" "),
              plate: vehicle.plate || null,
              ownerType: vehicle.ownerType || null,
              ownerName,
            }
          : null,
        actions: {
          canRefundDepositToRenter: securityDepositActions.canRefundDepositToRenter,
          refundDepositIneligibleReason: securityDepositActions.refundIneligibleReason,
          canReleaseDepositToOwner: securityDepositActions.canReleaseDepositToOwner,
          releaseDepositIneligibleReason: securityDepositActions.releaseIneligibleReason,
        },
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async refundEscrowToSystemWallet(
    transactionId: string,
    input?: { reason?: string; initiatedBy?: string },
  ) {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      throw ApiError.unprocessable("Invalid transaction id");
    }

    return walletService.refundEscrowToSystemWallet({
      sourceTransactionId: transactionId,
      ...(input?.reason ? { reason: input.reason } : {}),
      ...(input?.initiatedBy ? { initiatedBy: input.initiatedBy } : {}),
    });
  }

  async settleHeldSecurityDeposit(
    transactionId: string,
    input: {
      action: "REFUND_TO_RENTER" | "RELEASE_TO_OWNER";
      reason?: string;
      initiatedBy?: string;
    },
  ) {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      throw ApiError.unprocessable("Invalid transaction id");
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    if (transaction.type !== "COLLATERAL_DEPOSIT") {
      throw ApiError.unprocessable("Only held security deposits can be settled here");
    }

    if (transaction.status !== "HELD_IN_ESCROW") {
      throw ApiError.unprocessable("This security deposit has already been settled");
    }

    if (!transaction.bookingId) {
      throw ApiError.unprocessable("Security deposit transaction is missing its booking reference");
    }

    const booking = await Booking.findById(transaction.bookingId);
    if (!booking) {
      throw ApiError.notFound("Booking not found for security deposit transaction");
    }

    if (input.action === "REFUND_TO_RENTER") {
      const securityDepositActions = this.getSecurityDepositActions(transaction.toObject(), booking.toObject());
      if (!securityDepositActions.canRefundDepositToRenter) {
        throw ApiError.unprocessable(
          securityDepositActions.refundIneligibleReason ||
            "This security deposit is not eligible for renter refund",
        );
      }

      await walletService.refundSecurityDepositToRenterWallet(
        booking.id,
        booking.status === "DISPUTED" ? "ADMIN_DISPUTE_REFUND" : "ADMIN_MANUAL_REFUND",
      );
      booking.depositStatus = "REFUNDED_TO_RENTER";
    } else {
      const securityDepositActions = this.getSecurityDepositActions(transaction.toObject(), booking.toObject());
      if (!securityDepositActions.canReleaseDepositToOwner) {
        throw ApiError.unprocessable(
          securityDepositActions.releaseIneligibleReason ||
            "This security deposit is not eligible for owner release",
        );
      }

      await walletService.releaseSecurityDepositToOwner({
        bookingId: booking.id,
        reason: input.reason,
        initiatedBy: input.initiatedBy,
      });
      booking.depositStatus = "RELEASED_TO_OWNER";
    }

    if (booking.status === "DISPUTED") {
      booking.status = "COMPLETED";
    }
    await booking.save();

    return {
      bookingId: booking.bookingId,
      transactionId,
      depositStatus: booking.depositStatus,
      action: input.action,
      amount: transaction.amount,
      currency: transaction.currency,
    };
  }
}

export const transactionService = new TransactionService();

