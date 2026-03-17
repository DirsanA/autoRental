"use client";

import React, { useMemo, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', revenue: 4500, profit: 3200 },
  { month: 'Feb', revenue: 5200, profit: 3800 },
  { month: 'Mar', revenue: 4800, profit: 3400 },
  { month: 'Apr', revenue: 6100, profit: 4500 },
  { month: 'May', revenue: 5900, profit: 4200 },
  { month: 'Jun', revenue: 7200, profit: 5400 },
];

const vehicleRevenue = [
  { name: 'Tesla Model 3', value: 4500 },
  { name: 'BMW X5', value: 3800 },
  { name: 'Toyota Camry', value: 2100 },
  { name: 'Audi A4', value: 3200 },
  { name: 'Honda Civic', value: 1800 },
];

export default function Earnings() {
  const [timeframe, setTimeframe] = useState<"6m" | "3m">("6m");
  const [vehicleQuery, setVehicleQuery] = useState("");

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    color: "var(--card-foreground)",
  } as const;

  const filteredMonthlyData = useMemo(() => {
    if (timeframe === "3m") return monthlyData.slice(-3);
    return monthlyData;
  }, [timeframe]);

  const filteredVehicleRevenue = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase();
    if (!q) return vehicleRevenue;
    return vehicleRevenue.filter((v) => v.name.toLowerCase().includes(q));
  }, [vehicleQuery]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-foreground text-2xl">Earnings & Reports</h2>
          <p className="text-muted-foreground">Track your revenue, profits, and financial performance.</p>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex w-full sm:w-auto rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setTimeframe("3m")}
              className={[
                "px-4 py-2 text-sm font-semibold flex-1 sm:flex-none",
                timeframe === "3m"
                  ? "bg-background text-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted/40",
              ].join(" ")}
            >
              3 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("6m")}
              className={[
                "px-4 py-2 text-sm font-semibold flex-1 sm:flex-none border-l border-border",
                timeframe === "6m"
                  ? "bg-background text-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted/40",
              ].join(" ")}
            >
              6 Months
            </button>
          </div>
          <button type="button" className="flex items-center justify-center gap-2 hover:bg-muted px-4 py-2 border border-border rounded-xl font-medium text-muted-foreground text-sm transition-colors">
            <Calendar size={18} />
            <span>{timeframe === "6m" ? "Last 6 Months" : "Last 3 Months"}</span>
          </button>
          <button type="button" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 px-4 py-2 rounded-xl font-medium text-white text-sm transition-colors">
            <Download size={18} />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <div className="bg-muted/5 dark:bg-slate-900/50 shadow-sm p-6 border border-border/50 dark:border-slate-800 rounded-2xl text-card-foreground">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 text-sm">
              <ArrowUpRight size={16} />
              12.5%
            </div>
          </div>
          <p className="font-medium text-muted-foreground text-sm">Total Revenue</p>
          <h3 className="mt-1 font-bold text-foreground text-2xl">$33,700</h3>
        </div>
        <div className="bg-muted/5 dark:bg-slate-900/50 shadow-sm p-6 border border-border/50 dark:border-slate-800 rounded-2xl text-card-foreground">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 font-bold text-blue-600 text-sm">
              <ArrowUpRight size={16} />
              8.2%
            </div>
          </div>
          <p className="font-medium text-muted-foreground text-sm">Net Profit</p>
          <h3 className="mt-1 font-bold text-foreground text-2xl">$24,500</h3>
        </div>
        <div className="bg-muted/5 dark:bg-slate-900/50 shadow-sm p-6 border border-border/50 dark:border-slate-800 rounded-2xl text-card-foreground">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <BarChart3 size={24} />
            </div>
            <div className="flex items-center gap-1 font-bold text-rose-600 text-sm">
              <ArrowDownRight size={16} />
              3.1%
            </div>
          </div>
          <p className="font-medium text-muted-foreground text-sm">Avg. Booking Value</p>
          <h3 className="mt-1 font-bold text-foreground text-2xl">$420</h3>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-muted/5 dark:bg-slate-900/50 shadow-sm p-6 border border-border/50 dark:border-slate-800 rounded-2xl text-card-foreground">
          <h3 className="mb-6 font-bold text-foreground text-lg">Monthly Revenue vs Profit</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', fillOpacity: 0.4 }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-muted/5 dark:bg-slate-900/50 shadow-sm p-6 border border-border/50 dark:border-slate-800 rounded-2xl text-card-foreground">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
            <h3 className="font-bold text-foreground text-lg">Revenue by Vehicle Model</h3>
            <input
              value={vehicleQuery}
              onChange={(e) => setVehicleQuery(e.target.value)}
              placeholder="Filter vehicles…"
              className="bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground w-full sm:w-56"
            />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredVehicleRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis 
                  type="number"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', fillOpacity: 0.4 }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
