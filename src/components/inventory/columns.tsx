
"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ProductDialog } from "./product-dialog";
import { ReceiveStockDialog } from "./receive-stock-dialog";
import { formatDistanceToNow } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock < 10) {
    return <Badge variant="outline" className="border-amber-500 text-amber-500">Low Stock ({stock})</Badge>;
  }
  return <Badge variant="secondary">In Stock ({stock})</Badge>;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "stock",
    header: "Status",
    cell: ({ row }) => <StockBadge stock={row.original.stock} />,
  },
  {
    accessorKey: "price",
    header: "Sell Price",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "cost",
    header: "Avg. Cost",
    cell: ({ row }) => formatCurrency(row.original.cost),
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = new Date(row.original.lastUpdatedAt);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2">
            <ReceiveStockDialog product={product} />
            <ProductDialog product={product} />
        </div>
      );
    },
  },
];
