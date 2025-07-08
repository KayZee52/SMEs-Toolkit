"use client";

import React from "react";
import { useApp } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function StatsCards() {
  const { sales, products } = useApp();

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

  const totalCostToday = salesToday.reduce((acc, sale) => {
    const product = products.find((p) => p.id === sale.productId);
    return acc + (product ? product.cost * sale.quantity : 0);
  }, 0);

  const totalProfitToday = totalRevenueToday - totalCostToday;
  
  const lowStockItems = products.filter((p) => p.stock < 10).length;

  const productSalesToday = salesToday.reduce<Record<string, { quantity: number }>>((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = { quantity: 0 };
      }
      acc[sale.productId].quantity += sale.quantity;
      return acc;
    }, {});

  const topSellerId = Object.keys(productSalesToday).length > 0
    ? Object.entries(productSalesToday).sort((a, b) => b[1].quantity - a[1].quantity)[0][0]
    : null;

  const topSellerName = products.find(p => p.id === topSellerId)?.name ?? "N/A";

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
      title: "Low Stock Items",
      value: lowStockItems,
      isCurrency: false,
      icon: AlertTriangle,
      description: "Items with less than 10 units"
    },
    {
      title: "Top Seller (Today)",
      value: topSellerName,
      isCurrency: false,
      icon: Star,
    },
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
               {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} isCurrency={stat.isCurrency} /> : stat.value}
            </div>
            {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
