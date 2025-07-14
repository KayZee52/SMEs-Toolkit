
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
import { Download } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { isLoading } = useApp();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

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
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Export Page
          </Button>
        </div>
      </div>
      
      <div className="printable-area">
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
