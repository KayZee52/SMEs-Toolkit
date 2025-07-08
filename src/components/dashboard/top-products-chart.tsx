
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useApp } from "@/contexts/app-context";

export function TopProductsChart() {
  const { sales, products } = useApp();

  const productSales = sales.reduce<Record<string, { name: string; sales: number }>>((acc, sale) => {
    const productName = products.find(p => p.id === sale.productId)?.name || "Unknown";
    if (!acc[productName]) {
      acc[productName] = { name: productName, sales: 0 };
    }
    acc[productName].sales += sale.total;
    return acc;
  }, {});

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis type="number" hide />
            <YAxis 
                type="category" 
                dataKey="name" 
                width={120} 
                tickLine={false} 
                axisLine={false} 
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
             />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-body)',
                }}
                cursor={{ fill: 'hsl(var(--muted))' }}
                formatter={(value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value as number)}

            />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
