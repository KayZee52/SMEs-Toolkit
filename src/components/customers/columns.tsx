
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import type { Customer } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { CustomerDialog } from "./customer-dialog";
import type { Translation } from "@/lib/i18n";

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

const DebtBadge = ({ type, translations }: { type?: string; translations: Translation }) => {
  if (type === "Debtor") {
    return <Badge variant="destructive">{translations.hasDebt}</Badge>;
  }
  return <Badge variant="secondary">{translations.noDebt}</Badge>;
};

interface ColumnsProps {
    onEdit: (customer: Customer) => void;
    translations: Translation;
}

export const columns = ({ onEdit, translations }: ColumnsProps): ColumnDef<AugmentedCustomer>[] => [
  {
    accessorKey: "name",
    header: translations.name,
    cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
    )
  },
  {
    accessorKey: "phone",
    header: translations.phoneNumber,
    cell: ({ row }) => row.original.phone || "N/A",
  },
  {
    accessorKey: "totalSpent",
    header: translations.totalSpent,
    cell: ({ row }) => formatCurrency(row.original.totalSpent),
  },
  {
    accessorKey: "lastPurchaseDate",
    header: translations.lastPurchase,
    cell: ({ row }) => {
      const { lastPurchaseDate } = row.original;
      if (!lastPurchaseDate) return "N/A";
      const date = new Date(lastPurchaseDate);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    },
  },
  {
    accessorKey: "type",
    header: translations.debtStatus,
    cell: ({ row }) => <DebtBadge type={row.original.type} translations={translations} />,
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
