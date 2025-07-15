
"use client";

import { useMemo } from "react";
import type { Expense } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ExpensesByCategoryChartProps {
  expenses: Expense[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ExpensesByCategoryChart({ expenses }: ExpensesByCategoryChartProps) {
  const chartData = useMemo(() => {
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  }, [expenses]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Expenses by Category</CardTitle>
        <CardDescription>
          A breakdown of where your money is going.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-body)',
                }}
                formatter={(value, name) => [`${formatCurrency(value as number)}`, name]}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No expense data for this period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
