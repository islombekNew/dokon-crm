"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ProductData { name: string; category: string; quantity: number; revenue: number }

export default function TopProductsPage() {
  const [data, setData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/reports/top-products?from=${from}&to=${to}&limit=10`);
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Top mahsulotlar</h1><p className="text-muted-foreground">Eng ko'p sotilgan mahsulotlar</p></div>

      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1"><Label>Dan</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /></div>
        <div className="space-y-1"><Label>Gacha</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tushum bo'yicha TOP 10</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Yuklanmoqda...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="hsl(246, 83%, 58%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Jadval</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{formatCurrency(item.revenue)}</p>
                    <Badge variant="secondary" className="text-xs">{item.quantity} ta</Badge>
                  </div>
                </div>
              ))}
              {!isLoading && data.length === 0 && <p className="text-center text-muted-foreground py-8">Ma'lumot topilmadi</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
