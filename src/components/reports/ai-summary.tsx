
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, AlertTriangle } from "lucide-react";
import { getReportSummary } from "@/actions/ai";
import { useApp } from "@/contexts/app-context";
import type { Sale, Expense } from "@/lib/types";

interface AiSummaryProps {
  filteredSales: Sale[];
  filteredExpenses: Expense[];
  dateRange: { from: Date; to: Date } | undefined;
}

export function AiSummary({ filteredSales, filteredExpenses, dateRange }: AiSummaryProps) {
  const { products } = useApp();
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const generateSummary = async () => {
      setIsLoading(true);
      setError("");
      setSummary("");

      const res = await getReportSummary({
        sales: filteredSales,
        expenses: filteredExpenses,
        products,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        },
      });

      if (res.success && res.data?.summary) {
        setSummary(res.data.summary);
      } else {
        setError(res.error || "Failed to generate summary.");
      }
      setIsLoading(false);
    };

    // Debounce the call to avoid rapid firing on date change
    const handler = setTimeout(() => {
      generateSummary();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filteredSales, filteredExpenses, products, dateRange]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <div>
            <CardTitle className="font-headline">AI-Powered Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {error && (
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
            </div>
        )}
        {!isLoading && !error && summary && (
            <p className="text-sm text-muted-foreground">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}
