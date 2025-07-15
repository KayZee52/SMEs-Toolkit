
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { LogSaleDialog } from "@/components/sales/log-sale-dialog";
import { ProductDialog } from "@/components/inventory/product-dialog";
import { Download, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DashboardPage() {
  const { isLoading, settings } = useApp();
  const [currentDate, setCurrentDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    const printableArea = document.getElementById('printable-area');
    if (printableArea) {
      try {
        const canvas = await html2canvas(printableArea, {
            scale: 2, // Increase scale for better quality
            useCORS: true,
            backgroundColor: null, // Use element's background
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
          console.error("Error exporting to PDF:", error);
      }
    }
    setIsExporting(false);
  };


  if (isLoading) {
      return (
          <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                      <Skeleton className="h-9 w-48" />
                      <Skeleton className="h-5 w-64 mt-2" />
                  </div>
                  <div className="flex gap-2">
                      <Skeleton className="h-10 w-28" />
                      <Skeleton className="h-10 w-32" />
                  </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Skeleton className="h-[350px] lg:col-span-3" />
                <Skeleton className="h-[350px] lg:col-span-2" />
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Hi, there
          </h1>
          <p className="text-muted-foreground">
            {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-2 non-printable">
          <LogSaleDialog />
          <ProductDialog />
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
             {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
                <Download className="mr-2 h-4 w-4" />
             )}
            {isExporting ? "Exporting..." : "Export Page"}
          </Button>
        </div>
      </div>
      
      <div id="printable-area" className="printable-area">
        {/* KPI Cards */}
        <StatsCards />

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 mt-6">
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
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
