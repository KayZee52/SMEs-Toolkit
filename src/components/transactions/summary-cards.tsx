
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, ShoppingCart, Landmark } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Sale, Expense } from "@/lib/types";
import { isToday, parseISO } from "date-fns";

interface TransactionsSummaryCardsProps {
  sales: Sale[];
  expenses: Expense[];
}

export function TransactionsSummaryCards({ sales, expenses }: TransactionsSummaryCardsProps) {
  const salesToday = sales.filter((s) => isToday(parseISO(s.date))).length;
  const expensesToday = expenses.filter((e) => isToday(parseISO(e.date))).length;
  const transactionsToday = salesToday + expensesToday;

  const stats = [
    {
      title: "Transactions (Today)",
      value: transactionsToday,
      icon: ArrowRightLeft,
    },
    {
      title: "Sales Logged (Today)",
      value: salesToday,
      icon: ShoppingCart,
    },
    {
      title: "Expenses Made (Today)",
      value: expensesToday,
      icon: Landmark,
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
              <AnimatedCounter value={stat.value} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
