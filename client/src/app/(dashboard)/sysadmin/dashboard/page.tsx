"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  Users,
  DollarSign,
  BadgeCheck,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  fetchAdminDashboard,
  type AdminDashboardData,
} from "@/lib/admin-dashboard-api";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { MonthlyExecutiveReportDialog } from "@/components/system-admin/reports/MonthlyExecutiveReportDialog";
import { AdminDashboardPageSkeleton } from "@/components/system-admin/sysadmin-page-skeletons";

type TooltipDatum = {
  name?: string;
  dataKey?: string;
  value?: unknown;
};

function ChartTooltip({
  active,
  payload,
  label,
  isDark,
  formatValue,
}: {
  active?: boolean;
  payload?: TooltipDatum[];
  label?: string;
  isDark: boolean;
  formatValue: (value: unknown, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className={
        "rounded-xl border px-3 py-2 shadow-lg backdrop-blur " +
        (isDark
          ? "border-slate-700/70 bg-slate-950/95 text-slate-100"
          : "border-slate-200 bg-white/95 text-slate-900")
      }
    >
      {label ? (
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </div>
      ) : null}
      <div className="mt-1 space-y-1">
        {payload.map((p, idx) => {
          const name = String(p?.name ?? p?.dataKey ?? "");
          return (
            <div key={idx} className="flex items-center justify-between gap-6 text-sm">
              <span className="text-slate-700 dark:text-slate-200">{name}</span>
              <span className="font-semibold tabular-nums">
                {formatValue(p?.value, name)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatMoney(amount: number, currency = "ETB") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export default function SystemAdminDashboard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const result = await fetchAdminDashboard();
        if (!cancelled) setDashboardData(result);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load dashboard data",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);

  const revenueData = useMemo(
    () => dashboardData?.revenueTrend?.weekly ?? [],
    [dashboardData?.revenueTrend?.weekly],
  );

  const pieData = useMemo(() => {
    const status = dashboardData?.bookingStatus ?? {};
    const active =
      (status.PENDING ?? 0) + (status.CONFIRMED ?? 0) + (status.ACTIVE ?? 0);
    const completed = status.COMPLETED ?? 0;
    const cancelled = status.CANCELLED ?? 0;
    const disputed = status.DISPUTED ?? 0;

    const rows = [
      { name: "Active", value: active, color: "#10B981" },
      { name: "Completed", value: completed, color: "#3B82F6" },
      { name: "Cancelled", value: cancelled, color: "#EF4444" },
      { name: "Disputed", value: disputed, color: "#F59E0B" },
    ];

    // Avoid empty pie (but keep style stable)
    const total = rows.reduce((s, r) => s + r.value, 0);
    return total > 0 ? rows : rows.map((r) => ({ ...r, value: 0 }));
  }, [dashboardData?.bookingStatus]);

  const totals = dashboardData?.totals;
  const counts = dashboardData?.counts;
  const pendingModeration =
    (counts?.pendingCompanies ?? 0) +
    (counts?.pendingVehicles ?? 0) +
    (counts?.pendingVerifications ?? 0);

  const stats = [
    {
      icon: DollarSign,
      label: "Gross Revenue",
      value: formatMoney(totals?.grossRevenue ?? 0),
      trend: "+",
      color: "bg-emerald-500",
    },
    {
      icon: BadgeCheck,
      label: "Platform Commission",
      value: formatMoney(totals?.platformCommission ?? 0),
      trend: "+",
      color: "bg-indigo-500",
    },
    {
      icon: Users,
      label: "Total Users",
      value: String(counts?.users ?? 0),
      trend: "+",
      color: "bg-blue-500",
    },
    {
      icon: ShieldAlert,
      label: "Pending Reviews",
      value: String(pendingModeration),
      trend: pendingModeration > 0 ? "+" : "-",
      color: "bg-rose-500",
    },
  ];

  if (loading) {
    return <AdminDashboardPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main>
          <div className="mx-auto w-full max-w-6xl">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-rose-600">{error}</p>
            </div>
          </div>
        </Main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-50 text-xl sm:text-2xl">
                System Admin Dashboard
              </h2>
            </div>

            <button
              onClick={() => setReportOpen(true)}
              className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg px-4 py-2 rounded-xl w-full sm:w-auto font-medium text-white transition-all"
            >
              <TrendingUp size={18} />
              <span>Generate Report</span>
            </button>
          </div>

          <MonthlyExecutiveReportDialog
            open={reportOpen}
            onOpenChange={setReportOpen}
          />

          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-slate-950 shadow-sm hover:shadow-md p-4 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-600 dark:text-slate-300 text-xs sm:text-sm truncate pr-2">
                      {stat.label}
                    </p>
                    <div className={`${stat.color} p-2 rounded-xl text-white`}>
                      <stat.icon size={18} />
                    </div>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-slate-50 text-lg sm:text-xl break-words">
                    {stat.value}
                  </p>
                  <p
                    className={
                      "text-xs font-bold flex items-center gap-0.5 " +
                      (stat.trend.startsWith("+")
                        ? "text-emerald-600"
                        : "text-rose-600")
                    }
                  >
                    {stat.trend.startsWith("+") ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    <span>Live</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 shadow-sm p-6 border border-slate-100 dark:border-slate-800 rounded-2xl min-w-0">
              <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="font-bold text-slate-900 dark:text-slate-50">
                  Revenue Overview
                </h3>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Last 7 days
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="revenueGradientAdmin"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDark ? "#1f2937" : "#f1f5f9"}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#cbd5e1" : "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#cbd5e1" : "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => formatMoney(Number(value) || 0)}
                    />
                    <Tooltip
                      content={(props: {
                        active?: boolean;
                        payload?: TooltipDatum[];
                        label?: string;
                      }) => (
                        <ChartTooltip
                          {...props}
                          isDark={isDark}
                          formatValue={(value, name) =>
                            String(name || "").toLowerCase() === "revenue"
                              ? formatMoney(Number(value) || 0)
                              : String(value ?? "")
                          }
                        />
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#revenueGradientAdmin)"
                      name="Revenue"
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Bookings"
                      barSize={20}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 shadow-sm p-6 border border-slate-100 dark:border-slate-800 rounded-2xl min-w-0">
              <h3 className="mb-6 font-bold text-slate-900 dark:text-slate-50">
                Bookings Status
              </h3>

              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={(props: {
                        active?: boolean;
                        payload?: TooltipDatum[];
                        label?: string;
                      }) => (
                        <ChartTooltip
                          {...props}
                          isDark={isDark}
                          formatValue={(value) => String(value ?? "")}
                        />
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 mt-6">
                {pieData.map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <div
                          className="rounded-full w-2 h-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {item.name}
                        </span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-50">
                        {item.value}
                      </span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (item.value /
                              Math.max(
                                1,
                                pieData.reduce((s, r) => s + r.value, 0),
                              )) *
                            100
                          }%`,
                        }}
                        className="rounded-full h-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Removed per request: companies/vehicles summary cards */}
        </div>
      </Main>
    </div>
  );
}
