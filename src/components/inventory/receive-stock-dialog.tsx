
"use client";

import { useForm } from "react-hook-form";
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
import { useApp } from "@/contexts/app-context";
import type { Product } from "@/lib/types";
import { useState } from "react";
import { PackagePlus } from "lucide-react";

const receiveStockSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  costPerUnit: z.coerce.number().min(0, "Cost must be a positive number"),
});

type ReceiveStockFormValues = z.infer<typeof receiveStockSchema>;

interface ReceiveStockDialogProps {
  product: Product;
}

export function ReceiveStockDialog({ product }: ReceiveStockDialogProps) {
  const { receiveStock } = useApp();
  const [open, setOpen] = useState(false);

  const form = useForm<ReceiveStockFormValues>({
    resolver: zodResolver(receiveStockSchema),
    defaultValues: {
      quantity: 1,
      costPerUnit: product.cost,
    },
  });

  const onSubmit = (data: ReceiveStockFormValues) => {
    receiveStock(product.id, data.quantity, data.costPerUnit);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PackagePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Receive Stock</DialogTitle>
          <DialogDescription>
            Add new stock for <strong>{product.name}</strong>. This will update the quantity and average cost.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Added</Label>
              <Input id="quantity" type="number" {...form.register("quantity")} />
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPerUnit">Cost/Unit</Label>
              <Input
                id="costPerUnit"
                type="number"
                step="0.01"
                {...form.register("costPerUnit")}
              />
              {form.formState.errors.costPerUnit && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.costPerUnit.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Stock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
