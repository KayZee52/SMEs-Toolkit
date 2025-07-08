
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Repeat, AlertTriangle } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Customer, Sale } from "@/lib/types";

interface CustomerSummaryCardsProps {
    customers: Customer[];
    sales: Sale[];
}

export function CustomerSummaryCards({ customers, sales }: CustomerSummaryCardsProps) {

  const totalCustomers = customers.length;
  const debtors = customers.filter(c => c.type === 'Debtor').length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const salesInLast30Days = sales.filter(s => new Date(s.date) > thirtyDaysAgo && s.customerId);

  const customerPurchaseCounts = salesInLast30Days.reduce((acc, sale) => {
    if (sale.customerId) {
        acc[sale.customerId] = (acc[sale.customerId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const repeatBuyers = Object.values(customerPurchaseCounts).filter(count => count > 1).length;


  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
    },
    {
      title: "Repeat Buyers (30d)",
      value: repeatBuyers,
      icon: Repeat,
    },
    {
      title: "Debtors",
      value: debtors,
      icon: AlertTriangle,
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
