
"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="font-medium">{row.original.description}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
];
