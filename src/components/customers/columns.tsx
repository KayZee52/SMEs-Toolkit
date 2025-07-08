
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import type { Customer } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { CustomerDialog } from "./customer-dialog";

export type AugmentedCustomer = Customer & {
  totalSpent: number;
  lastPurchaseDate: string | null;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const DebtBadge = ({ type }: { type?: string }) => {
  if (type === "Debtor") {
    return <Badge variant="destructive">Has Debt</Badge>;
  }
  return <Badge variant="secondary">No Debt</Badge>;
};

interface ColumnsProps {
    onEdit: (customer: Customer) => void;
}

export const columns = ({ onEdit }: ColumnsProps): ColumnDef<AugmentedCustomer>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
    )
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => row.original.phone || "N/A",
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => formatCurrency(row.original.totalSpent),
  },
  {
    accessorKey: "lastPurchaseDate",
    header: "Last Purchase",
    cell: ({ row }) => {
      const { lastPurchaseDate } = row.original;
      if (!lastPurchaseDate) return "N/A";
      return formatDistanceToNow(new Date(lastPurchaseDate), { addSuffix: true });
    },
  },
  {
    accessorKey: "type",
    header: "Debt Status",
    cell: ({ row }) => <DebtBadge type={row.original.type} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
        const customer = row.original;
        return (
            <CustomerDialog customer={customer} onSave={onEdit} />
        );
    }
  },
];
