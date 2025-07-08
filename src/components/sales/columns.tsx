"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const ProfitBadge = ({ profit }: { profit: number }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" =
    "secondary";
  if (profit <= 0) variant = "destructive";
  return <Badge variant={variant}>{formatCurrency(profit)}</Badge>;
};

interface ColumnsProps {
  onPrint: (sale: Sale) => void;
}

export const columns = ({ onPrint }: ColumnsProps): ColumnDef<Sale>[] => [
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
    header: "Qty",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.total),
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => <ProfitBadge profit={row.original.profit} />,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <Button variant="ghost" size="icon" onClick={() => onPrint(sale)}>
          <Printer className="h-4 w-4" />
        </Button>
      );
    },
  },
];
