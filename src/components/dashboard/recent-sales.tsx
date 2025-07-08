"use client";

import { useApp } from "@/contexts/app-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales() {
  const { sales } = useApp();
  const recentSales = sales.slice(0, 5);

  const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  return (
    <div className="space-y-4">
      {recentSales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{sale.customerName?.charAt(0) || 'C'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {sale.customerName}
            </p>
            <p className="text-sm text-muted-foreground">{sale.productName}</p>
          </div>
          <div className="ml-auto font-medium">{formatCurrency(sale.total)}</div>
        </div>
      ))}
    </div>
  );
}
