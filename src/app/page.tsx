"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { LogSaleDialog } from "@/components/sales/log-sale-dialog";
import { ProductDialog } from "@/components/inventory/product-dialog";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useApp } from "@/contexts/app-context";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Sale } from "@/lib/types";

export default function DashboardPage() {
  const { sales, products } = useApp();

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const recentSales = sales.slice(0, 5);

    const getProfit = (sale: Sale) => {
      const product = products.find((p) => p.id === sale.productId);
      if (!product) return 0;
      return (sale.pricePerUnit - product.cost) * sale.quantity;
    };

    const tableColumn = ["Product", "Customer", "Total", "Profit", "Time"];
    const tableRows: (string | number)[][] = [];

    recentSales.forEach((sale) => {
      const saleData = [
        `${sale.productName}\n${sale.quantity} units`,
        sale.customerName,
        formatCurrency(sale.total),
        formatCurrency(getProfit(sale)),
        formatDistanceToNow(new Date(sale.date), { addSuffix: true }),
      ];
      tableRows.push(saleData);
    });

    doc.text("Recent Activity", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("recent_activity.pdf");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight motion-safe:animate-fade-in">
            Hi, Kelvin 👋
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <LogSaleDialog />
          <ProductDialog />
        </div>
      </div>

      {/* KPI Cards */}
      <StatsCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Sales Over the Week</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">
              Top-Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Recent Activity</CardTitle>
          <Button onClick={handleExportPdf} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>
    </div>
  );
}
