
"use client";

import { useApp } from "@/contexts/app-context";
import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function RecentActivity() {
  const { sales, products } = useApp();
  const recentSales = sales.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProfit = (sale: typeof sales[0]) => {
      const product = products.find(p => p.id === sale.productId);
      if (!product) return 0;
      return (sale.pricePerUnit - product.cost) * sale.quantity;
  }

  return (
    <div className="w-full">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                        <TableCell>
                            <div className="font-medium">{sale.productName}</div>
                            <div className="text-sm text-muted-foreground">{sale.quantity} units</div>
                        </TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                        <TableCell className="text-right">
                           <Badge variant={getProfit(sale) > 0 ? "secondary" : "destructive"}>{formatCurrency(getProfit(sale))}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatDistanceToNow(new Date(sale.date), { addSuffix: true })}</TableCell>
                    </TableRow>
                ))}
                 {recentSales.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No recent activity.
                        </TableCell>
                    </TableRow>
                 )}
            </TableBody>
        </Table>
    </div>
  );
}
