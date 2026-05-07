"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { verifyChapaBookingPayment, type BookingPaymentStatus } from "@/lib/bookings-api";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ChapaReturnPageInner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const txRef = searchParams.get("tx_ref") || searchParams.get("trx_ref");

  const [result, setResult] = useState<BookingPaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await verifyChapaBookingPayment({ bookingId, txRef });
        if (cancelled) return;

        setResult(data);

        if (data.booking.paymentState === "pending") {
          retryTimer = setTimeout(() => {
            void load();
          }, 5000);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to verify payment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [bookingId, txRef]);

  const view = useMemo(() => {
    if (!result) return null;

    if (result.booking.paymentState === "paid") {
      return {
        title: "Payment confirmed",
        description:
          "Chapa verification succeeded and your booking is now confirmed.",
        tone:
          "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(255,255,255,1))] text-emerald-950",
        icon: <BadgeCheck className="h-12 w-12 text-emerald-600" />,
      };
    }

    if (result.booking.paymentState === "failed") {
      return {
        title: "Payment did not complete",
        description:
          "The booking was not confirmed. You can go back and start a new payment session.",
        tone:
          "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,1),rgba(255,255,255,1))] text-rose-950",
        icon: <AlertCircle className="h-12 w-12 text-rose-600" />,
      };
    }

    return {
      title: "Payment still pending",
      description:
        "We are waiting for Chapa to finalize the transaction. This page refreshes automatically for a short time.",
      tone:
        "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(255,255,255,1))] text-amber-950",
      icon: <LoaderCircle className="h-12 w-12 animate-spin text-amber-600" />,
    };
  }, [result]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dcfce7,transparent_32%),linear-gradient(180deg,#f8fafc,#ffffff)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-700">
            Chapa Return
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Booking payment status
          </h1>
          <p className="mx-auto max-w-2xl text-slate-600">
            Your booking is only marked complete after our server verifies the final Chapa transaction state.
          </p>
        </div>

        <section
          className={`rounded-[32px] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 ${view?.tone || "border-slate-200 bg-white text-slate-950"}`}
        >
          {loading && !result ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <LoaderCircle className="h-12 w-12 animate-spin text-emerald-600" />
              <div>
                <h2 className="text-2xl font-semibold">Verifying with Chapa</h2>
                <p className="mt-2 text-slate-600">
                  We are checking the final payment result now.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />
              <div>
                <h2 className="text-2xl font-semibold">We could not verify payment yet</h2>
                <p className="mt-2 text-slate-600">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()} className="rounded-2xl">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : result && view ? (
            <div className="space-y-6">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  {view.icon}
                  <div>
                    <h2 className="text-3xl font-semibold">{view.title}</h2>
                    <p className="mt-2 max-w-xl text-base text-current/75">
                      {view.description}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-current/10 bg-white/60 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-current/60">
                    Booking reference
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{result.booking.bookingId}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-current/10 bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-current/60">
                    Amount paid
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    {formatMoney(
                      result.booking.pricing.totalAmount,
                      result.booking.pricing.currency,
                    )}
                  </p>
                  <p className="mt-2 text-sm text-current/70">
                    Includes {formatMoney(
                      result.booking.pricing.systemCommission,
                      result.booking.pricing.currency,
                    )} platform commission.
                  </p>
                </div>

                <div className="rounded-3xl border border-current/10 bg-white/70 p-5">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-current/60">
                    <CalendarClock className="h-4 w-4" />
                    Rental window
                  </p>
                  <p className="mt-3 text-sm font-medium">
                    {format(new Date(result.booking.startTime), "MMM d, yyyy HH:mm")}
                  </p>
                  <p className="mt-1 text-sm text-current/75">
                    to {format(new Date(result.booking.endTime), "MMM d, yyyy HH:mm")}
                  </p>
                  <p className="mt-3 text-sm text-current/75">
                    {result.booking.pricing.totalHours} billable hours
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-current/10 bg-white/70 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Verification details
                </p>
                <div className="mt-3 grid gap-2 text-sm text-current/75">
                  <p>Booking status: {result.booking.status}</p>
                  <p>Payment status: {result.booking.payment.status}</p>
                  <p>Verification result: {result.verificationStatus}</p>
                  <p>Transaction reference: {result.booking.payment.txRef || "Unavailable"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-2xl">
                  <Link href="/renter/booking-history">
                    Go to booking history
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh status
                </Button>
                <Button asChild type="button" variant="ghost" className="rounded-2xl">
                  <Link href="/">Back to cars</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default function ChapaReturnPage() {
  return (
    <Suspense fallback={null}>
      <ChapaReturnPageInner />
    </Suspense>
  );
}
