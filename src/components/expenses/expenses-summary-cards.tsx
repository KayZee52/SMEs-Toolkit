
"use client";

import React from "react";
import { useApp } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CalendarDays, Calendar } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";

export function ExpensesSummaryCards() {
  const { expenses } = useApp();

  const todayExpenses = expenses
    .filter((e) => isToday(parseISO(e.date)))
    .reduce((acc, expense) => acc + expense.amount, 0);

  const thisWeekExpenses = expenses
    .filter((e) => isThisWeek(parseISO(e.date), { weekStartsOn: 1 })) // Monday as start of week
    .reduce((acc, expense) => acc + expense.amount, 0);
  
  const thisMonthExpenses = expenses
    .filter((e) => isThisMonth(parseISO(e.date)))
    .reduce((acc, expense) => acc + expense.amount, 0);

  const stats = [
    {
      title: "Today's Expenses",
      value: todayExpenses,
      isCurrency: true,
      icon: DollarSign,
    },
    {
      title: "This Week",
      value: thisWeekExpenses,
      isCurrency: true,
      icon: CalendarDays,
    },
    {
      title: "This Month",
      value: thisMonthExpenses,
      isCurrency: true,
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/20 hover:shadow-lg"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">
              {stat.title}
            </CardTitle>
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
