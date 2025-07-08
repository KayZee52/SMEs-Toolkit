"use client"

import { useMemo } from 'react';
import type { Sale, Expense, Customer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Landmark, AlertCircle } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface OverviewCardsProps {
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
}

export function OverviewCards({ sales, expenses, customers }: OverviewCardsProps) {
  const totalSales = useMemo(() => sales.reduce((sum, sale) => sum + sale.total, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
  const netProfit = totalSales - totalExpenses;
  
  // A simple calculation for credit owed. Assumes all debtors have outstanding balances.
  // A more robust system would track payments against sales.
  const creditOwed = useMemo(() => {
    const debtorIds = customers.filter(c => c.type === 'Debtor').map(c => c.id);
    return sales
      .filter(s => s.customerId && debtorIds.includes(s.customerId))
      .reduce((sum, sale) => sum + sale.total, 0); // Simplified: assumes total sale is owed
  }, [sales, customers]);

  const stats = [
    { title: "Total Sales", value: totalSales, icon: DollarSign, isCurrency: true },
    { title: "Total Expenses", value: totalExpenses, icon: Landmark, isCurrency: true },
    { title: "Net Profit", value: netProfit, icon: TrendingUp, isCurrency: true },
    { title: "Credit Owed (Est.)", value: creditOwed, icon: AlertCircle, isCurrency: true },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/20 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stat.value} isCurrency={stat.isCurrency} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
