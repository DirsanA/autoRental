import { Booking, type BookingDocument } from "../models/Booking.js";
import { Transaction } from "../models/Transaction.js";
import { Vehicle } from "../models/Vehicle.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { userPersistenceService } from "./user.persistence.service.js";
import { chapaService } from "./chapa.service.js";
import { walletService } from "./wallet.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";
import type { RequestUser } from "../utils/requestContext.js";
import type {
  BookingReviewCreateInput,
  BookingReviewUpdateInput,
  ChapaCheckoutInput,
  RenterBookingListQueryInput,
} from "../validators/booking.validator.js";

const COMMISSION_RATE = 0.08;
const PAYMENT_WINDOW_MINUTES = 30;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function splitNameParts(input?: string) {
  const value = (input || "").trim();
  if (!value) {
    return { firstName: "Auto", lastName: "Renter" };
  }

  const parts = value.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Auto",
    lastName: parts.slice(1).join(" ") || "Renter",
  };
}

function fitForChapa(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function fitForBookingCancelReason(value: string, maxLength = 240) {
  return value.trim().slice(0, maxLength);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toChapaPhoneNumber(phone?: string | null) {
  if (!phone) return undefined;

  const digits = phone.replace(/\D/g, "");

  if (/^(09|07)\d{8}$/.test(digits)) {
    return digits;
  }

  if (/^251(9|7)\d{8}$/.test(digits)) {
    return `0${digits.slice(3)}`;
  }

  return undefined;
}

function canExposeServerCallback(url: string) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // In production we require a public HTTPS callback (Chapa servers must reach it).
    // In local/dev we allow HTTP + localhost so the return page can still verify.
    if (ENV.NODE_ENV !== "production") {
      return true;
    }

    if (parsed.protocol !== "https:") return false;

    return !["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function canExposePublicReturnUrl(url: string) {
  // In production, keep return_url restrictions aligned with callback_url.
  // In local/dev, allow http://localhost return pages so verification can occur.
  if (ENV.NODE_ENV !== "production") {
    return true;
  }

  return canExposeServerCallback(url);
}

function getBookingPaymentState(booking: BookingDocument) {
  if (booking.payment.status === "PAID") {
    return "paid" as const;
  }

  if (booking.payment.status === "FAILED" || booking.status === "CANCELLED") {
    return "failed" as const;
  }

  return "pending" as const;
}

function mapBookingResponse(booking: BookingDocument) {
  const state = getBookingPaymentState(booking);

  return {
    id: booking.id,
    renterId: booking.renterId.toString(),
    bookingId: booking.bookingId,
    vehicleId: booking.vehicleId.toString(),
    status: booking.status,
    paymentState: state,
    startTime: booking.startTime,
    endTime: booking.endTime,
    withDriver: booking.withDriver,
    contactPhone: booking.contactPhone,
    pickupAddress: booking.pickupAddress || null,
    returnAddress: booking.returnAddress || null,
    pricing: {
      pricePerHour: booking.priceSnapshot.pricePerHour,
      totalHours: booking.priceSnapshot.totalHours,
      systemCommission: booking.priceSnapshot.systemCommission,
      totalAmount: booking.priceSnapshot.totalAmount,
      currency: booking.priceSnapshot.currency,
    },
    payment: {
      method: booking.payment.method || null,
      status: booking.payment.status,
      txRef: booking.payment.tx_ref || null,
      checkoutUrl: booking.payment.checkoutUrl || null,
      checkoutExpiresAt: booking.payment.checkoutExpiresAt || null,
      referenceId: booking.payment.referenceId || null,
      paidAt: booking.payment.paidAt || null,
      lastVerifiedAt: booking.payment.lastVerifiedAt || null,
    },
    createdAt: booking.createdAt || null,
    updatedAt: booking.updatedAt || null,
  };
}

function mapPaymentStateToStatus(value?: "pending" | "paid" | "failed") {
  switch (value) {
    case "paid":
      return "PAID";
    case "failed":
      return "FAILED";
    case "pending":
      return "PENDING";
    default:
      return undefined;
  }
}

function mapBookingListItem(booking: Record<string, any>) {
  const payment = booking.payment || {};

  const vehicle =
    booking.vehicleId && typeof booking.vehicleId === "object"
      ? booking.vehicleId
      : null;

  const renter =
    booking.renterId && typeof booking.renterId === "object"
      ? booking.renterId
      : null;

  const renterName =
    renter?.name ||
    [renter?.firstName, renter?.lastName].filter(Boolean).join(" ") ||
    "Anonymous renter";

  const renterPhone = renter?.phoneNumber
    ? renter.phoneNumber.replace(/^251/, "0")
    : booking.contactPhone;

  const gallery = Array.isArray(vehicle?.photos?.gallery)
    ? vehicle.photos.gallery.filter(Boolean)
    : [];

  const imageUrl =
    vehicle?.photos?.front ||
    vehicle?.photos?.side ||
    vehicle?.photos?.back ||
    gallery[0] ||
    null;

  return {
    id: booking._id?.toString?.() ?? String(booking._id),

    renterId: booking.renterId
      ? typeof booking.renterId === "object"
        ? (booking.renterId._id?.toString?.() ?? String(booking.renterId._id))
        : (booking.renterId.toString?.() ?? String(booking.renterId))
      : undefined,

    renter: renter
      ? {
          id: renter._id?.toString?.() ?? String(renter._id),
          name: renterName,
          phone: renterPhone,
          email: renter.email || null,
        }
      : null,

    bookingId: booking.bookingId,
    status: booking.status,

    paymentState:
      payment.status === "PAID"
        ? ("paid" as const)
        : payment.status === "FAILED" || booking.status === "CANCELLED"
          ? ("failed" as const)
          : ("pending" as const),

    startTime: booking.startTime ?? null,
    endTime: booking.endTime ?? null,
    actualReturnTime: booking.actualReturnTime ?? null,
    withDriver: Boolean(booking.withDriver),
    contactPhone: booking.contactPhone ?? null,
    pickupAddress: booking.pickupAddress ?? null,
    returnAddress: booking.returnAddress ?? null,
    cancelReason: booking.cancelReason ?? null,
    createdAt: booking.createdAt ?? null,
    updatedAt: booking.updatedAt ?? null,

    pricing: {
      pricePerHour: booking.priceSnapshot?.pricePerHour ?? 0,
      totalHours: booking.priceSnapshot?.totalHours ?? 0,
      systemCommission: booking.priceSnapshot?.systemCommission ?? 0,
      totalAmount: booking.priceSnapshot?.totalAmount ?? 0,
      currency: booking.priceSnapshot?.currency ?? "ETB",
    },

    payment: {
      method: payment.method ?? null,
      status: payment.status ?? null,
      txRef: payment.tx_ref ?? null,
      checkoutUrl: payment.checkoutUrl ?? null,
      checkoutExpiresAt: payment.checkoutExpiresAt ?? null,
      referenceId: payment.referenceId ?? null,
      paidAt: payment.paidAt ?? null,
      lastVerifiedAt: payment.lastVerifiedAt ?? null,
    },

    vehicle: vehicle
      ? {
          id: vehicle._id?.toString?.() ?? String(vehicle._id),
          make: vehicle.make ?? null,
          model: vehicle.model ?? null,
          year: vehicle.year ?? null,
          plate: vehicle.plate ?? null,
          imageUrl,
          availability: vehicle.availability ?? null,
          delivery: vehicle.delivery ?? null,
        }
      : null,
  };
}

function mapBookingReviewItem(
  review: Record<string, any>,
  currentUserId?: string,
) {
  const reviewerSource = review.reviewerId;
  const reviewerId =
    reviewerSource?._id?.toString?.() ?? reviewerSource?.toString?.() ?? null;
  const reviewerName =
    reviewerSource?.name ||
    [reviewerSource?.firstName, reviewerSource?.lastName]
      .filter(Boolean)
      .join(" ") ||
    null;
  const targetSource =
    review.targetId && typeof review.targetId === "object"
      ? review.targetId
      : null;

  return {
    id: review._id?.toString?.() ?? review.id ?? String(review._id),
    bookingId:
      review.bookingId?._id?.toString?.() ??
      review.bookingId?.toString?.() ??
      null,
    reviewerId,
    rating: review.rating ?? 0,
    comment: review.comment ?? "",
    images: Array.isArray(review.images) ? review.images.filter(Boolean) : [],
    createdAt: review.createdAt ?? null,
    updatedAt: review.updatedAt ?? null,
    isOwner: reviewerId ? reviewerId === String(currentUserId) : false,
    reviewer: reviewerId
      ? {
          id: reviewerId,
          name: reviewerName || "Anonymous renter",
          profilePicture: reviewerSource?.profilePicture ?? null,
        }
      : null,
    target: targetSource
      ? {
          id: targetSource._id?.toString?.() ?? String(targetSource._id),
          make: targetSource.make ?? null,
          model: targetSource.model ?? null,
          year: targetSource.year ?? null,
          plate: targetSource.plate ?? null,
        }
      : null,
  };
}

export class BookingService {
  private buildServerBaseUrl() {
    return ENV.BETTER_AUTH_URL.replace(/\/+$/, "");
  }

  private buildFrontendBaseUrl() {
    return ENV.FRONTEND_URL.replace(/\/+$/, "");
  }

  private async resolveRenter(caller: RequestUser) {
    const renter = await userPersistenceService.findByAuthId(caller.id);
    if (!renter) {
      throw ApiError.notFound("Authenticated user account was not found");
    }

    return renter;
  }

  private async releaseExpiredPendingBookings(vehicleId: string) {
    const now = new Date();

    await Booking.updateMany(
      {
        vehicleId,
        isBlocked: true,
        status: "PENDING",
        "payment.status": "PENDING",
        "payment.checkoutExpiresAt": { $lte: now },
      },
      {
        $set: {
          status: "CANCELLED",
          isBlocked: false,
          "payment.status": "FAILED",
          cancelReason: "Payment session expired before completion",
          cancelledAt: now,
        },
      },
    );
  }

  private async assertVehicleAvailability(
    vehicleId: string,
    startTime: Date,
    endTime: Date,
  ) {
    const overlappingBooking = await Booking.findOne({
      vehicleId,
      status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }).lean();

    if (overlappingBooking) {
      throw ApiError.conflict(
        "This vehicle already has a booking or payment hold for the selected time range",
      );
    }
  }

  private async syncVehicleStatus(vehicleId: string) {
    const activeBooking = await Booking.findOne({
      vehicleId,
      status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      "payment.status": { $in: ["PENDING", "PAID"] },
    }).lean();

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return;

    if (activeBooking) {
      if (vehicle.status === "AVAILABLE") {
        vehicle.status = "BOOKED";
        await vehicle.save();
      }
      return;
    }

    if (vehicle.status === "BOOKED") {
      vehicle.status = "AVAILABLE";
      await vehicle.save();
    }
  }

  private async upsertTransactionForBooking(booking: BookingDocument) {
    const vehicle = await Vehicle.findById(booking.vehicleId).lean();
    const receiverModel = vehicle?.ownerType === "Company" ? "Company" : "User";
    const receiverId = vehicle?.ownerId;

    const amount = booking.priceSnapshot.totalAmount;
    const metadata = {
      bookingId: booking.bookingId,
      withDriver: booking.withDriver,
      checkoutUrl: booking.payment.checkoutUrl,
      referenceId: booking.payment.referenceId,
    };

    const status =
      booking.payment.status === "PAID"
        ? "COMPLETED"
        : booking.payment.status === "FAILED"
          ? "FAILED"
          : "PENDING";

    await Transaction.findOneAndUpdate(
      {
        bookingId: booking._id,
        paymentGatewayId: booking.payment.tx_ref,
      },
      {
        $set: {
          payerId: booking.renterId,
          receiverId,
          receiverModel,
          amount,
          currency: booking.priceSnapshot.currency,
          type: "RENTAL_FEE",
          status,
          paymentGatewayId: booking.payment.tx_ref,
          invoiceUrl: booking.payment.checkoutUrl,
          metadata,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  private async buildCheckoutContext(
    caller: RequestUser,
    input: ChapaCheckoutInput,
  ) {
    const renter = await this.resolveRenter(caller);
    const vehicle = await Vehicle.findById(input.vehicleId);

    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    if (
      vehicle.status === "PENDING_APPROVAL" &&
      vehicle.ownerType !== "Company"
    ) {
      throw ApiError.conflict(
        "This vehicle is still pending approval and cannot be booked yet",
      );
    }

    if (vehicle.status === "MAINTENANCE") {
      throw ApiError.conflict(
        "This vehicle is currently in maintenance and unavailable for booking",
      );
    }

    if (vehicle.status === "RETIRED") {
      throw ApiError.conflict(
        "This vehicle is no longer available for booking",
      );
    }

    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    const now = new Date();

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw ApiError.badRequest("Booking dates must be valid ISO datetimes");
    }

    if (startTime <= now) {
      throw ApiError.unprocessable("Pickup time must be in the future");
    }

    if (endTime <= startTime) {
      throw ApiError.unprocessable("Return time must be after pickup time");
    }

    const totalHours = roundMoney(
      (endTime.getTime() - startTime.getTime()) / 36e5,
    );
    if (totalHours < 6) {
      throw ApiError.unprocessable("Bookings must be at least 6 hours long");
    }

    await this.releaseExpiredPendingBookings(vehicle.id);
    await this.assertVehicleAvailability(vehicle.id, startTime, endTime);

    const pricePerHour = roundMoney(vehicle.price / 24);
    const subtotal = roundMoney(pricePerHour * totalHours);
    const systemCommission = roundMoney(subtotal * COMMISSION_RATE);
    const totalAmount = roundMoney(subtotal + systemCommission);
    const txRef = `${Date.now()}-${vehicle.id.slice(-6)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const paymentExpiresAt = new Date(
      Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000,
    );

    const nameSource =
      renter.name ||
      [renter.firstName, renter.lastName].filter(Boolean).join(" ") ||
      undefined;
    const splitNames = splitNameParts(nameSource);
    const firstName = fitForChapa(splitNames.firstName, 35) || "Auto";
    const lastName = fitForChapa(splitNames.lastName, 35) || "Renter";
    const phoneForChapa =
      toChapaPhoneNumber(input.contactPhone) ||
      toChapaPhoneNumber(renter.phoneNumber);

    if (!phoneForChapa) {
      throw ApiError.unprocessable(
        "Add a valid Ethiopian phone number to your profile (09xxxxxxxx, 07xxxxxxxx, or +2519xxxxxxxx) before checkout",
      );
    }

    if (!renter.email || renter.email.length > 50) {
      throw ApiError.unprocessable(
        "Use an account email shorter than 50 characters for Chapa checkout",
      );
    }

    return {
      renter,
      vehicle,
      startTime,
      endTime,
      totalHours,
      pricePerHour,
      systemCommission,
      totalAmount,
      txRef,
      paymentExpiresAt,
      firstName,
      lastName,
      phoneForChapa,
    };
  }

  async initializeChapaCheckout(
    caller: RequestUser,
    input: ChapaCheckoutInput,
    baseUrls?: {
      serverBaseUrl?: string | undefined;
      frontendBaseUrl?: string | undefined;
    },
  ) {
    const context = await this.buildCheckoutContext(caller, input);

    const booking = await Booking.create({
      renterId: context.renter._id,
      vehicleId: context.vehicle._id,
      priceSnapshot: {
        pricePerHour: context.pricePerHour,
        totalHours: context.totalHours,
        systemCommission: context.systemCommission,
        totalAmount: context.totalAmount,
        currency: "ETB",
      },
      startTime: context.startTime,
      endTime: context.endTime,
      withDriver: input.withDriver,
      status: "PENDING",
      pickupAddress:
        input.pickupAddress?.trim() ||
        context.vehicle.delivery ||
        context.vehicle.availability,
      returnAddress:
        input.returnAddress?.trim() ||
        input.pickupAddress?.trim() ||
        context.vehicle.delivery ||
        context.vehicle.availability,
      // Store a normalized phone used for Chapa + owner contact.
      contactPhone: context.phoneForChapa,
      isBlocked: true,
      payment: {
        method: "CHAPA",
        status: "PENDING",
        tx_ref: context.txRef,
        checkoutExpiresAt: context.paymentExpiresAt,
      },
    });

    const serverBaseUrl = (
      baseUrls?.serverBaseUrl || this.buildServerBaseUrl()
    ).replace(/\/+$/, "");
    const frontendBaseUrl = (
      baseUrls?.frontendBaseUrl || this.buildFrontendBaseUrl()
    ).replace(/\/+$/, "");
    const callbackUrl = `${serverBaseUrl}/api/bookings/payments/chapa/callback`;
    const returnUrl = `${frontendBaseUrl}/payments/chapa/return?bookingId=${booking.id}&tx_ref=${encodeURIComponent(context.txRef)}`;
    const shouldSendCallbackUrl = canExposeServerCallback(serverBaseUrl);
    const shouldSendReturnUrl = canExposePublicReturnUrl(frontendBaseUrl);

    console.log(
      "[Chapa Init] booking=%s tx_ref=%s callback_url=%s return_url=%s",
      booking.id,
      context.txRef,
      shouldSendCallbackUrl ? callbackUrl : "(disabled)",
      shouldSendReturnUrl ? returnUrl : "(disabled)",
    );

    let chapa;
    try {
      const chapaPayload = {
        amount: context.totalAmount.toFixed(2),
        currency: "ETB",
        email: context.renter.email,
        first_name: context.firstName,
        last_name: context.lastName,
        phone_number: context.phoneForChapa,
        tx_ref: context.txRef,
        customization: {
          title: fitForChapa(
            `${context.vehicle.make} ${context.vehicle.model}`,
            16,
          ),
          description: `Booking ${booking.bookingId} for ${context.totalHours} rental hours`,
        },
        meta: {
          bookingId: booking.bookingId,
          vehicleId: context.vehicle.id,
          withDriver: input.withDriver,
        },
        ...(shouldSendCallbackUrl ? { callback_url: callbackUrl } : {}),
        ...(shouldSendReturnUrl ? { return_url: returnUrl } : {}),
      };

      chapa = await chapaService.initializeTransaction(chapaPayload);
    } catch (error) {
      const reason =
        error instanceof Error
          ? fitForBookingCancelReason(error.message)
          : "Unable to initialize Chapa checkout";

      booking.payment.status = "FAILED";
      booking.status = "CANCELLED";
      booking.isBlocked = false;
      booking.cancelReason = reason || "Unable to initialize Chapa checkout";
      booking.cancelledAt = new Date();
      await booking.save();
      await this.upsertTransactionForBooking(booking);
      await this.syncVehicleStatus(context.vehicle.id);
      throw error;
    }

    booking.payment.checkoutUrl = chapa.checkoutUrl;
    if (chapa.referenceId) {
      booking.payment.referenceId = chapa.referenceId;
    }
    await booking.save();

    await this.upsertTransactionForBooking(booking);
    await this.syncVehicleStatus(context.vehicle.id);

    return {
      booking: mapBookingResponse(booking),
      payment: {
        provider: "CHAPA",
        checkoutUrl: chapa.checkoutUrl,
        txRef: context.txRef,
        expiresAt: context.paymentExpiresAt,
      },
    };
  }

  async listRenterBookings(
    caller: RequestUser,
    query: RenterBookingListQueryInput,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: Record<string, unknown> = {
      renterId: caller.id,
    };

    if (query.status) {
      filter.status = query.status;
    }

    const paymentStatus = mapPaymentStateToStatus(query.paymentState);
    if (paymentStatus) {
      filter["payment.status"] = paymentStatus;
    }

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(escapeRegExp(search), "i");
      const vehicles = await Vehicle.find({
        $or: [{ make: regex }, { model: regex }, { plate: regex }],
      })
        .select("_id")
        .lean();

      const vehicleIds = vehicles.map((vehicle) => vehicle._id);
      const orFilters: Array<Record<string, unknown>> = [
        { bookingId: regex },
        { pickupAddress: regex },
        { returnAddress: regex },
      ];

      if (vehicleIds.length > 0) {
        orFilters.push({ vehicleId: { $in: vehicleIds } });
      }

      filter.$or = orFilters;
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter as any)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "vehicleId",
          select: "make model year plate availability delivery",
        })
        .populate({
          path: "renterId",
          select: "name firstName lastName email phoneNumber profilePicture",
        })
        .lean(),
      Booking.countDocuments(filter as any),
    ]);

    return {
      bookings: bookings.map((booking) =>
        mapBookingListItem(booking as Record<string, any>),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async listPeerHostBookings(
    caller: RequestUser,
    query: RenterBookingListQueryInput,
  ) {
    const host = await userPersistenceService.findByAuthId(
      caller.authUserId || caller.id,
    );

    if (!host) {
      throw ApiError.notFound("Authenticated user account was not found");
    }

    const ownedVehicles = await Vehicle.find({
      ownerId: host._id,
      ownerType: "User",
    })
      .select("_id")
      .lean();

    const ownedVehicleIds = ownedVehicles.map((vehicle) => vehicle._id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    if (ownedVehicleIds.length === 0) {
      return {
        bookings: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1,
        },
      };
    }

    const filter: Record<string, unknown> = {
      vehicleId: { $in: ownedVehicleIds },
    };

    if (query.status) {
      filter.status = query.status;
    }

    const paymentStatus = mapPaymentStateToStatus(query.paymentState);
    if (paymentStatus) {
      filter["payment.status"] = paymentStatus;
    }

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(escapeRegExp(search), "i");
      const [matchingVehicles, matchingRenters] = await Promise.all([
        Vehicle.find({
          ownerId: host._id,
          ownerType: "User",
          $or: [{ make: regex }, { model: regex }, { plate: regex }],
        })
          .select("_id")
          .lean(),
        User.find({
          $or: [
            { name: regex },
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { phoneNumber: regex },
          ],
        })
          .select("_id")
          .lean(),
      ]);

      const matchingVehicleIds = matchingVehicles.map((vehicle) => vehicle._id);
      const matchingRenterIds = matchingRenters.map((renter) => renter._id);
      const orFilters: Array<Record<string, unknown>> = [
        { bookingId: regex },
        { pickupAddress: regex },
        { returnAddress: regex },
      ];

      if (matchingVehicleIds.length > 0) {
        orFilters.push({ vehicleId: { $in: matchingVehicleIds } });
      }

      if (matchingRenterIds.length > 0) {
        orFilters.push({ renterId: { $in: matchingRenterIds } });
      }

      filter.$or = orFilters;
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter as any)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "vehicleId",
          select: "make model year plate availability delivery photos",
        })
        .populate({
          path: "renterId",
          select: "name firstName lastName email phoneNumber profilePicture",
        })
        .lean(),
      Booking.countDocuments(filter as any),
    ]);

    return {
      bookings: bookings.map((booking) =>
        mapBookingListItem(booking as Record<string, any>),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private async verifyAndSyncBooking(booking: BookingDocument) {
    if (!booking.payment.tx_ref) {
      throw ApiError.unprocessable(
        "This booking does not have a Chapa transaction reference",
      );
    }

    if (booking.payment.status === "PAID") {
      return {
        booking: mapBookingResponse(booking),
        verificationStatus: "success",
      };
    }

    const verification = await chapaService.verifyTransaction(
      booking.payment.tx_ref,
    );
    const verificationStatus = verification.verificationStatus;
    console.log(
      "[Chapa Verify] booking=%s tx_ref=%s status=%s",
      booking.id,
      booking.payment.tx_ref,
      verificationStatus,
    );
    const amount = Number(verification.amount);

    if (
      verification.currency &&
      verification.currency !== booking.priceSnapshot.currency
    ) {
      throw ApiError.unprocessable("Payment currency verification failed");
    }

    if (
      !Number.isNaN(amount) &&
      roundMoney(amount) !== booking.priceSnapshot.totalAmount
    ) {
      throw ApiError.unprocessable("Payment amount verification failed");
    }

    if (verification.referenceId) {
      booking.payment.referenceId = verification.referenceId;
    }
    booking.payment.lastVerifiedAt = new Date();

    if (verificationStatus === "success") {
      booking.payment.status = "PAID";
      booking.payment.paidAt = new Date();
      booking.status = "CONFIRMED";
      booking.isBlocked = false;
      booking.set("cancelReason", undefined);
      booking.set("cancelledAt", undefined);
    } else if (
      verificationStatus === "failed" ||
      verificationStatus === "cancelled"
    ) {
      booking.payment.status = "FAILED";
      booking.status = "CANCELLED";
      booking.isBlocked = false;
      booking.cancelReason = "Chapa payment failed or was cancelled";
      booking.cancelledAt = new Date();
    } else {
      const paymentExpired =
        booking.payment.checkoutExpiresAt &&
        booking.payment.checkoutExpiresAt.getTime() <= Date.now();

      if (paymentExpired) {
        booking.payment.status = "FAILED";
        booking.status = "CANCELLED";
        booking.isBlocked = false;
        booking.cancelReason = "Chapa payment session expired";
        booking.cancelledAt = new Date();
      } else {
        booking.payment.status = "PENDING";
        booking.status = "PENDING";
        booking.isBlocked = true;
      }
    }

    await booking.save();
    await this.upsertTransactionForBooking(booking);
    if (verificationStatus === "success") {
      console.log("[Wallet Escrow] holding escrow for booking=%s", booking.id);
      await walletService.holdEscrowForPaidBooking(booking);
    }
    await this.syncVehicleStatus(booking.vehicleId.toString());

    return {
      booking: mapBookingResponse(booking),
      verificationStatus,
    };
  }

  async verifyChapaPayment(input: { bookingId?: string; txRef?: string }) {
    const booking = await Booking.findOne({
      $or: [
        ...(input.bookingId ? [{ _id: input.bookingId }] : []),
        ...(input.txRef ? [{ "payment.tx_ref": input.txRef }] : []),
      ],
    });

    if (!booking) {
      throw ApiError.notFound("Booking payment session was not found");
    }

    return this.verifyAndSyncBooking(booking);
  }

  async getChapaCallbackResult(input: { txRef?: string; bookingId?: string }) {
    return this.verifyChapaPayment(input);
  }

  async getBookingDetail(caller: RequestUser, bookingId: string) {
    const renter = await this.resolveRenter(caller);

    const booking = await Booking.findOne({
      _id: bookingId,
      renterId: renter._id,
    })

      .populate({
        path: "vehicleId",
        select:
          "make model year plate photos availability delivery ownerType ownerId",
      })
      .populate({
        path: "renterId",
        select: "name firstName lastName email phoneNumber profilePicture",
      })
      .populate({
        path: "driverAssigned",
        select: "firstName lastName email phoneNumber profilePicture",
      })
      .lean();

    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    return mapBookingListItem(booking as Record<string, any>);
  }

  async createReview(
    caller: RequestUser,
    bookingId: string,
    reviewData: BookingReviewCreateInput,
  ) {
    const renter = await this.resolveRenter(caller);

    const booking = await Booking.findOne({
      _id: bookingId,
      renterId: renter._id,
      status: "COMPLETED",
    }).lean();

    if (!booking) {
      throw ApiError.notFound("Booking not found or not completed");
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      bookingId: booking._id,
      reviewerId: renter._id,
    });

    if (existingReview) {
      throw ApiError.conflict("Review already submitted for this booking");
    }

    const vehicle = await Vehicle.findById(booking.vehicleId);
    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    // Create review targeting the vehicle
    const review = await Review.create({
      bookingId: booking._id,
      reviewerId: renter._id,
      targetId: vehicle._id,
      targetType: "Vehicle",
      rating: reviewData.rating,
      comment: reviewData.comment,
      images: reviewData.images || [],
    });

    const populatedReview = await Review.findById(review._id)
      .populate({
        path: "reviewerId",
        select: "name firstName lastName profilePicture",
      })
      .populate({
        path: "targetId",
        select: "make model year plate",
      })
      .lean();

    return mapBookingReviewItem(
      (populatedReview || review.toObject()) as Record<string, any>,
      renter._id.toString(),
    );
  }

  async updateReview(
    caller: RequestUser,
    bookingId: string,
    reviewId: string,
    reviewData: BookingReviewUpdateInput,
  ) {
    const renter = await this.resolveRenter(caller);

    const booking = await Booking.findOne({
      _id: bookingId,
      renterId: renter._id,
    })
      .select("_id")
      .lean();

    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    const updates: Record<string, unknown> = {};
    if (reviewData.rating !== undefined) {
      updates.rating = reviewData.rating;
    }
    if (reviewData.comment !== undefined) {
      updates.comment = reviewData.comment;
    }
    if (reviewData.images !== undefined) {
      updates.images = reviewData.images;
    }

    const review = await Review.findOneAndUpdate(
      {
        _id: reviewId,
        bookingId: booking._id,
        reviewerId: renter._id,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate({
        path: "reviewerId",
        select: "name firstName lastName profilePicture",
      })
      .populate({
        path: "targetId",
        select: "make model year plate",
      })
      .lean();

    if (!review) {
      throw ApiError.notFound("Review not found");
    }

    return mapBookingReviewItem(
      review as Record<string, any>,
      renter._id.toString(),
    );
  }

  async deleteReview(caller: RequestUser, bookingId: string, reviewId: string) {
    const renter = await this.resolveRenter(caller);

    const booking = await Booking.findOne({
      _id: bookingId,
      renterId: renter._id,
    })
      .select("_id")
      .lean();

    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      bookingId: booking._id,
      reviewerId: renter._id,
    }).lean();

    if (!review) {
      throw ApiError.notFound("Review not found");
    }

    return {
      id: review._id?.toString?.() ?? reviewId,
      deleted: true,
    };
  }

  async getBookingReviews(caller: RequestUser, bookingId: string) {
    const renter = await this.resolveRenter(caller);

    const booking = await Booking.findOne({
      _id: bookingId,
      renterId: renter._id,
    }).lean();

    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    const reviews = await Review.find({
      bookingId: booking._id,
    })
      .populate({
        path: "reviewerId",
        select: "name firstName lastName profilePicture",
      })
      .populate({
        path: "targetId",
        select: "make model year plate",
      })
      .lean();

    return reviews.map((review) =>
      mapBookingReviewItem(
        review as Record<string, any>,
        renter._id.toString(),
      ),
    );
  }

  async markBookingCompleted(
    caller: RequestUser,
    bookingId: string,
    reason?: string,
  ) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    if (booking.payment.status !== "PAID") {
      throw ApiError.unprocessable(
        "Cannot complete booking before successful payment",
      );
    }

    booking.status = "COMPLETED";
    booking.actualReturnTime = booking.actualReturnTime || new Date();
    await booking.save();
    await walletService.releaseEscrowForBooking(booking.id, "COMPLETED");

    return {
      booking: mapBookingResponse(booking),
      settlement: {
        released: true,
        source: "COMPLETED",
        reason: reason || null,
      },
    };
  }

  async releaseEscrowByAdmin(bookingId: string, reason?: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    if (booking.payment.status !== "PAID") {
      throw ApiError.unprocessable("Cannot release escrow for unpaid booking");
    }

    await walletService.releaseEscrowForBooking(booking.id, "ADMIN_OVERRIDE");
    return {
      booking: mapBookingResponse(booking),
      settlement: {
        released: true,
        source: "ADMIN_OVERRIDE",
        reason: reason || null,
      },
    };
  }

  async cancelBookingWithRefund(bookingId: string, reason?: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    if (booking.payment.status !== "PAID") {
      throw ApiError.unprocessable("Cannot refund an unpaid booking");
    }

    const wasCompleted = booking.status === "COMPLETED";
    booking.status = "CANCELLED";
    booking.cancelledAt = new Date();
    booking.cancelReason =
      fitForBookingCancelReason(reason || "Cancelled and refunded by admin") ||
      "Cancelled and refunded by admin";
    await booking.save();

    const refundSource =
      booking.actualReturnTime || wasCompleted ? "AVAILABLE" : "PENDING";
    await walletService.applyRefundReversal(booking.id, refundSource);

    return {
      booking: mapBookingResponse(booking),
      refund: {
        status: "processed",
        sourceBalance: refundSource.toLowerCase(),
      },
    };
  }
}

export const bookingService = new BookingService();
