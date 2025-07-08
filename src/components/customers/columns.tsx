"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Customer } from "@/lib/types";

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => row.original.phone || "N/A",
  },
  {
    accessorKey: "createdAt",
    header: "Customer Since",
    cell: ({ row }) => formatDate(row.original.createdAt),
  }
];
