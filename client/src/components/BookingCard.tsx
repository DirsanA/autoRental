"use client";

import { useMemo, useState, type FormEvent } from "react";
import { addHours } from "date-fns";
import {
  LoaderCircle,
  ThumbsUp,
  Pencil,
  AlertCircle,
  CalendarRange,
  Clock3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initializeChapaCheckout } from "@/lib/bookings-api";
import { useToast } from "@/hooks/use-toast";
import { readAuthToken } from "@/lib/auth-token";

interface BookingCardProps {
  vehicleId: string;
  vehicleName: string;
  dailyRate: number;
  location: string;
  disabled?: boolean;
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

function formatTripDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isOverlapConflict(message: string) {
  return /already has a booking|payment hold|selected time range|overlap/i.test(message);
}

export default function BookingCard({
  vehicleId,
  vehicleName,
  dailyRate,
  location,
  disabled = false,
}: BookingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const now = useMemo(() => new Date(), []);
  const initialStart = useMemo(() => addHours(now, 2), [now]);
  const initialEnd = useMemo(() => addHours(initialStart, 24), [initialStart]);

  const [startDate, setStartDate] = useState(toDateTimeInputValue(initialStart).slice(0, 10));
  const [startTimeStr, setStartTimeStr] = useState(toDateTimeInputValue(initialStart).slice(11, 16));
  const [endDate, setEndDate] = useState(toDateTimeInputValue(initialEnd).slice(0, 10));
  const [endTimeStr, setEndTimeStr] = useState(toDateTimeInputValue(initialEnd).slice(11, 16));
  const [submitting, setSubmitting] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const safeStartTimeStr = startTimeStr?.trim() ? startTimeStr : "00:00";
  const safeEndTimeStr = endTimeStr?.trim() ? endTimeStr : "00:00";
  const startDateTime = `${startDate}T${safeStartTimeStr}`;
  const endDateTime = `${endDate}T${safeEndTimeStr}`;

  const pricing = useMemo(() => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return {
        hours: 0,
        subtotal: 0,
        commission: 0,
        total: 0,
        valid: false,
      };
    }

    const rawHours = Math.round(((end.getTime() - start.getTime()) / 36e5) * 100) / 100;
    const isValid =
      start.getTime() > now.getTime() &&
      end.getTime() > start.getTime() &&
      rawHours >= 6;

    if (!isValid) {
      return {
        hours: 0,
        subtotal: 0,
        commission: 0,
        total: 0,
        valid: false,
      };
    }

    const finalHours = rawHours;
    const pricePerHour = dailyRate / 24;
    const subtotal = finalHours * pricePerHour;
    const commission = subtotal * COMMISSION_RATE;
    const total = subtotal + commission;

    return {
      hours: finalHours,
      subtotal,
      commission,
      total,
      valid: true,
    };
  }, [dailyRate, startDateTime, endDateTime]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setAvailabilityMessage("");

