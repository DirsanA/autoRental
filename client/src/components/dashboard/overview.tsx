"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
//ensure proper light theme implementation
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
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
