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
}

export const transactionService = new TransactionService();

