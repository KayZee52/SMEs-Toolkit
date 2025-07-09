
"use client";

import { useMemo } from "react";
import { useApp } from "@/contexts/app-context";
import type { Sale, Expense } from "@/lib/types";
import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
import { TransactionsSummaryCards } from "@/components/transactions/summary-cards";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

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

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ["Type", "Date", "Description", "Amount"];
    const tableRows: (string | number)[][] = [];

    allTransactions.forEach((transaction) => {
      const date = format(new Date(transaction.date), "PPP p");
      
      const description = transaction.type === 'Sale' 
        ? `${transaction.quantity}x ${transaction.productName} to ${transaction.customerName}` 
        : transaction.description;
      
      const amountRaw = transaction.type === 'Sale' ? transaction.total : transaction.amount;
      const amount = transaction.type === 'Sale' 
        ? `+ ${formatCurrency(amountRaw)}` 
        : `- ${formatCurrency(amountRaw)}`;

      const transactionData = [
        transaction.type,
        date,
        description,
        amount,
      ];
      tableRows.push(transactionData);
    });

    doc.text("Transactions Log", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("transactions_log.pdf");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Transactions Log
        </h1>
        <Button onClick={handleExportPdf}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <TransactionsSummaryCards sales={sales} expenses={expenses} />

      <DataTable columns={columns} data={allTransactions} />
    </div>
  );
}
