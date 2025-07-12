
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, PackagePlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BulkAddProductFormValues } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  stock: z.coerce.number().int().min(0).default(0),
  price: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0).default(0),
  category: z.string().optional(),
  supplier: z.string().optional(),
  description: z.string().optional(),
});

const bulkProductSchema = z.object({
  products: z.array(productSchema).min(1, "You must add at least one product."),
});

type BulkProductForm = z.infer<typeof bulkProductSchema>;

const defaultRowValues: BulkAddProductFormValues = {
  name: "",
  stock: 0,
  price: 0,
  cost: 0,
  category: "",
  supplier: "",
  description: "",
};

export function BulkProductDialog() {
  const { addMultipleProducts } = useApp();
  const [open, setOpen] = useState(false);

  const form = useForm<BulkProductForm>({
    resolver: zodResolver(bulkProductSchema),
    defaultValues: {
      products: [defaultRowValues],
    },
  });

  const { control, handleSubmit, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  useEffect(() => {
    if (open) {
      reset({ products: [defaultRowValues] });
    }
  }, [open, reset]);

  const onSubmit = (data: BulkProductForm) => {
    addMultipleProducts(data.products);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackagePlus className="mr-2 h-4 w-4" /> Bulk Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Bulk Add Products</DialogTitle>
          <DialogDescription>
            Add multiple products to your inventory at once.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        placeholder="Product Name"
                        {...form.register(`products.${index}.name`)}
                      />
                       {form.formState.errors.products?.[index]?.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.products[index]?.name?.message}</p>}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        {...form.register(`products.${index}.stock`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register(`products.${index}.price`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register(`products.${index}.cost`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {form.formState.errors.products?.root && <p className="text-sm text-destructive mt-2">{form.formState.errors.products.root.message}</p>}

          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultRowValues)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Row
          </Button>

          <DialogFooter>
            <Button type="submit">Save All Products</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
