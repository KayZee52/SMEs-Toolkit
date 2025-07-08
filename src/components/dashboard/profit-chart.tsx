"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useApp } from "@/contexts/app-context";

export function ProfitChart() {
  const { sales, products } = useApp();

  const profitData = sales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const product = products.find((p) => p.id === sale.productId);
    const cost = product ? product.cost * sale.quantity : 0;
    const profit = sale.total - cost;

    const existingEntry = acc.find((d) => d.date === date);
    if (existingEntry) {
      existingEntry.profit += profit;
    } else {
      acc.push({ date, profit });
    }
    return acc;
  }, [] as { date: string; profit: number }[]);

  const sortedData = profitData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);


  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData}>
            <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            />
            <YAxis
            stroke="#888888"
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
                cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
