
"use client";

import { useState, useMemo, useRef } from "react";
import { useApp } from "@/contexts/app-context";
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { DateRange } from "react-day-picker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { OverviewCards } from "@/components/reports/overview-cards";
import { SalesOverTimeChart } from "@/components/reports/sales-over-time-chart";
import { ExpensesByCategoryChart } from "@/components/reports/expenses-by-category-chart";
import { TopProductsTable } from "@/components/reports/top-products-table";
import { TopCustomersTable } from "@/components/reports/top-customers-table";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AiSummary } from "@/components/reports/ai-summary";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { sales, expenses, customers, products, settings } = useApp();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  
  const salesChartRef = useRef<HTMLDivElement>(null);
  const expensesChartRef = useRef<HTMLDivElement>(null);
  const aiSummaryRef = useRef<HTMLDivElement>(null);
  const overviewCardsRef = useRef<HTMLDivElement>(null);

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

  const handleExportPdf = async () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let y = 40; // current y position on the page

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(settings.businessName, 40, y);
    y += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Business Performance Report", 40, y);
    y += 15;
    doc.setFontSize(10);
    if(date?.from && date?.to) {
        const dateString = `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;
        doc.text(dateString, 40, y);
    }
    y += 30;

    // AI Summary
    if (aiSummaryRef.current) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("AI-Powered Summary", 40, y);
        y += 15;
        const summaryText = (aiSummaryRef.current.querySelector('p') as HTMLElement)?.innerText;
        if(summaryText) {
          const splitText = doc.splitTextToSize(summaryText, pageWidth - 80);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(splitText, 40, y);
          y += splitText.length * 12 + 20;
        }
    }
    
    // Overview Cards as a table
    const totalSales = filteredData.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = filteredData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalSales - totalExpenses;
    autoTable(doc, {
        head: [['Total Sales', 'Total Expenses', 'Net Profit']],
        body: [[formatCurrency(totalSales), formatCurrency(totalExpenses), formatCurrency(netProfit)]],
        startY: y,
        margin: { left: 40, right: 40 },
        theme: 'striped',
        headStyles: { fillColor: [30, 30, 47] },
    });
    y = (doc as any).lastAutoTable.finalY + 30;

    // Charts
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Analytics Charts", 40, y);
    y += 20;
    
    const chartOptions = { backgroundColor: 'hsl(224 71.4% 4.1%)', scale: 2 };
    
    const addImageToPdf = (canvas: HTMLCanvasElement, currentY: number) => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = (pageWidth / 2) - 50;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (currentY + imgHeight > pageHeight - 40) {
            doc.addPage();
            return 40; // New Y position on new page
        }
        return currentY;
    };
    
    let salesCanvas, expensesCanvas;
    if (salesChartRef.current) salesCanvas = await html2canvas(salesChartRef.current, chartOptions);
    if (expensesChartRef.current) expensesCanvas = await html2canvas(expensesChartRef.current, chartOptions);

    if (salesCanvas && expensesCanvas) {
      const salesImgWidth = (pageWidth / 2) - 50;
      const salesImgHeight = (salesCanvas.height * salesImgWidth) / salesCanvas.width;
      const expensesImgWidth = (pageWidth / 2) - 50;
      const expensesImgHeight = (expensesCanvas.height * expensesImgWidth) / expensesCanvas.width;

      if(y + Math.max(salesImgHeight, expensesImgHeight) > pageHeight - 40) {
          doc.addPage();
          y = 40;
      }

      doc.addImage(salesCanvas.toDataURL('image/png'), 'PNG', 40, y, salesImgWidth, salesImgHeight);
      doc.addImage(expensesCanvas.toDataURL('image/png'), 'PNG', pageWidth / 2 + 10, y, expensesImgWidth, expensesImgHeight);
      y += Math.max(salesImgHeight, expensesImgHeight) + 30;
    }

    // Top Lists
    const customerSales = filteredData.sales.reduce((acc, sale) => {
        if (!sale.customerId || sale.customerId === "walk-in") return acc;
        if (!acc[sale.customerId]) {
          acc[sale.customerId] = { name: sale.customerName, salesCount: 0, totalSpent: 0 };
        }
        acc[sale.customerId].salesCount += 1;
        acc[sale.customerId].totalSpent += sale.total;
        return acc;
    }, {} as Record<string, { name: string; salesCount: number; totalSpent: number }>);
    
    const topCustomers = Object.values(customerSales).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
    
    const productSales = filteredData.sales.reduce((acc, sale) => {
        if (!acc[sale.productId]) {
          acc[sale.productId] = { name: sale.productName, unitsSold: 0, revenue: 0 };
        }
        acc[sale.productId].unitsSold += sale.quantity;
        acc[sale.productId].revenue += sale.total;
        return acc;
      }, {} as Record<string, { name: string; unitsSold: number; revenue: number }>);

    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    if (y + 150 > pageHeight - 40) { // Estimate space needed
        doc.addPage();
        y = 40;
    }

    autoTable(doc, {
        head: [['Top-Selling Products', 'Units Sold', 'Revenue']],
        body: topProducts.map(p => [p.name, p.unitsSold, formatCurrency(p.revenue)]),
        startY: y,
        margin: { left: 40, right: pageWidth / 2 + 10 },
        headStyles: { fillColor: [30, 30, 47] },
    });
    
    autoTable(doc, {
        head: [['Top Customers', 'Purchases', 'Total Spent']],
        body: topCustomers.map(c => [c.name, c.salesCount, formatCurrency(c.totalSpent)]),
        startY: y,
        margin: { left: pageWidth / 2 + 10, right: 40 },
        headStyles: { fillColor: [30, 30, 47] },
    });

    doc.save("business_report.pdf");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <div className="flex items-center gap-2">
          <DateRangePicker date={date} setDate={setDate} />
          <Button onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <div ref={aiSummaryRef}>
        <AiSummary
          filteredSales={filteredData.sales}
          filteredExpenses={filteredData.expenses}
          dateRange={date}
        />
      </div>
      
      <div ref={overviewCardsRef}>
        <OverviewCards sales={filteredData.sales} expenses={filteredData.expenses} customers={customers} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div ref={salesChartRef}>
            {date?.from && date?.to && <SalesOverTimeChart sales={filteredData.sales} dateRange={{ from: date.from, to: date.to }} />}
        </div>
        <div ref={expensesChartRef}>
            <ExpensesByCategoryChart expenses={filteredData.expenses} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProductsTable sales={filteredData.sales} />
        <TopCustomersTable sales={filteredData.sales} />
      </div>
    </div>
  );
}
