"use client";

import { useApp } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export function StatsCards() {
  const { sales, products, customers } = useApp();

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);

  const totalCost = sales.reduce((acc, sale) => {
    const product = products.find((p) => p.id === sale.productId);
    return acc + (product ? product.cost * sale.quantity : 0);
  }, 0);

  const totalProfit = totalRevenue - totalCost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Total Profit",
      value: formatCurrency(totalProfit),
      icon: DollarSign,
    },
    {
      title: "Sales",
      value: `+${sales.length}`,
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      value: `+${customers.length}`,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
