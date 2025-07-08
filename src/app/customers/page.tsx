
"use client";

import { useMemo } from "react";
import { useApp } from "@/contexts/app-context";
import { DataTable } from "@/components/customers/data-table";
import { columns } from "@/components/customers/columns";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { CustomerSummaryCards } from "@/components/customers/customer-summary-cards";
import type { Customer } from "@/lib/types";

export type AugmentedCustomer = Customer & {
  totalSpent: number;
  lastPurchaseDate: string | null;
};

export default function CustomersPage() {
  const { customers, sales, updateCustomer, translations } = useApp();

  const augmentedCustomers = useMemo(() => {
    return customers.map((customer) => {
      const customerSales = sales.filter((s) => s.customerId === customer.id);
      const totalSpent = customerSales.reduce((sum, s) => sum + s.total, 0);
      const lastPurchaseDate =
        customerSales.length > 0
          ? customerSales.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0].date
          : null;

      return {
        ...customer,
        totalSpent,
        lastPurchaseDate,
      };
    });
  }, [customers, sales]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {translations.customers}
        </h1>
        <div className="flex items-center gap-2">
            <CustomerDialog />
        </div>
      </div>
      
      <CustomerSummaryCards customers={customers} sales={sales} />

      <DataTable
        columns={columns({ onEdit: updateCustomer, translations })}
        data={augmentedCustomers}
      />
    </div>
  );
}
