"use client";

import React from "react";
import { useApp } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function SalesSummaryCards() {
  const { sales } = useApp();

  const isToday = (someDate: Date) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  const salesToday = sales.filter((s) => isToday(new Date(s.date)));

  const totalRevenueToday = salesToday.reduce((acc, sale) => acc + sale.total, 0);
  const totalProfitToday = salesToday.reduce((acc, sale) => acc + sale.profit, 0);
  const itemsSoldToday = salesToday.reduce((acc, sale) => acc + sale.quantity, 0);

  const stats = [
    {
      title: "Total Sales (Today)",
      value: totalRevenueToday,
      isCurrency: true,
      icon: DollarSign,
    },
    {
      title: "Profit (Today)",
      value: totalProfitToday,
      isCurrency: true,
      icon: TrendingUp,
    },
    {
      title: "Items Sold (Today)",
      value: itemsSoldToday,
      isCurrency: false,
      icon: Package,
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
