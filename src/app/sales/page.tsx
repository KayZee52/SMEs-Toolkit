
"use client";

import { useApp } from "@/contexts/app-context";
import { DataTable } from "@/components/sales/data-table";
import { columns } from "@/components/sales/columns";
import { LogSaleDialog } from "@/components/sales/log-sale-dialog";
import { SalesSummaryCards } from "@/components/sales/sales-summary-cards";
import type { Sale } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";

export default function SalesPage() {
  const { sales, settings } = useApp();

  const handleExportReceipt = (sale: Sale) => {
    const doc = new jsPDF();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(settings.businessName, 14, 22);
    
    doc.setFontSize(14);
    doc.text("Receipt", 196, 22, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Sale ID: ${sale.id}`, 196, 28, { align: "right" });
    
    doc.line(14, 32, 196, 32);

    // Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Billed To", 14, 40);
    doc.setFont("helvetica", "bold");
    doc.text(sale.customerName, 14, 46);

    doc.setFont("helvetica", "normal");
    doc.text("Date of Issue", 196, 40, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(new Date(sale.date).toLocaleDateString(), 196, 46, { align: "right" });

    // Table
    autoTable(doc, {
        head: [['Product', 'Qty', 'Price/Unit', 'Total']],
        body: [[
          sale.productName,
          sale.quantity,
          formatCurrency(sale.pricePerUnit),
          formatCurrency(sale.total)
        ]],
        startY: 52,
        theme: 'striped',
        headStyles: { fillColor: [30, 30, 47] },
    });

    let finalY = (doc as any).lastAutoTable.finalY || 70;

    // Summary
    const summaryX = 150;
    const summaryRightX = 196;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", summaryX, finalY + 10, { align: "right" });
    doc.text(formatCurrency(sale.total), summaryRightX, finalY + 10, { align: "right" });
    
    doc.text("Tax (0%):", summaryX, finalY + 17, { align: "right" });
    doc.text(formatCurrency(0), summaryRightX, finalY + 17, { align: "right" });

    doc.line(summaryX - 10, finalY + 22, summaryRightX, finalY + 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", summaryX, finalY + 28, { align: "right" });
    doc.text(formatCurrency(sale.total), summaryRightX, finalY + 28, { align: "right" });

    let notesY = finalY + 40;
    
    // Notes
    if (sale.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Notes", 14, notesY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(sale.notes, 182);
      doc.text(splitNotes, 14, notesY + 6);
      notesY += (splitNotes.length * 5) + 10;
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for your business!", 105, notesY, { align: "center" });

    doc.save(`receipt_${sale.id}.pdf`);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Sales
          </h1>
          <LogSaleDialog />
        </div>

        <SalesSummaryCards />

        <DataTable columns={columns({ onExportReceipt: handleExportReceipt })} data={sales} />
      </div>
    </>
  );
}
