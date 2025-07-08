
"use client";

import { useApp } from "@/contexts/app-context";
import { DataTable } from "@/components/expenses/data-table";
import { columns } from "@/components/expenses/columns";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpensesSummaryCards } from "@/components/expenses/expenses-summary-cards";

export default function ExpensesPage() {
  const { expenses } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Expenses
        </h1>
        <ExpenseDialog />
      </div>

      <ExpensesSummaryCards />

      <DataTable columns={columns} data={expenses} />
    </div>
  );
}
