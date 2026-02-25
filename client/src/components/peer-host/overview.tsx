"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Jan", total: 4500 },
  { name: "Feb", total: 3000 },
  { name: "Mar", total: 2000 },
  { name: "Apr", total: 4500 },
  { name: "May", total: 5900 },
  { name: "Jun", total: 2400 },
  { name: "Jul", total: 1000 },
  { name: "Aug", total: 4000 },
  { name: "Sep", total: 2000 },
  { name: "Oct", total: 4500 },
  { name: "Nov", total: 5200 },
  { name: "Dec", total: 1000 },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid
          stroke="var(--border)"
          strokeOpacity={0.5}
          vertical={false}
        />

        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />

        <Bar
          dataKey="total"
          fill="var(--foreground)" // black in light, white in dark
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
