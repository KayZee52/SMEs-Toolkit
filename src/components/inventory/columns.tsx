"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ProductDialog } from "./product-dialog";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

const StockBadge = ({ stock }: { stock: number }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    if (stock < 10) variant = "destructive";
    else if (stock < 20) variant = "outline";
    return <Badge variant={variant}>{stock} in stock</Badge>
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => <StockBadge stock={row.original.stock} />,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => formatCurrency(row.original.cost),
  },
  {
      id: "actions",
      cell: ({ row }) => {
          const product = row.original;
          return <ProductDialog product={product} />
      }
  }
];
