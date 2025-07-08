
"use client";

import { useApp } from "@/contexts/app-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";


export function RecentSales() {
  const { sales } = useApp();
  const recentSales = sales.slice(0, 5);

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
       {recentSales.length === 0 && (
        <div className="flex items-center justify-center h-24 text-muted-foreground">
            No recent sales.
        </div>
      )}
    </div>
  );
}
