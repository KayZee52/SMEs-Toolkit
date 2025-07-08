
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import type { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { ExpenseDialog } from "./expense-dialog";

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "PPP");
};

const DeleteConfirmation = ({ expenseId }: { expenseId: string }) => {
  const { deleteExpense } = useApp();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            expense record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={() => deleteExpense(expenseId)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "description",
    header: "Title",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.description}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.amount)}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground truncate max-w-xs">
        {row.original.notes || "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          <ExpenseDialog expense={expense} />
          <DeleteConfirmation expenseId={expense.id} />
        </div>
      );
    },
  },
];
