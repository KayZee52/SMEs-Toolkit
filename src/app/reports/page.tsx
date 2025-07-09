"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/contexts/app-context";
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from "react-day-picker";
import { OverviewCards } from "@/components/reports/overview-cards";
import { SalesOverTimeChart } from "@/components/reports/sales-over-time-chart";
import { ExpensesByCategoryChart } from "@/components/reports/expenses-by-category-chart";
import { TopProductsTable } from "@/components/reports/top-products-table";
import { TopCustomersTable } from "@/components/reports/top-customers-table";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AiSummary } from "@/components/reports/ai-summary";

export default function ReportsPage() {
  const { sales, expenses, customers } = useApp();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const filteredData = useMemo(() => {
    const from = date?.from ? startOfDay(date.from) : new Date(0);
    const to = date?.to ? endOfDay(date.to) : new Date();

    const filteredSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= from && saleDate <= to;
    });

    const filteredExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= from && expenseDate <= to;
    });

    return { sales: filteredSales, expenses: filteredExpenses };
  }, [date, sales, expenses]);

  const handleExport = () => {
    // This is a placeholder for CSV export functionality
    // A more complete implementation would use a library like 'papaparse'
    const headers = ["type", "date", "description", "amount"];
    const salesData = filteredData.sales.map(s => ["sale", s.date, `${s.quantity}x ${s.productName}`, s.total].join(','));
    const expensesData = filteredData.expenses.map(e => ["expense", e.date, e.description, e.amount].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...salesData, ...expensesData].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <div className="flex items-center gap-2">
          <DateRangePicker date={date} setDate={setDate} />
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <AiSummary
        filteredSales={filteredData.sales}
        filteredExpenses={filteredData.expenses}
        dateRange={date}
      />
      
      <OverviewCards sales={filteredData.sales} expenses={filteredData.expenses} customers={customers} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {date?.from && date?.to && <SalesOverTimeChart sales={filteredData.sales} dateRange={{ from: date.from, to: date.to }} />}
        <ExpensesByCategoryChart expenses={filteredData.expenses} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProductsTable sales={filteredData.sales} />
        <TopCustomersTable sales={filteredData.sales} />
      </div>
    </div>
  );
}
