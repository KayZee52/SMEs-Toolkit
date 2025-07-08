
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";
import { useApp } from "@/contexts/app-context";
import { subDays, format } from 'date-fns';

export function SalesChart() {
  const { sales } = useApp();

  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      date: format(date, 'MMM d'),
      shortDate: format(date, 'MM/dd/yyyy'),
      totalSales: 0,
    };
  }).reverse();

  sales.forEach(sale => {
    const saleDate = format(new Date(sale.date), 'MM/dd/yyyy');
    const entry = salesData.find(d => d.shortDate === saleDate);
    if (entry) {
      entry.totalSales += sale.total;
    }
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={salesData}>
          <XAxis
            dataKey="date"
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
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
            }}
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="totalSales"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 8, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
