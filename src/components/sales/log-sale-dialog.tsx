
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
import { useState, useEffect, useMemo } from "react";
import { PlusCircle, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { LogSaleFormValues } from "@/lib/types";

const saleSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  customerName: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  pricePerUnit: z.coerce.number().min(0, "Price must be a positive number"),
  notes: z.string().optional(),
});


export function LogSaleDialog() {
  const { products, customers, addSale } = useApp();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const form = useForm<LogSaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
      customerName: "",
      productId: "",
      pricePerUnit: 0,
    },
  });

  const selectedProductId = form.watch("productId");

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId);
      if (product) {
        form.setValue("pricePerUnit", product.price);
      }
    }
  }, [selectedProductId, products, form]);

  useEffect(() => {
    if (!open) {
        form.reset({
            productId: "",
            customerName: "",
            quantity: 1,
            notes: "",
            pricePerUnit: 0,
        });
        setCustomerSearch("");
    }
  }, [open, form]);

  const onSubmit = (data: LogSaleFormValues) => {
    addSale(data);
    setOpen(false);
  };
  
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
  }, [customerSearch, customers]);

  const showAddNewCustomer = useMemo(() => {
    const trimmedSearch = customerSearch.trim();
    if (!trimmedSearch) return false;
    return !customers.some(c => c.name.toLowerCase() === trimmedSearch.toLowerCase());
  }, [customerSearch, customers]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Log Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Log New Sale</DialogTitle>
          <DialogDescription>
            Enter the details for the new sale transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Controller
              control={form.control}
              name="productId"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.productId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.productId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Customer (Optional)</Label>
            <Controller
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <Popover open={popoverOpen} onOpenChange={(isOpen) => {
                  setPopoverOpen(isOpen);
                  if(isOpen) {
                    setCustomerSearch(field.value || "");
                  }
                }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full justify-between font-normal"
                    >
                      {field.value || "Select or type customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search or add customer..."
                        value={customerSearch}
                        onValueChange={setCustomerSearch}
                      />
                       <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value=""
                                onSelect={() => {
                                    field.onChange("");
                                    setPopoverOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    !field.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                Walk-in Customer
                            </CommandItem>
                          {filteredCustomers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                field.onChange(customer.name);
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === customer.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {customer.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {showAddNewCustomer && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        value={customerSearch.trim()}
                                        onSelect={() => {
                                            field.onChange(customerSearch.trim());
                                            setPopoverOpen(false);
                                        }}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        <span>Add "{customerSearch.trim()}"</span>
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                {...form.register("quantity")}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">Price/Unit</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="0.01"
                {...form.register("pricePerUnit")}
              />
              {form.formState.errors.pricePerUnit && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.pricePerUnit.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit">Log Sale</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
