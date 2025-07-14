
"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Sale, Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

type Transaction = 
  | ({ type: 'Sale' } & Sale)
  | ({ type: 'Expense' } & Expense);

const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP p");
  };

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.type;
            return <Badge variant={type === 'Sale' ? 'secondary' : 'outline'}>{type}</Badge>
        }
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <div className="font-medium">
                    {transaction.type === 'Sale' ? `${transaction.quantity}x ${transaction.productName}` : transaction.description}
                    {transaction.type === 'Sale' && <div className="text-sm text-muted-foreground">to {transaction.customerName}</div>}
                </div>
            )
        }
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const transaction = row.original;
            const isSale = transaction.type === 'Sale';
            const amount = isSale ? transaction.total : transaction.amount;
            
            return <Badge variant={isSale ? "success" : "destructive"}>{isSale ? '+' : '-'}{formatCurrency(amount)}</Badge>
        }
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.date),
    },
];
