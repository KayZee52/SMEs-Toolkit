"use client";

import { useApp } from "@/contexts/app-context";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ProductDialog } from "./product-dialog";

export default function InventoryPage() {
  const { products } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Inventory
        </h1>
        <ProductDialog />
      </div>
      <DataTable columns={columns} data={products} />
    </div>
  );
}
