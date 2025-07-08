
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
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/app-context";
import type { Product } from "@/lib/types";
import { useState } from "react";
import { Edit, PlusCircle } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock must be a positive number"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  category: z.string().optional(),
  supplier: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  product?: Product;
}

export function ProductDialog({ product }: ProductDialogProps) {
  const { addProduct, updateProduct } = useApp();
  const [open, setOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: "",
      description: "",
      stock: 0,
      price: 0,
      cost: 0,
      category: "",
      supplier: "",
    },
  });
  
  // Reset form when dialog opens/closes or product changes
  useState(() => {
    form.reset(product);
  });


  const onSubmit = (data: ProductFormValues) => {
    if (product) {
      updateProduct({ ...product, ...data });
    } else {
      addProduct(data);
    }
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update the details of your product."
              : "Enter the details for the new product."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...form.register("stock")} />
              {form.formState.errors.stock && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.stock.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                {...form.register("cost")}
              />
              {form.formState.errors.cost && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cost.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input id="category" {...form.register("category")} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="supplier">Supplier (Optional)</Label>
                <Input id="supplier" {...form.register("supplier")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
