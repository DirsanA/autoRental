"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  Car,
  CalendarCheck,
  CheckCircle,
  Wrench,
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
import { fetchCompanyDashboard, type CompanyDashboardData } from "@/lib/companyApi";
import { CompanyDashboardSkeleton } from "./company-dashboard-skeleton";

function ChartTooltip({
  active,
  payload,
  label,
  isDark,
  formatValue,
}: {
  active?: boolean;
  payload?: any[];
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

export default function Dashboard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [dashboardData, setDashboardData] = useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatMoney = useMemo(() => {
    return (amount: number, currency = "ETB") => {
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `${Number(amount || 0).toLocaleString()} ${currency}`;
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const result = await fetchCompanyDashboard();
        if (isMounted) {
          setDashboardData(result);
        }
      } catch (fetchError) {
        if (isMounted) {
          console.error(fetchError);
          setError("Unable to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const revenueData = {
    weekly:
      dashboardData?.revenueTrend?.weekly ?? [
        { day: "Mon", revenue: 4200, bookings: 12 },
        { day: "Tue", revenue: 3800, bookings: 10 },
        { day: "Wed", revenue: 5100, bookings: 15 },
        { day: "Thu", revenue: 4800, bookings: 14 },
        { day: "Fri", revenue: 6200, bookings: 18 },
        { day: "Sat", revenue: 7500, bookings: 22 },
        { day: "Sun", revenue: 6800, bookings: 20 },
      ],
    monthly:
      dashboardData?.revenueTrend?.monthly?.map((item: { period: string; revenue: number; bookings: number }) => ({
        day: item.period,
        revenue: item.revenue,
        bookings: item.bookings,
      })) ?? [
        { day: "W1", revenue: 28500, bookings: 82 },
        { day: "W2", revenue: 31200, bookings: 91 },
        { day: "W3", revenue: 29800, bookings: 87 },
        { day: "W4", revenue: 35600, bookings: 104 },
      ],
  };

  const fleetData = [
    {
      name: "Available",
      value: dashboardData?.fleetStatus.available ?? 12,
      color: "#10B981",
      icon: CheckCircle,
    },
    {
      name: "Booked",
      value: dashboardData?.fleetStatus.booked ?? 9,
      color: "#3B82F6",
      icon: CalendarCheck,
    },
    {
      name: "Maintenance",
      value: dashboardData?.fleetStatus.maintenance ?? 3,
      color: "#EF4444",
      icon: Wrench,
    },
  ];

  const stats = [
    {
      icon: Car,
      label: "Total Fleet",
      value: dashboardData?.totalFleet != null ? dashboardData.totalFleet.toString() : "24",
      trend: "+2",
      color: "bg-blue-500",
    },
    {
      icon: CalendarCheck,
      label: "Active Bookings",
      value: dashboardData?.activeBookings != null ? dashboardData.activeBookings.toString() : "18",
      trend: "+15%",
      color: "bg-emerald-500",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: dashboardData?.completedBookings != null ? dashboardData.completedBookings.toString() : "142",
      trend: "+23%",
      color: "bg-indigo-500",
    },
    {
      icon: Wrench,
      label: "Maintenance",
      value: dashboardData?.fleetStatus.maintenance != null ? dashboardData.fleetStatus.maintenance.toString() : "3",
      trend: "-1",
      color: "bg-rose-500",
    },
  ];

  if (loading) {
    return <CompanyDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800">
        <p className="text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-50 text-2xl">
            Fleet Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Real-time performance and fleet status overview.
          </p>
        </div>

        <button className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg px-4 py-2 rounded-xl w-full sm:w-auto font-medium text-white transition-all">
          <TrendingUp size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="gap-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-950 shadow-sm hover:shadow-md p-4 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all"
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="font-medium text-slate-600 dark:text-slate-300 text-xs truncate">
                  {stat.label}
                </p>
                <div className={`${stat.color} p-2 rounded-xl text-white`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="font-bold text-slate-900 dark:text-slate-50 text-xl">
                {stat.value}
              </p>
              <p className={`text-xs font-bold flex items-center gap-0.5 ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{stat.trend}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 shadow-sm p-6 border border-slate-100 dark:border-slate-800 rounded-2xl min-w-0">
          <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="font-bold text-slate-900 dark:text-slate-50">
              Revenue Overview
            </h3>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("weekly")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "weekly"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setActiveTab("monthly")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "monthly"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData[activeTab]}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                  content={(props: any) => (
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
                  fill="url(#revenueGradient)"
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

        {/* Fleet Status */}
        <div className="bg-white dark:bg-slate-950 shadow-sm p-6 border border-slate-100 dark:border-slate-800 rounded-2xl min-w-0">
          <h3 className="mb-6 font-bold text-slate-900 dark:text-slate-50">Fleet Status</h3>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {fleetData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props: any) => (
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
            {fleetData.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <div className="rounded-full w-2 h-2" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">{item.value} veh</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 24) * 100}%` }}
                    className="rounded-full h-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
              <span className="font-bold">Pro tip:</span> Your fleet utilization is at 87%. Consider adding 2 luxury vehicles to capture weekend demand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
