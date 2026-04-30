"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addHours } from "date-fns";
import { LoaderCircle, ThumbsUp, Pencil, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initializeChapaCheckout } from "@/lib/bookings-api";
import { useToast } from "@/hooks/use-toast";
import { readAuthToken } from "@/lib/auth-token";
import type { VehicleAvailabilityBlock } from "@/components/peer-host/vehicles/types";

interface BookingCardProps {
  vehicleId: string;
  vehicleName: string;
  dailyRate: number;
  location: string;
  ownerType?: "User" | "Company";
  vehicleStatus?: "available" | "rented" | "maintenance" | "pending_approval" | "retired";
  availabilityBlocks?: VehicleAvailabilityBlock[];
}

const COMMISSION_RATE = 0.08;

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
  ownerType,
  vehicleStatus,
  availabilityBlocks = [],
}: BookingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const now = useMemo(() => new Date(), []);
  const initialStart = useMemo(() => addHours(now, 2), [now]);
  const initialEnd = useMemo(() => addHours(initialStart, 24), [initialStart]);

  const [startDate, setStartDate] = useState(
    toDateTimeInputValue(initialStart).slice(0, 10),
  );
  const [startTimeStr, setStartTimeStr] = useState(
    toDateTimeInputValue(initialStart).slice(11, 16),
  );
  const [endDate, setEndDate] = useState(
    toDateTimeInputValue(initialEnd).slice(0, 10),
  );
  const [endTimeStr, setEndTimeStr] = useState(
    toDateTimeInputValue(initialEnd).slice(11, 16),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const startDateTime = `${startDate}T${startTimeStr}`;
  const endDateTime = `${endDate}T${endTimeStr}`;

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

    const hours = Math.round(((end.getTime() - start.getTime()) / 36e5) * 100) / 100;

    if (hours < 6) {
      return {
        valid: false,
        message: "Bookings must be at least 6 hours long.",
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
          message: "This vehicle is still pending approval and cannot be booked yet.",
          hours,
        };
      case "maintenance":
        return {
          valid: false,
          message: "This vehicle is currently in maintenance and unavailable for booking.",
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
    vehicleStatus,
  ]);

  const pricing = useMemo(() => {
    if (!bookingGuard.valid) {
      return {
        hours: 0,
        subtotal: 0,
        commission: 0,
        total: 0,
        valid: false,
      };
    }

    const pricePerHour = dailyRate / 24;
    const subtotal = bookingGuard.hours * pricePerHour;
    const commission = subtotal * COMMISSION_RATE;
    const total = subtotal + commission;

    return {
      hours: bookingGuard.hours,
      subtotal,
      commission,
      total,
      valid: true,
    };
  }, [bookingGuard.hours, bookingGuard.valid, dailyRate]);

  useEffect(() => {
    setSubmissionError(null);
  }, [
    endDate,
    endTimeStr,
    startDate,
    startTimeStr,
    availabilityBlocks,
    vehicleId,
    vehicleStatus,
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
        withDriver: false,
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

      if (/selected time range|payment hold|already has a booking/i.test(message)) {
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
    <div className="sticky top-24 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm w-full max-w-sm mr-auto ml-auto">
      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <div className="text-2xl font-extrabold text-[#222222] underline decoration-from-font underline-offset-4">
            {pricing.valid
              ? formatMoney(pricing.total)
              : formatMoney(dailyRate)}{" "}
            {pricing.valid ? "total" : "/ day"}
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-500">
            Before taxes
          </div>
        </div>

        <hr className="mb-6 border-gray-200" />

        <div className="mb-6">
          <h3 className="mb-4 text-xl font-bold text-[#222222]">Your trip</h3>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[15px] font-semibold text-[#222222]">
                Trip start
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={toDateTimeInputValue(addHours(new Date(), 1)).slice(
                      0,
                      10,
                    )}
                    className="flex-1 rounded-xl border-gray-300 py-6 px-4 font-semibold text-[#222222] shadow-sm focus-visible:ring-[#222222] focus-visible:ring-offset-0"
                  />
                </div>
                <div className="relative w-32">
                  <Input
                    type="time"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full rounded-xl border-gray-300 py-6 px-3 font-semibold text-[#222222] shadow-sm focus-visible:ring-[#222222] focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="mb-2 text-[15px] font-semibold text-[#222222]">
                Trip end
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="flex-1 rounded-xl border-gray-300 py-6 px-4 font-semibold text-[#222222] shadow-sm focus-visible:ring-[#222222] focus-visible:ring-offset-0"
                  />
                </div>
                <div className="relative w-32">
                  <Input
                    type="time"
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="w-full rounded-xl border-gray-300 py-6 px-3 font-semibold text-[#222222] shadow-sm focus-visible:ring-[#222222] focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="mb-6 border-gray-200" />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px] text-[#222222] mb-1">
              Pickup & return location
            </h3>
            <p className="text-[15px] text-gray-700">
              {location || "Will be specified later"}
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#222222]"
          >
            <Pencil className="h-[14px] w-[14px]" />
          </button>
        </div>

        {pricing.valid && (
          <div className="mb-6">
            <hr className="mb-6 border-gray-200" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#222222] underline decoration-from-font underline-offset-4 cursor-pointer">
                {formatMoney(pricing.subtotal)} x {pricing.hours} hr
              </span>
              <span className="text-[#222222]">
                {formatMoney(pricing.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#222222] underline decoration-from-font underline-offset-4 cursor-pointer">
                Trip fee
              </span>
              <span className="text-[#222222]">
                {formatMoney(pricing.commission)}
              </span>
            </div>
            <hr className="mb-3 border-gray-200" />
            <div className="flex items-center justify-between font-extrabold text-[#222222] text-[15px]">
              <span>Total</span>
              <span>{formatMoney(pricing.total)}</span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="mb-8 w-full rounded-xl bg-[#e5e5e5] px-4 py-[14px] text-base font-extrabold text-gray-800 hover:bg-[#d4d4d4] disabled:bg-[#f2f2f2] disabled:text-[#b4b4b4] disabled:opacity-100 transition-colors h-auto"
        >
          {submitting ? (
            <>
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>

        {(submissionError || bookingGuard.message) && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{submissionError || bookingGuard.message}</p>
          </div>
        )}

        <div>
          <h3 className="mb-4 text-xl font-bold text-[#222222]">
            Cancellation policy
          </h3>
          <div className="flex gap-4 items-start">
            <ThumbsUp className="h-[22px] w-[22px] mt-0.5 shrink-0 text-[#222222]" />
            <div>
              <h4 className="font-bold text-[15px] text-[#222222]">
                Free cancellation
              </h4>
              <p className="mt-1 text-[15px] text-gray-700 leading-snug">
                Full refund within 24 hours of booking. More flexible options
                available at checkout.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
