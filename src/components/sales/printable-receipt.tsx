"use client";

import type { Sale } from "@/lib/types";
import { Bot } from "lucide-react";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

export function PrintableReceipt({ sale }: { sale: Sale }) {
  return (
    <div className="printable-area hidden">
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 p-2 rounded-lg">
              <Bot className="text-white" />
            </div>
            <h1 className="font-headline text-2xl font-semibold text-gray-800">SMEs Toolkit</h1>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">Receipt</h2>
            <p className="text-sm text-gray-500">Sale ID: {sale.id}</p>
          </div>
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4 border-b pb-8">
          <div>
            <h3 className="mb-2 font-semibold text-gray-600">Billed To</h3>
            <p className="text-gray-800">{sale.customerName}</p>
          </div>
          <div className="text-right">
            <h3 className="mb-2 font-semibold text-gray-600">Date of Issue</h3>
            <p className="text-gray-800">{new Date(sale.date).toLocaleDateString()}</p>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 font-semibold text-gray-600">Product</th>
              <th className="py-2 text-center font-semibold text-gray-600">Qty</th>
              <th className="py-2 text-right font-semibold text-gray-600">Price/Unit</th>
              <th className="py-2 text-right font-semibold text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-4">{sale.productName}</td>
              <td className="py-4 text-center">{sale.quantity}</td>
              <td className="py-4 text-right">{formatCurrency(sale.pricePerUnit)}</td>
              <td className="py-4 text-right">{formatCurrency(sale.total)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-8 flex justify-end border-t pt-4">
            <div className="w-full max-w-xs text-right">
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(sale.total)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Tax (0%):</span>
                    <span>{formatCurrency(0)}</span>
                </div>
                 <div className="mt-2 flex justify-between border-t pt-2">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-lg font-bold">{formatCurrency(sale.total)}</span>
                </div>
            </div>
        </div>
        {sale.notes && (
            <div className="mt-8 border-t pt-4">
                <h3 className="mb-2 font-semibold text-gray-600">Notes</h3>
                <p className="text-sm text-gray-500">{sale.notes}</p>
            </div>
        )}
        <div className="mt-12 text-center text-sm text-gray-400">
            <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
