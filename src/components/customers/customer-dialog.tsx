
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
import type { Customer } from "@/lib/types";
import { useState } from "react";
import { Edit, UserPlus } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["Regular", "VIP", "Debtor"]).default("Regular"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerDialogProps {
  customer?: Customer;
  onSave?: (data: Customer) => void;
}

export function CustomerDialog({ customer, onSave }: CustomerDialogProps) {
  const { addCustomer, updateCustomer } = useApp();
  const [open, setOpen] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      name: "",
      phone: "",
      notes: "",
      type: "Regular",
    },
  });

  useState(() => {
    form.reset(customer || { name: "", phone: "", notes: "", type: "Regular" });
  });

  const onSubmit = (data: CustomerFormValues) => {
    if (customer) {
        const updatedData = { ...customer, ...data };
        if (onSave) {
            onSave(updatedData);
        } else {
            updateCustomer(updatedData);
        }
    } else {
      addCustomer(data);
    }
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customer ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Update the details for this customer."
              : "Enter the details for the new customer."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Customer Type</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Debtor">Debtor</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
