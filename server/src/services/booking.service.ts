import { Booking, type BookingDocument } from "../models/Booking.js";
import { Transaction } from "../models/Transaction.js";
import { Vehicle } from "../models/Vehicle.js";
import { userPersistenceService } from "./user.persistence.service.js";
import { chapaService } from "./chapa.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";
import type { RequestUser } from "../utils/requestContext.js";
import type { ChapaCheckoutInput } from "../validators/booking.validator.js";

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

    if (parsed.protocol !== "https:") {
      return false;
    }

    return !["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function canExposePublicReturnUrl(url: string) {
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

    // Allow multiple future bookings on the same vehicle.
    // We only block checkout if the vehicle is explicitly not bookable.
    if (vehicle.status === "MAINTENANCE") {
      throw ApiError.conflict("This vehicle is under maintenance and cannot be booked right now");
    }
    if (vehicle.status === "RETIRED") {
      throw ApiError.conflict("This vehicle is retired and cannot be booked");
    }
    if (vehicle.status === "PENDING_APPROVAL") {
      throw ApiError.conflict("This vehicle is pending approval and cannot be booked yet");
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

    const totalHours = roundMoney((endTime.getTime() - startTime.getTime()) / 36e5);
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
      toChapaPhoneNumber(input.contactPhone) || toChapaPhoneNumber(renter.phoneNumber);

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
        input.pickupAddress?.trim() || context.vehicle.delivery || context.vehicle.availability,
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

    const serverBaseUrl = this.buildServerBaseUrl();
    const frontendBaseUrl = this.buildFrontendBaseUrl();
    const callbackUrl = `${serverBaseUrl}/api/bookings/payments/chapa/callback`;
    const returnUrl = `${frontendBaseUrl}/payments/chapa/return?bookingId=${booking.id}&tx_ref=${encodeURIComponent(context.txRef)}`;
    const shouldSendCallbackUrl = canExposeServerCallback(serverBaseUrl);
    const shouldSendReturnUrl = canExposePublicReturnUrl(frontendBaseUrl);

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
          title: fitForChapa(`${context.vehicle.make} ${context.vehicle.model}`, 16),
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

  private async verifyAndSyncBooking(booking: BookingDocument) {
    if (!booking.payment.tx_ref) {
      throw ApiError.unprocessable("This booking does not have a Chapa transaction reference");
    }

    if (booking.payment.status === "PAID") {
      return {
        booking: mapBookingResponse(booking),
        verificationStatus: "success",
      };
    }

    const verification = await chapaService.verifyTransaction(booking.payment.tx_ref);
    const verificationStatus = verification.verificationStatus;
    const amount = Number(verification.amount);

    if (verification.currency && verification.currency !== booking.priceSnapshot.currency) {
      throw ApiError.unprocessable("Payment currency verification failed");
    }

    if (!Number.isNaN(amount) && roundMoney(amount) !== booking.priceSnapshot.totalAmount) {
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
    } else if (verificationStatus === "failed" || verificationStatus === "cancelled") {
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
    await this.syncVehicleStatus(booking.vehicleId.toString());

    return {
      booking: mapBookingResponse(booking),
      verificationStatus,
    };
  }

  async verifyChapaPayment(input: {
    bookingId?: string;
    txRef?: string;
  }) {
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

  async getChapaCallbackResult(input: {
    txRef?: string;
    bookingId?: string;
  }) {
    return this.verifyChapaPayment(input);
  }
}

export const bookingService = new BookingService();
