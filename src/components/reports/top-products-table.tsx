"use client";

import { useMemo } from "react";
import type { Sale } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface TopProductsTableProps {
  sales: Sale[];
}

export function TopProductsTable({ sales }: TopProductsTableProps) {
  const topProducts = useMemo(() => {
    const productSales = sales.reduce((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = {
          name: sale.productName,
          unitsSold: 0,
          revenue: 0,
        };
      }
      acc[sale.productId].unitsSold += sale.quantity;
      acc[sale.productId].revenue += sale.total;
      return acc;
    }, {} as Record<string, { name: string; unitsSold: number; revenue: number }>);

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Top-Selling Products</CardTitle>
         <CardDescription>
          Your most popular items by revenue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Units Sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-center">{product.unitsSold}</TableCell>
                <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
              </TableRow>
            ))}
            {topProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No sales data for this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
