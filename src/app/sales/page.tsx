"use client";

import { useState } from "react";
import { useApp } from "@/contexts/app-context";
import { DataTable } from "@/components/sales/data-table";
import { columns } from "@/components/sales/columns";
import { LogSaleDialog } from "@/components/sales/log-sale-dialog";
import { SalesSummaryCards } from "@/components/sales/sales-summary-cards";
import type { Sale } from "@/lib/types";
import { PrintableReceipt } from "@/components/sales/printable-receipt";

export default function SalesPage() {
  const { sales } = useApp();
  const [saleToPrint, setSaleToPrint] = useState<Sale | null>(null);

  const handlePrint = (sale: Sale) => {
    setSaleToPrint(sale);
    // Use a timeout to ensure state is updated before printing
    setTimeout(() => {
      window.print();
      setSaleToPrint(null);
    }, 100);
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

        <DataTable columns={columns({ onPrint: handlePrint })} data={sales} />
      </div>
      {saleToPrint && <PrintableReceipt sale={saleToPrint} />}
    </>
  );
}
