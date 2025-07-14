
"use client";

import { useState } from "react";
import { useApp } from "@/contexts/app-context";
import { DataTable } from "@/components/inventory/data-table";
import { columns } from "@/components/inventory/columns";
import { ProductDialog } from "@/components/inventory/product-dialog";
import { BulkProductDialog } from "@/components/inventory/bulk-product-dialog";
import { InventorySummaryCards } from "@/components/inventory/inventory-summary-cards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { format } from "date-fns";

export default function InventoryPage() {
  const { products } = useApp();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products
    .filter((product) => {
      if (filter === "all") return true;
      if (filter === "low") return product.stock > 0 && product.stock < 10;
      if (filter === "out") return product.stock === 0;
      return true;
    })
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "Stock", "Sell Price", "Avg. Cost", "Category", "Last Updated"];
    const tableRows: (string | number)[][] = [];

    filteredProducts.forEach((product) => {
      const productData = [
        product.name,
        product.stock,
        formatCurrency(product.price),
        formatCurrency(product.cost),
        product.category || "N/A",
        format(new Date(product.lastUpdatedAt), "PPP"),
      ];
      tableRows.push(productData);
    });

    doc.text("Inventory Report", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`inventory_report_${new Date().toISOString()}.pdf`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight shrink-0">
          Inventory
        </h1>

        <div className="flex flex-1 items-center justify-center gap-2 min-w-[300px] md:min-w-[400px]">
           <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
           <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "low" ? "default" : "outline"}
              onClick={() => setFilter("low")}
            >
              Low
            </Button>
            <Button
              variant={filter === "out" ? "default" : "outline"}
              onClick={() => setFilter("out")}
            >
              Out
            </Button>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={handleExportPdf}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <BulkProductDialog />
            <ProductDialog />
        </div>
      </div>

      <InventorySummaryCards />

      <DataTable columns={columns} data={filteredProducts} searchTerm={searchTerm} />
    </div>
  );
}
