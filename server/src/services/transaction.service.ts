import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
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
}

export const transactionService = new TransactionService();

