
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
import { format, formatDistanceToNow, subDays } from "date-fns";
import type { Sale } from "@/lib/types";

export default function DashboardPage() {
  const { sales, products } = useApp();

  const handleExportRecentActivityPdf = () => {
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

  const handleExportSalesChartPdf = () => {
    const doc = new jsPDF();

    const salesData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, "MMM d"),
        shortDate: format(date, "MM/dd/yyyy"),
        totalSales: 0,
      };
    }).reverse();

    sales.forEach((sale) => {
      const saleDate = format(new Date(sale.date), "MM/dd/yyyy");
      const entry = salesData.find((d) => d.shortDate === saleDate);
      if (entry) {
        entry.totalSales += sale.total;
      }
    });

    const tableColumn = ["Date", "Total Sales"];
    const tableRows: (string | number)[][] = [];

    salesData.forEach((data) => {
      const rowData = [data.date, formatCurrency(data.totalSales)];
      tableRows.push(rowData);
    });

    doc.text("Sales Over the Week", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("sales_over_week.pdf");
  };

  const handleExportTopProductsPdf = () => {
    const doc = new jsPDF();

    const productSales = sales.reduce<Record<string, { name: string; sales: number }>>((acc, sale) => {
      const productName = products.find(p => p.id === sale.productId)?.name || "Unknown";
      if (!acc[productName]) {
        acc[productName] = { name: productName, sales: 0 };
      }
      acc[productName].sales += sale.total;
      return acc;
    }, {});

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
      
    const tableColumn = ["Product Name", "Total Revenue"];
    const tableRows: (string | number)[][] = [];

    topProducts.forEach((product) => {
        const rowData = [
          product.name,
          formatCurrency(product.sales),
        ];
        tableRows.push(rowData);
    });

    doc.text("Top-Selling Products", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("top_selling_products.pdf");
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Sales Over the Week</CardTitle>
            <Button onClick={handleExportSalesChartPdf} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">
              Top-Selling Products
            </CardTitle>
             <Button onClick={handleExportTopProductsPdf} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
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
          <Button onClick={handleExportRecentActivityPdf} variant="outline" size="sm">
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
