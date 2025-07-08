"use client";

import { useApp } from "@/contexts/app-context";
import { DataTable } from "@/components/customers/data-table";
import { columns } from "@/components/customers/columns";

export default function CustomersPage() {
  const { customers } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Customers
        </h1>
      </div>
      <DataTable columns={columns} data={customers} />
    </div>
  );
}
