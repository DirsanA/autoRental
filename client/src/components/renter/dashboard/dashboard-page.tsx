"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  CarFront,
  ChevronRight,
  CreditCard,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deriveNextRelevantBooking,
  derivePaidThisMonthTotal,
  fetchRenterDashboardSnapshot,
  type RenterDashboardBooking,
  type RenterDashboardSnapshot,
} from "@/lib/renter-dashboard-api";

function formatMoney(amount: number, currency = "ETB") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Number(amount || 0).toLocaleString()} ${currency}`;
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return "-";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function bookingTitle(booking: RenterDashboardBooking) {
  const v = booking.vehicle;
  if (!v) return booking.bookingId || "Booking";
  return [v.make, v.model, v.year ? String(v.year) : null].filter(Boolean).join(" ");
}

function bookingStatusBadge(status: string) {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "ACTIVE":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300";
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300";
    case "DISPUTED":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200";
  }
}

export function RenterDashboardPage() {
  const [snapshot, setSnapshot] = useState<RenterDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchRenterDashboardSnapshot();
        if (!cancelled) setSnapshot(data);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const bookings = snapshot?.bookings ?? [];

  const activeCount = useMemo(
    () => bookings.filter((b) => ["PENDING", "CONFIRMED", "ACTIVE"].includes(b.status)).length,
    [bookings],
  );

  const upcomingCount = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      if (!b.startTime) return false;
      const t = new Date(b.startTime);
      return Number.isFinite(t.getTime()) && t > now;
    }).length;
  }, [bookings]);

  const paidThisMonth = useMemo(() => derivePaidThisMonthTotal(bookings), [bookings]);
  const nextBooking = useMemo(() => deriveNextRelevantBooking(bookings), [bookings]);
const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);

  const verificationLevel = snapshot?.user?.verificationLevel || "NONE";
  const needsIdVerification = verificationLevel === "NONE";
  const needsLicenseVerification = verificationLevel === "ID_VERIFIED";

  return (
    <div className="flex flex-1 flex-col overflow-hidden dark:bg-slate-950">
      <Header />

      <Main>
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Renter Dashboard
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your trips, payments, and quick actions in one place.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-7 w-32" />
                  <Skeleton className="mt-2 h-3 w-40" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-50">Could not load dashboard</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{error}</div>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Active trips</div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
                      <CalendarClock className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                    {activeCount}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Track your current and pending bookings.
                  </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Upcoming</div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
                      <BadgeCheck className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                    {upcomingCount}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Reservations starting soon.
                  </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Paid this month</div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
                      <CreditCard className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                    {formatMoney(paidThisMonth.total, paidThisMonth.currency)}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Includes paid bookings only.
                  </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Verification</div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
                      <FileText className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">
                    {verificationLevel}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Keep your account ready for bookings.
                  </div>
                </Card>
              </div>

{needsIdVerification ? (
                <Card className="p-5 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        Verification required to book
                      </div>
                      <div className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/80">
                        Complete your ID verification to start booking vehicles.
                      </div>
                    </div>
                    <Button asChild className="h-10 rounded-xl">
                      <Link href="/renter/profile-verification">Verify now</Link>
                    </Button>
                  </div>
                </Card>
              ) : needsLicenseVerification ? (
                <Card className="p-5 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        License verification needed for self-drive rentals
                      </div>
                      <div className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/80">
                        Add your driver&apos;s license to book vehicles without a driver.
                      </div>
                    </div>
                    <Button asChild className="h-10 rounded-xl">
                      <Link href="/renter/profile-verification">Add license</Link>
                    </Button>
                  </div>
                </Card>
              ) : null}

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Next trip</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        The booking that matters most right now.
                      </div>
                    </div>
                    <Button asChild variant="outline" className="h-9 rounded-xl">
                      <Link href="/renter/booking-history">All bookings</Link>
                    </Button>
                  </div>

                  {!nextBooking ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                      <div className="text-slate-900 dark:text-slate-50 font-semibold">No bookings yet</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Browse cars to start your first trip.
                      </div>
                      <div className="mt-4">
                        <Button asChild className="h-10 rounded-xl">
                          <Link href="/cars">Browse cars</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-900 dark:text-slate-50 truncate">
                              {bookingTitle(nextBooking)}
                            </div>
                            <Badge className={`border ${bookingStatusBadge(nextBooking.status)}`}>
                              {nextBooking.status}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {formatDateTime(nextBooking.startTime)} to {formatDateTime(nextBooking.endTime)}
                          </div>
                          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Total: {formatMoney(nextBooking.pricing.totalAmount, nextBooking.pricing.currency)}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:items-end">
                          {nextBooking.payment?.status === "PENDING" && nextBooking.payment?.checkoutUrl ? (
                            <Button asChild className="h-10 rounded-xl">
                              <a href={nextBooking.payment.checkoutUrl} target="_blank" rel="noreferrer">
                                Continue payment
                              </a>
                            </Button>
                          ) : (
                            <Button asChild className="h-10 rounded-xl">
                              <Link href={`/renter/booking-history/${encodeURIComponent(nextBooking.bookingId)}`}>
                                View booking
                              </Link>
                            </Button>
                          )}
                          <Button asChild variant="outline" className="h-10 rounded-xl">
                            <Link href="/cars">Browse cars</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Quick actions</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Common renter tasks.</div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Button asChild variant="secondary" className="w-full justify-between h-11 rounded-xl">
                      <Link href="/cars">
                        <span className="flex items-center gap-2"><CarFront className="h-4 w-4" /> Browse cars</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full justify-between h-11 rounded-xl">
                      <Link href="/renter/booking-history">
                        <span className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Booking history</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full justify-between h-11 rounded-xl">
                      <Link href="/renter/profile-verification">
                        <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Profile verification</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent bookings</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your latest activity.</div>
                    </div>
                    <Button asChild variant="outline" className="h-9 rounded-xl">
                      <Link href="/renter/booking-history">View all</Link>
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {recentBookings.length === 0 ? (
                      <div className="text-sm text-slate-600 dark:text-slate-300">No bookings yet.</div>
                    ) : (
                      recentBookings.map((b) => (
                        <div key={b.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                                {bookingTitle(b)}
                              </div>
                              <Badge className={`border ${bookingStatusBadge(b.status)}`}>{b.status}</Badge>
                            </div>
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              {formatDateTime(b.startTime)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <div className="font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                              {formatMoney(b.pricing.totalAmount, b.pricing.currency)}
                            </div>
                            <Button asChild variant="outline" className="h-9 rounded-xl">
                              <Link href={`/renter/booking-history/${encodeURIComponent(b.bookingId)}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

<Card className="p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Account</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your status at a glance.</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Verification</span>
                      <Badge className={
                        verificationLevel === "LICENSE_VERIFIED" || verificationLevel === "PEER_HOST"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : verificationLevel === "ID_VERIFIED"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300"
                      }>
                        {verificationLevel === "NONE" ? "Not verified" : verificationLevel === "ID_VERIFIED" ? "ID verified" : verificationLevel === "LICENSE_VERIFIED" ? "License verified" : "Peer host"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Account status</span>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300">
                        {snapshot?.user?.status || "Active"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Button asChild variant="outline" className="w-full h-10 rounded-xl">
                      <Link href="/renter/profile">View profile</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </Main>
    </div>
  );
}
