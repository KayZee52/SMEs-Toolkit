
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";
import { useApp } from "@/contexts/app-context";
import { subDays, format } from 'date-fns';

export function ProfitChart() {
  const { sales, products } = useApp();

  // Initialize data for the last 7 days
  const profitData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      date: format(date, 'MMM d'),
      fullDate: format(date, 'MM/dd/yyyy'),
      profit: 0,
    };
  }).reverse();

  // Aggregate profit for each day
  sales.forEach(sale => {
    const saleDateStr = format(new Date(sale.date), 'MM/dd/yyyy');
    const dateEntry = profitData.find(d => d.fullDate === saleDateStr);
    
    if (dateEntry) {
      const product = products.find((p) => p.id === sale.productId);
      const cost = product ? product.cost * sale.quantity : 0;
      const profit = sale.total - cost;
      dateEntry.profit += profit;
    }
  });


  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={profitData}>
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
                dataKey="profit"
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
