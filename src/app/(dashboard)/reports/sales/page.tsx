"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ShoppingCart } from "lucide-react";

export default function SalesReportPage() {
  const [data, setData] = useState<{ date: string; revenue: number; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState<"day" | "month">("day");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ from, to, groupBy });
    const res = await fetch(`/api/reports/sales?${params}`);
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, [from, to, groupBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalSales = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sotuvlar hisoboti</h1>
        <p className="text-muted-foreground">Tushum va sotuvlar dinamikasi</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>Dan</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1">
          <Label>Gacha</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
        <div className="flex gap-2">
          <Button variant={groupBy === "day" ? "default" : "outline"} size="sm" onClick={() => setGroupBy("day")}>Kunlik</Button>
          <Button variant={groupBy === "month" ? "default" : "outline"} size="sm" onClick={() => setGroupBy("month")}>Oylik</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100"><TrendingUp className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Jami tushum</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"><ShoppingCart className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Jami sotuvlar</p>
              <p className="text-2xl font-bold">{totalSales.toLocaleString()} ta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tushum grafigi</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Yuklanmoqda...</div>
          ) : data.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Ma'lumot topilmadi</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Tushum"]} />
                <Bar dataKey="revenue" fill="hsl(246, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sotuvlar soni</CardTitle></CardHeader>
        <CardContent>
          {!isLoading && data.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [value + " ta", "Sotuvlar"]} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
