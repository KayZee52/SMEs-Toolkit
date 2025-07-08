"use client";

import { useMemo } from "react";
import type { Sale } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';

interface SalesOverTimeChartProps {
  sales: Sale[];
  dateRange: { from: Date; to: Date };
}

export function SalesOverTimeChart({ sales, dateRange }: SalesOverTimeChartProps) {

  const chartData = useMemo(() => {
    const allDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const salesByDay = sales.reduce((acc, sale) => {
      const day = format(new Date(sale.date), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + sale.total;
      return acc;
    }, {} as Record<string, number>);

    return allDays.map(day => {
      const formattedDay = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'MMM d'),
        sales: salesByDay[formattedDay] || 0
      };
    });

  }, [sales, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Sales Over Time</CardTitle>
        <CardDescription>
          Total sales within the selected date range.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-body)',
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
