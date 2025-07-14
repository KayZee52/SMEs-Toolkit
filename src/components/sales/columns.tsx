
"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const ProfitBadge = ({ profit }: { profit: number }) => {
  return <Badge variant={profit > 0 ? "success" : (profit < 0 ? "destructive" : "secondary")}>{formatCurrency(profit)}</Badge>;
};

interface ColumnsProps {
  onExportReceipt: (sale: Sale) => void;
}

export const columns = ({ onExportReceipt }: ColumnsProps): ColumnDef<Sale>[] => [
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
        <Button variant="ghost" size="icon" onClick={() => onExportReceipt(sale)}>
          <Download className="h-4 w-4" />
        </Button>
      );
    },
  },
];
