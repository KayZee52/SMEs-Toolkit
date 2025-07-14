
"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ProductDialog } from "./product-dialog";
import { ReceiveStockDialog } from "./receive-stock-dialog";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";

const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock < 10) {
    return (
      <Badge variant="warning">
        Low Stock ({stock})
      </Badge>
    );
  }
  return <Badge variant="secondary">In Stock ({stock})</Badge>;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
   {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
        <div className="text-sm text-muted-foreground truncate max-w-xs">
            {row.original.description || "N/A"}
        </div>
    )
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <StockBadge stock={row.original.stock} />,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sell Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.price)}
      </div>
    ),
  },
  {
    accessorKey: "cost",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Avg. Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.cost)}
      </div>
    ),
  },
  {
    accessorKey: "lastUpdatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.lastUpdatedAt);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return (
        <div className="text-right">
          {formatDistanceToNow(date, { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          <ReceiveStockDialog product={product} />
          <ProductDialog product={product} />
        </div>
      );
    },
  },
];
