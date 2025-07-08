"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Sale } from "@/lib/types";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
}

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "pricePerUnit",
    header: "Price/Unit",
    cell: ({ row }) => formatCurrency(row.original.pricePerUnit),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.total),
  },
  {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
  }
];
