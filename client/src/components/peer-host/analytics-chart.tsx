"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Mon", clicks: 800, uniques: 600 },
  { name: "Tue", clicks: 650, uniques: 500 },
  { name: "Wed", clicks: 900, uniques: 700 },
  { name: "Thu", clicks: 700, uniques: 550 },
  { name: "Fri", clicks: 850, uniques: 620 },
  { name: "Sat", clicks: 500, uniques: 400 },
  { name: "Sun", clicks: 600, uniques: 450 },
];

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        {/* Subtle grid */}
        <CartesianGrid
          stroke="var(--border)"
          strokeOpacity={0.4}
          vertical={false}
        />

        {/* X Axis */}
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />

        {/* Y Axis */}
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />

        {/* Primary Data - Clicks */}
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="var(--foreground)"
          fill="var(--foreground)"
          fillOpacity={0.15}
          strokeWidth={2}
        />

        {/* Secondary Data - Uniques */}
        <Area
          type="monotone"
          dataKey="uniques"
          stroke="var(--muted-foreground)"
          fill="var(--muted-foreground)"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
