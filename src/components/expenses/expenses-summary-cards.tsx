
"use client";

import React from "react";
import { useApp } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, List, Calendar } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { subDays, isAfter } from "date-fns";

export function ExpensesSummaryCards() {
  const { expenses } = useApp();

  const thirtyDaysAgo = subDays(new Date(), 30);
  const expensesLast30Days = expenses.filter(e => isAfter(new Date(e.date), thirtyDaysAgo));
  
  const totalExpenses = expensesLast30Days.reduce((acc, expense) => acc + expense.amount, 0);

  const expenseCategories = [...new Set(expensesLast30Days.map(e => e.category))].length;

  const stats = [
    {
      title: "Total Expenses (30d)",
      value: totalExpenses,
      isCurrency: true,
      icon: DollarSign,
    },
    {
      title: "Total Transactions (30d)",
      value: expensesLast30Days.length,
      isCurrency: false,
      icon: List,
    },
    {
        title: "Unique Categories (30d)",
        value: expenseCategories,
        isCurrency: false,
        icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
