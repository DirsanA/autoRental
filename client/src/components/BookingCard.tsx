"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addHours } from "date-fns";
import { LoaderCircle, ThumbsUp, Pencil, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initializeChapaCheckout } from "@/lib/bookings-api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { readAuthToken } from "@/lib/auth-token";
import {
  fetchCurrentSession,
  fetchCurrentUserProfile,
  readCachedAuthSession,
} from "@/lib/auth-api";
import type { VehicleAvailabilityBlock } from "@/components/peer-host/vehicles/types";

interface BookingCardProps {
  vehicleId: string;
  vehicleName: string;
  dailyRate: number;
  location: string;
  allowSelfDrive?: boolean;
  securityDepositAmount?: number;
  ownerType?: "User" | "Company";
  vehicleStatus?:
    | "available"
    | "rented"
    | "maintenance"
    | "pending_approval"
    | "retired";
  availabilityBlocks?: VehicleAvailabilityBlock[];
}

const COMMISSION_RATE = 0.08;
const BOOKING_ENABLED_LEVELS = new Set(["ID_VERIFIED", "LICENSE_VERIFIED", "PEER_HOST"]);

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount);
}

function toDateTimeInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function BookingCard({
  vehicleId,
  vehicleName,
  dailyRate,
  location,
  allowSelfDrive = false,
  securityDepositAmount = 0,
  ownerType,
  vehicleStatus,
  availabilityBlocks = [],
}: BookingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const now = useMemo(() => new Date(), []);
  // Default: start tomorrow, end 4 days later (3 day minimum + 1)
  const initialStart = useMemo(() => addHours(now, 24), [now]);
  const initialEnd = useMemo(() => addHours(initialStart, 72), [initialStart]);

  const [startDate, setStartDate] = useState(
    toDateTimeInputValue(initialStart).slice(0, 10),
  );
  const [endDate, setEndDate] = useState(
    toDateTimeInputValue(initialEnd).slice(0, 10),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingMode, setBookingMode] = useState<"with-driver" | "self-drive">(
    "with-driver",
  );
  const [verificationLevel, setVerificationLevel] = useState(
    readCachedAuthSession()?.user?.verificationLevel || "NONE",
  );
  const [canSelfDrive, setCanSelfDrive] = useState(
    Boolean(readCachedAuthSession()?.user?.canSelfDrive),
  );
  const [selfDriveApprovedAt, setSelfDriveApprovedAt] = useState<string | null>(
    (readCachedAuthSession()?.user?.selfDriveApprovedAt as string | null) ||
      null,
  );

  // Use noon for calculations to avoid timezone edge cases
  const startDateTime = `${startDate}T12:00`;
  const endDateTime = `${endDate}T12:00`;

  // Calculate max date (1 month from today) for date input constraints
  const maxDate = useMemo(() => {
    const max = new Date(now);
    max.setMonth(max.getMonth() + 1);
    return toDateTimeInputValue(max).slice(0, 10);
  }, [now]);

  const overlappingAvailabilityBlock = useMemo(() => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    return (
      availabilityBlocks.find((block) => {
        const blockStart = new Date(block.startDate);
        const blockEnd = new Date(block.endDate);

        if (
          Number.isNaN(blockStart.getTime()) ||
          Number.isNaN(blockEnd.getTime())
        ) {
          return false;
        }

        return blockStart < end && blockEnd > start;
      }) || null
    );
  }, [availabilityBlocks, endDateTime, startDateTime]);

  const bookingGuard = useMemo(() => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const currentTime = new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return {
        valid: false,
        message: "Choose a valid pickup and return date and time.",
        hours: 0,
      };
    }

    if (start <= currentTime) {
      return {
        valid: false,
        message: "Pickup time must be in the future.",
        hours: 0,
      };
    }

    if (end <= start) {
      return {
        valid: false,
        message: "Return time must be after pickup time.",
        hours: 0,
      };
    }

    const hours =
      Math.round(((end.getTime() - start.getTime()) / 36e5) * 100) / 100;

    if (hours < 72) {
      return {
        valid: false,
        message: "Bookings must be at least 3 days long.",
        hours,
      };
    }

    // Check if booking is within 1 month window from now
    const oneMonthFromNow = new Date(currentTime);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    if (start > oneMonthFromNow) {
      return {
        valid: false,
        message: "Bookings can only be made within 1 month from today.",
        hours,
      };
    }

    if (end > oneMonthFromNow) {
      return {
        valid: false,
        message: "Return date must be within 1 month from today.",
        hours,
      };
    }

    if (!vehicleId) {
      return {
        valid: false,
        message: "This vehicle is unavailable right now.",
        hours,
      };
    }

    switch (vehicleStatus) {
      case "pending_approval":
        if (ownerType === "Company") {
          break;
        }
        return {
          valid: false,
          message:
            "This vehicle is still pending approval and cannot be booked yet.",
          hours,
        };
      case "maintenance":
        return {
          valid: false,
          message:
            "This vehicle is currently in maintenance and unavailable for booking.",
          hours,
        };
      case "retired":
        return {
          valid: false,
          message: "This vehicle is no longer available for booking.",
          hours,
        };
    }

    if (overlappingAvailabilityBlock) {
      const overlapMessage =
        overlappingAvailabilityBlock.reason === "BOOKING"
          ? "The selected date range is already booked."
          : overlappingAvailabilityBlock.reason === "MAINTENANCE"
            ? "The selected date range is blocked for maintenance."
            : overlappingAvailabilityBlock.reason === "OWNER_USE"
              ? "The selected date range is blocked because the host is using the vehicle."
              : overlappingAvailabilityBlock.reason === "ADMIN_HOLD"
                ? "This vehicle is temporarily unavailable for the selected date range."
                : overlappingAvailabilityBlock.notes ||
                  "The selected date range is unavailable.";

      return {
        valid: false,
        message: overlapMessage,
        hours,
      };
    }

    return {
      valid: true,
      message: null,
      hours,
    };
  }, [
    endDateTime,
    overlappingAvailabilityBlock,
    startDateTime,
    vehicleId,
    ownerType,
    vehicleStatus,
  ]);

  const pricing = useMemo(() => {
    if (!bookingGuard.valid) {
      return {
        days: 0,
        subtotal: 0,
        commission: 0,
        deposit: 0,
        total: 0,
        valid: false,
      };
    }

    const days = Math.ceil(bookingGuard.hours / 24);
    const subtotal = days * dailyRate;
    const commission = subtotal * COMMISSION_RATE;
    const deposit =
      bookingMode === "self-drive" ? Math.max(securityDepositAmount || 0, 0) : 0;
    const total = subtotal + commission + deposit;

    return {
      days,
      subtotal,
      commission,
      deposit,
      total,
      valid: true,
    };
  }, [bookingGuard.hours, bookingGuard.valid, bookingMode, dailyRate, securityDepositAmount]);

  const hasAnyVerificationSignal =
    BOOKING_ENABLED_LEVELS.has(verificationLevel || "NONE") ||
    canSelfDrive ||
    Boolean(selfDriveApprovedAt);
  const isWithDriverVerificationReady = hasAnyVerificationSignal;
  const isSelfDriveVerificationReady =
    allowSelfDrive &&
    (canSelfDrive ||
      Boolean(selfDriveApprovedAt) ||
      verificationLevel === "LICENSE_VERIFIED");
  const isBookingVerificationReady =
    bookingMode === "self-drive"
      ? isSelfDriveVerificationReady
      : isWithDriverVerificationReady;

  const verificationBlockMessage =
    !isBookingVerificationReady && readAuthToken()
      ? bookingMode === "self-drive"
        ? !allowSelfDrive
          ? "This vehicle is not available for self-drive."
          : "Complete your Driver's License verification and get admin approval for self-drive."
        : "Complete your National ID verification before booking a vehicle."
      : null;

  const bookingModeDescription =
    bookingMode === "self-drive"
      ? "You will pay the rental fee, platform trip fee, and the refundable security deposit upfront."
      : "You will pay the rental fee and platform trip fee upfront.";

  useEffect(() => {
    if (!allowSelfDrive && bookingMode !== "with-driver") {
      setBookingMode("with-driver");
    }
  }, [allowSelfDrive, bookingMode]);

  useEffect(() => {
    let cancelled = false;

    if (!readAuthToken()) {
      setVerificationLevel("NONE");
      return;
    }

    const cachedLevel = readCachedAuthSession()?.user?.verificationLevel || "NONE";
    setVerificationLevel(cachedLevel);
    setCanSelfDrive(Boolean(readCachedAuthSession()?.user?.canSelfDrive));
    setSelfDriveApprovedAt(
      (readCachedAuthSession()?.user?.selfDriveApprovedAt as string | null) ||
        null,
    );

    const loadSession = async () => {
      try {
        const [profile, session] = await Promise.all([
          fetchCurrentUserProfile().catch(() => null),
          fetchCurrentSession().catch(() => null),
        ]);

        if (!cancelled) {
          setVerificationLevel(
            profile?.verificationLevel ||
              session?.user?.verificationLevel ||
              "NONE",
          );
          setCanSelfDrive(
            Boolean(
              profile?.canSelfDrive ?? session?.user?.canSelfDrive ?? false,
            ),
          );
          setSelfDriveApprovedAt(
            (profile?.selfDriveApprovedAt as string | null) ||
              (session?.user?.selfDriveApprovedAt as string | null) ||
              null,
          );
        }
      } catch {
        if (!cancelled) {
          setVerificationLevel(cachedLevel);
          setCanSelfDrive(Boolean(readCachedAuthSession()?.user?.canSelfDrive));
          setSelfDriveApprovedAt(
            (readCachedAuthSession()?.user?.selfDriveApprovedAt as
              | string
              | null) || null,
          );
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSubmissionError(null);
  }, [
    endDate,
    startDate,
    availabilityBlocks,
    vehicleId,
    vehicleStatus,
    verificationLevel,
    bookingMode,
    canSelfDrive,
    selfDriveApprovedAt,
  ]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!readAuthToken()) {
      router.push(
        `/auth/signin?portal=user&next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    if (!vehicleId) {
      setSubmissionError(
        "We could not start checkout because this vehicle is missing.",
      );
      return;
    }

    if (!isBookingVerificationReady) {
      setSubmissionError(
        bookingMode === "self-drive"
          ? "This vehicle is not available for self-drive."
          : "Complete your National ID verification before booking a vehicle.",
      );
      if (bookingMode !== "self-drive") {
        router.push("/renter/profile-verification");
      }
      return;
    }

    if (!bookingGuard.valid) {
      setSubmissionError(
        bookingGuard.message || "Please fix the booking details and try again.",
      );
      return;
    }

    setSubmissionError(null);
    setSubmitting(true);

    try {
      const payload = await initializeChapaCheckout({
        vehicleId,
        startTime: new Date(startDateTime).toISOString(),
        endTime: new Date(endDateTime).toISOString(),
        withDriver: bookingMode === "with-driver",
        pickupAddress: location,
        returnAddress: location,
      });

      toast({
        title: "Redirecting to Payment",
        description:
          "Your booking draft is ready and payment checkout is opening now.",
      });

      window.location.href = payload?.payment?.checkoutUrl || "";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start checkout";

      if (/sign in|authentication|unauthorized/i.test(message)) {
        router.push(
          `/auth/signin?portal=user&next=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }

      if (
        /selected time range|payment hold|already has a booking/i.test(message)
      ) {
        setSubmissionError(
          "The selected date range is already booked or temporarily held. Please choose a different time.",
        );
        return;
      }

      if (/not available for booking right now/i.test(message)) {
        setSubmissionError(
          "This vehicle is not available for new bookings right now.",
        );
        return;
      }

      setSubmissionError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sticky top-24 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm w-full max-w-sm mr-auto ml-auto">
      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <div className="text-2xl font-extrabold text-[#222222] dark:text-gray-100 underline decoration-from-font underline-offset-4">
            {pricing.valid
              ? formatMoney(pricing.total)
              : formatMoney(dailyRate)}{" "}
            {pricing.valid ? "total" : "/ day"}
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Before taxes
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{vehicleName}</div>
        </div>

        <hr className="mb-6 border-gray-200 dark:border-gray-800" />

        {allowSelfDrive ? (
          <>
            <div className="mb-6">
              <h3 className="mb-4 text-xl font-bold text-[#222222] dark:text-gray-100">Booking mode</h3>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setBookingMode("with-driver")}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    bookingMode === "with-driver"
                      ? "border-[#222222] dark:border-gray-500 bg-slate-50 dark:bg-gray-800 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#222222] dark:text-gray-100">With driver</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Best for renters who want a verified driver included.
                      </p>
                    </div>
                    <ThumbsUp className="h-5 w-5 text-[#222222] dark:text-gray-100" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingMode("self-drive")}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    bookingMode === "self-drive"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#222222] dark:text-gray-100">Self-drive</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Requires approved driver license verification and admin self-drive access.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Available
                    </span>
                  </div>
                  {securityDepositAmount > 0 ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Refundable deposit: {formatMoney(securityDepositAmount)}
                    </p>
                  ) : null}
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 px-4 py-3 text-sm text-slate-700 dark:text-gray-300">
                {bookingModeDescription}
              </div>
            </div>

            <hr className="mb-6 border-gray-200 dark:border-gray-800" />
          </>
        ) : null}

        <div className="mb-6">
          <h3 className="mb-4 text-xl font-bold text-[#222222] dark:text-gray-100">Your trip</h3>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[15px] font-semibold text-[#222222] dark:text-gray-100">
                Pickup date
              </div>
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={toDateTimeInputValue(addHours(new Date(), 1)).slice(
                    0,
                    10,
                  )}
                  max={maxDate}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 py-6 px-4 font-semibold text-[#222222] dark:text-gray-100 shadow-sm focus-visible:ring-[#222222] dark:focus-visible:ring-gray-400 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="mb-2 text-[15px] font-semibold text-[#222222] dark:text-gray-100">
                Return date
              </div>
              <div className="relative">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={maxDate}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 py-6 px-4 font-semibold text-[#222222] dark:text-gray-100 shadow-sm focus-visible:ring-[#222222] dark:focus-visible:ring-gray-400 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="mb-6 border-gray-200 dark:border-gray-800" />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px] text-[#222222] dark:text-gray-100 mb-1">
              Pickup & return location
            </h3>
            <p className="text-[15px] text-gray-700 dark:text-gray-400">
              {location || "Will be specified later"}
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#222222] dark:focus:ring-gray-400"
          >
            <Pencil className="h-[14px] w-[14px]" />
          </button>
        </div>

        {pricing.valid && (
          <div className="mb-6">
            <hr className="mb-6 border-gray-200 dark:border-gray-800" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#222222] dark:text-gray-100 underline decoration-from-font underline-offset-4 cursor-pointer">
                {formatMoney(dailyRate)} x {pricing.days} days
              </span>
              <span className="text-[#222222] dark:text-gray-100">
                {formatMoney(pricing.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#222222] dark:text-gray-100 underline decoration-from-font underline-offset-4 cursor-pointer">
                Trip fee
              </span>
              <span className="text-[#222222] dark:text-gray-100">
                {formatMoney(pricing.commission)}
              </span>
            </div>
            {pricing.deposit > 0 ? (
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#222222] dark:text-gray-100 underline decoration-from-font underline-offset-4 cursor-pointer">
                  Refundable security deposit
                </span>
                <span className="text-[#222222] dark:text-gray-100">
                  {formatMoney(pricing.deposit)}
                </span>
              </div>
            ) : null}
            <hr className="mb-3 border-gray-200 dark:border-gray-800" />
            <div className="flex items-center justify-between font-extrabold text-[#222222] dark:text-gray-100 text-[15px]">
              <span>Total</span>
              <span>{formatMoney(pricing.total)}</span>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-semibold text-primary dark:text-blue-400 hover:underline"
            >
              Terms and Policies
            </Link>{" "}
            required for booking
          </label>
        </div>

        <Button
          type="submit"
          disabled={submitting || !termsAccepted || !isBookingVerificationReady}
          className="mb-8 w-full rounded-xl bg-[#e5e5e5] dark:bg-gray-800 px-4 py-[14px] text-base font-extrabold text-gray-800 dark:text-gray-100 hover:bg-[#d4d4d4] dark:hover:bg-gray-700 disabled:bg-[#f2f2f2] dark:disabled:bg-gray-800 disabled:text-[#b4b4b4] dark:disabled:text-gray-500 disabled:opacity-100 transition-colors h-auto"
        >
          {submitting ? (
            <>
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : !isBookingVerificationReady && readAuthToken() ? (
            bookingMode === "self-drive"
              ? "Complete Self-Drive Approval"
              : "Verify National ID to Book"
          ) : (
            "Continue"
          )}
        </Button>

        {(submissionError || verificationBlockMessage || bookingGuard.message) && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {submissionError || verificationBlockMessage || bookingGuard.message}
              {!submissionError && verificationBlockMessage ? (
                <>
                  {" "}
                  <Link
                    href="/renter/profile-verification"
                    className="font-semibold underline underline-offset-2"
                  >
                    Go to verification
                  </Link>
                  .
                </>
              ) : null}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
