"use client";

import { useMemo } from "react";
import type { Sale } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface TopCustomersTableProps {
  sales: Sale[];
}

export function TopCustomersTable({ sales }: TopCustomersTableProps) {
  const topCustomers = useMemo(() => {
    const customerSales = sales.reduce((acc, sale) => {
      if (!sale.customerId || sale.customerId === "walk-in") return acc;
      
      if (!acc[sale.customerId]) {
        acc[sale.customerId] = {
          name: sale.customerName,
          salesCount: 0,
          totalSpent: 0,
        };
      }
      acc[sale.customerId].salesCount += 1;
      acc[sale.customerId].totalSpent += sale.total;
      return acc;
    }, {} as Record<string, { name: string; salesCount: number; totalSpent: number }>);

    return Object.values(customerSales)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [sales]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Top Customers</CardTitle>
        <CardDescription>
          Your most valuable customers by spending.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Purchases</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCustomers.map((customer) => (
              <TableRow key={customer.name}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-center">{customer.salesCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
              </TableRow>
            ))}
            {topCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No customer sales data for this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
