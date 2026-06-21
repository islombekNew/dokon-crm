"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";

interface ProfitData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  salesCount: number;
}

export default function ProfitReportPage() {
  const [data, setData] = useState<ProfitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/reports/profit?from=${from}&to=${to}`);
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Yuklanmoqda...</div>;

  const stats = data ? [
    { title: "Jami tushum", value: formatCurrency(data.totalRevenue), icon: DollarSign, color: "text-green-600 bg-green-100" },
    { title: "Tannarx", value: formatCurrency(data.totalCost), icon: TrendingDown, color: "text-orange-600 bg-orange-100" },
    { title: "Yalpi foyda", value: formatCurrency(data.grossProfit), icon: TrendingUp, color: data.grossProfit >= 0 ? "text-blue-600 bg-blue-100" : "text-red-600 bg-red-100" },
    { title: "Xarajatlar", value: formatCurrency(data.totalExpenses), icon: Receipt, color: "text-purple-600 bg-purple-100" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Foyda hisoboti</h1>
        <p className="text-muted-foreground">Daromad va xarajatlar tahlili</p>
      </div>

      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1"><Label>Dan</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /></div>
        <div className="space-y-1"><Label>Gacha</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /></div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.title}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && (
        <Card className={`border-2 ${data.netProfit >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">Sof foyda</p>
            <p className={`text-5xl font-black ${data.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
              {formatCurrency(data.netProfit)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{data.salesCount} ta sotuv asosida</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
