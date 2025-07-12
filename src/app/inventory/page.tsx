
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
import type { Product } from "@/lib/types";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* Row 1: Title and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Inventory
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="w-full md:w-auto"
            >
              All
            </Button>
            <Button
              variant={filter === "low" ? "default" : "outline"}
              onClick={() => setFilter("low")}
               className="w-full md:w-auto"
            >
              Low Stock
            </Button>
            <Button
              variant={filter === "out" ? "default" : "outline"}
              onClick={() => setFilter("out")}
               className="w-full md:w-auto"
            >
              Out of Stock
            </Button>
          </div>
        </div>

        {/* Row 2: Search and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:max-w-sm"
          />
          <div className="flex items-center gap-2">
            <BulkProductDialog />
            <ProductDialog />
          </div>
        </div>
      </div>

      <InventorySummaryCards />

      <DataTable columns={columns} data={filteredProducts} />
    </div>
  );
}
