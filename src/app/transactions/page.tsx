
"use client";

import { useMemo } from "react";
import { useApp } from "@/contexts/app-context";
import type { Sale, Expense } from "@/lib/types";
import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
import { TransactionsSummaryCards } from "@/components/transactions/summary-cards";

type Transaction = 
  | ({ type: 'Sale' } & Sale)
  | ({ type: 'Expense' } & Expense);


export default function TransactionsPage() {
  const { sales, expenses } = useApp();

  const allTransactions = useMemo(() => {
    const combined: Transaction[] = [
      ...sales.map(s => ({ ...s, type: 'Sale' as const })),
      ...expenses.map(e => ({ ...e, type: 'Expense' as const }))
    ];

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [sales, expenses]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Transactions Log
        </h1>
      </div>

      <TransactionsSummaryCards sales={sales} expenses={expenses} />

      <DataTable columns={columns} data={allTransactions} />
    </div>
  );
}
