
"use client";

import React from "react";
import { useApp } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle, PackageX } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function InventorySummaryCards() {
  const { products } = useApp();

  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStockItems = products.filter((p) => p.stock === 0).length;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      icon: AlertCircle,
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      icon: PackageX,
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
