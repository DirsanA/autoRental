'use client';
import React, { useState } from "react";
import {
  Car,
  CalendarCheck,
  CheckCircle,
  DollarSign,
  Wrench,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
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
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  // Sample data
  const revenueData = {
    weekly: [
      { day: "Mon", revenue: 4200, bookings: 12 },
      { day: "Tue", revenue: 3800, bookings: 10 },
      { day: "Wed", revenue: 5100, bookings: 15 },
      { day: "Thu", revenue: 4800, bookings: 14 },
      { day: "Fri", revenue: 6200, bookings: 18 },
      { day: "Sat", revenue: 7500, bookings: 22 },
      { day: "Sun", revenue: 6800, bookings: 20 },
    ],
    monthly: [
      { day: "W1", revenue: 28500, bookings: 82 },
      { day: "W2", revenue: 31200, bookings: 91 },
      { day: "W3", revenue: 29800, bookings: 87 },
      { day: "W4", revenue: 35600, bookings: 104 },
    ],
  };

  const fleetData = [
    { name: "Available", value: 12, color: "#10B981", icon: CheckCircle },
    { name: "Booked", value: 9, color: "#3B82F6", icon: CalendarCheck },
    { name: "Maintenance", value: 3, color: "#EF4444", icon: Wrench },
  ];

  const stats = [
    { icon: Car, label: "Total Fleet", value: "24", trend: "+2", color: "bg-blue-500" },
    { icon: CalendarCheck, label: "Active Bookings", value: "18", trend: "+15%", color: "bg-emerald-500" },
    { icon: CheckCircle, label: "Completed", value: "142", trend: "+23%", color: "bg-indigo-500" },
    { icon: DollarSign, label: "Earnings", value: "$12.4k", trend: "+8.2%", color: "bg-amber-500" },
    { icon: Wrench, label: "Maintenance", value: "3", trend: "-1", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-2xl">Fleet Dashboard</h2>
          <p className="text-slate-500">Real-time performance and fleet status overview.</p>
        </div>
        
        <button className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg px-4 py-2 rounded-xl w-full sm:w-auto font-medium text-white transition-all">
          <TrendingUp size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white shadow-sm hover:shadow-md p-4 border border-slate-100 rounded-2xl transition-all"
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="font-medium text-slate-500 text-xs truncate">{stat.label}</p>
                <div className={`${stat.color} p-2 rounded-xl text-white`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="font-bold text-slate-900 text-xl">{stat.value}</p>
              <p className={`text-xs font-bold flex items-center gap-0.5 ${
                stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
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
        <div className="lg:col-span-2 bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
          <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="font-bold text-slate-900">Revenue Overview</h3>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("weekly")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "weekly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setActiveTab("monthly")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
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
        <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
          <h3 className="mb-6 font-bold text-slate-900">Fleet Status</h3>
          
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
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
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
                    <span className="font-medium text-slate-600">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-900">{item.value} veh</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
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

          <div className="bg-emerald-50 mt-8 p-4 border border-emerald-100 rounded-xl">
            <p className="text-emerald-700 text-xs leading-relaxed">
              <span className="font-bold">💡 Pro Tip:</span> Your fleet utilization is at 87%. Consider adding 2 luxury vehicles to capture weekend demand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
