
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/app-context";
import type { Expense } from "@/lib/types";
import { useState, useEffect } from "react";
import { PlusCircle, Edit } from "lucide-react";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const expenseCategories = [
  "Rent",
  "Transportation",
  "Supplies",
  "Utilities",
  "Salaries",
  "Office",
  "Other",
];

interface ExpenseDialogProps {
  expense?: Expense;
}

export function ExpenseDialog({ expense }: ExpenseDialogProps) {
  const { addExpense, updateExpense } = useApp();
  const [open, setOpen] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense || {
      description: "",
      category: "",
      amount: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        expense || { description: "", category: "", amount: 0, notes: "" }
      );
    }
  }, [open, expense, form]);

  const onSubmit = (data: ExpenseFormValues) => {
    if (expense) {
      updateExpense({ ...expense, ...data });
    } else {
      addExpense(data);
    }
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {expense ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Log Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {expense ? "Edit Expense" : "Log New Expense"}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? "Update the details for this business expense."
              : "Enter the details for the new business expense."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Title</Label>
            <Input id="description" {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit">
              {expense ? "Save Changes" : "Log Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