    if (!readAuthToken()) {
      router.push(
        `/auth/signin?portal=user&next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    if (!vehicleId) {
      toast({
        title: "Vehicle unavailable",
        description: "We could not start checkout because the vehicle is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!pricing.valid) {
      return; // Button is visually disabled anyway
    }

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
        description: "Your booking draft is ready and payment checkout is opening now.",
      });

      window.location.href = payload?.payment?.checkoutUrl || "";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start checkout";

      if (/sign in|authentication|unauthorized/i.test(message)) {
        router.push(`/auth/signin?portal=user&next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (isOverlapConflict(message)) {
        setAvailabilityMessage(
          `${vehicleName} is unavailable from ${formatTripDateTime(startDateTime)} to ${formatTripDateTime(endDateTime)}. Try a later pickup time or the next available day.`,
        );
        return;
      }

      toast({
        title: "Checkout failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="top-24 sticky bg-white shadow-sm mr-auto ml-auto p-6 border border-gray-200 rounded-xl w-full max-w-sm overflow-hidden">
      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <div className="font-extrabold text-[#222222] text-2xl decoration-from-font underline underline-offset-4">
            {pricing.valid ? formatMoney(pricing.total) : formatMoney(dailyRate)}{" "}
            {pricing.valid ? "total" : "/ day"}
          </div>
          <div className="mt-1 font-semibold text-gray-500 text-sm">Before taxes</div>
        </div>

        <hr className="mb-6 border-gray-200" />

        <div className="mb-6">
          <h3 className="mb-4 font-bold text-[#222222] text-xl">Your trip</h3>
          
          <div className="space-y-4">
            <div>
              <div className="mb-2 font-semibold text-[#222222] text-[15px]">Trip start</div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setAvailabilityMessage("");
                    }}
                    min={toDateTimeInputValue(addHours(new Date(), 1)).slice(0, 10)}
                    className="flex-1 shadow-sm px-4 py-6 border-gray-300 rounded-xl focus-visible:ring-[#222222] focus-visible:ring-offset-0 font-semibold text-[#222222]"
                  />
                </div>
                <div className="relative w-32">
                  <Input
                    type="time"
                    value={startTimeStr}
                    onChange={(e) => {
                      setStartTimeStr(e.target.value);
                      setAvailabilityMessage("");
                    }}
                    required
                    className="shadow-sm px-3 py-6 border-gray-300 rounded-xl focus-visible:ring-[#222222] focus-visible:ring-offset-0 w-full font-semibold text-[#222222]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="mb-2 font-semibold text-[#222222] text-[15px]">Trip end</div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setAvailabilityMessage("");
                    }}
                    min={startDate}
                    className="flex-1 shadow-sm px-4 py-6 border-gray-300 rounded-xl focus-visible:ring-[#222222] focus-visible:ring-offset-0 font-semibold text-[#222222]"
                  />
                </div>

               <div className="relative w-28">
  <Input
    type="time"
    value={endTimeStr}
    onChange={(e) => {
      setEndTimeStr(e.target.value);
      setAvailabilityMessage("");
    }}
    required
    className="bg-transparent px-2 py-2 border border-gray-200 focus:border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 w-full text-gray-800 text-sm transition"
  />
</div>

              </div>
            </div>
          </div>
        </div>

        {availabilityMessage &&
         (
          <div className="bg-[linear-gradient(135deg,#fff7ed_0%,#fffbeb_100%)] shadow-sm mb-6 border border-amber-200 rounded-2xl overflow-hidden">
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="bg-amber-100 mt-0.5 p-2 rounded-full text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-950 text-sm">Selected dates are not available</p>
                <p className="mt-1 text-amber-900 text-sm leading-6">{availabilityMessage}</p>
              </div>
            </div>
          </div>
        )
        }

        <hr className="mb-6 border-gray-200" />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="mb-1 font-bold text-[#222222] text-[15px]">Pickup & return location</h3>
            <p className="text-[15px] text-gray-700">{location || "Will be specified later"}</p>
          </div>
          <button type="button" className="flex justify-center items-center hover:bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-[#222222] focus:ring-2 w-9 h-9 text-gray-700">
            <Pencil className="w-[14px] h-[14px]" />
          </button>
        </div>

        
        {pricing.valid && (
          <div className="mb-6">
            <hr className="mb-6 border-gray-200" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#222222] decoration-from-font underline underline-offset-4 cursor-pointer">{formatMoney(pricing.subtotal)} x {pricing.hours} hr</span>
              <span className="text-[#222222]">{formatMoney(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#222222] decoration-from-font underline underline-offset-4 cursor-pointer">Trip fee</span>
              <span className="text-[#222222]">{formatMoney(pricing.commission)}</span>
            </div>
            <hr className="mb-3 border-gray-200" />
            <div className="flex justify-between items-center font-extrabold text-[#222222] text-[15px]">
              <span>Total</span>
              <span>{formatMoney(pricing.total)}</span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={disabled || submitting || !pricing.valid}
          className="bg-[#e5e5e5] hover:bg-[#d4d4d4] disabled:bg-[#f2f2f2] disabled:opacity-100 mb-8 px-4 py-[14px] rounded-xl w-full h-auto font-extrabold text-gray-800 disabled:text-[#b4b4b4] text-base transition-colors"
        >
          {submitting ? (
            <>
              <LoaderCircle className="mr-2 w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>

        <div>
          <h3 className="mb-4 font-bold text-[#222222] text-xl">Cancellation policy</h3>
          <div className="flex items-start gap-4">
            <ThumbsUp className="mt-0.5 w-[22px] h-[22px] text-[#222222] shrink-0" />
            <div>
              <h4 className="font-bold text-[#222222] text-[15px]">Free cancellation</h4>
              <p className="mt-1 text-[15px] text-gray-700 leading-snug">
                Full refund within 24 hours of booking. More flexible options available at checkout.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
