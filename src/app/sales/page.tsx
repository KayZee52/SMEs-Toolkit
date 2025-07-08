"use client";

import { useApp } from "@/contexts/app-context";
import { DataTable } from "@/components/sales/data-table";
import { columns } from "@/components/sales/columns";
import { LogSaleDialog } from "@/components/sales/log-sale-dialog";

export default function SalesPage() {
  const { sales } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Sales
        </h1>
        <LogSaleDialog />
      </div>
      <DataTable columns={columns} data={sales} />
    </div>
  );
}
