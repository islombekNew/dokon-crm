"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface BrandData { name: string; quantity: number; revenue: number }

export default function TopBrandsPage() {
  const [data, setData] = useState<BrandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/reports/top-brands?from=${from}&to=${to}`);
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Top brendlar</h1><p className="text-muted-foreground">Brend bo'yicha sotuv tahlili</p></div>

      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1"><Label>Dan</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /></div>
        <div className="space-y-1"><Label>Gacha</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /></div>
      </div>

      <Card>
        <CardHeader><CardTitle>Tushum bo'yicha brendlar</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="h-64 flex items-center justify-center text-muted-foreground">Yuklanmoqda...</div> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), "Tushum"]} />
                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((b, i) => (
          <Card key={b.name} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
                <Badge variant="secondary">{b.quantity} ta</Badge>
              </div>
              <p className="font-bold">{b.name}</p>
              <p className="text-xl font-black text-primary">{formatCurrency(b.revenue)}</p>
            </CardContent>
          </Card>
        ))}
        {!isLoading && data.length === 0 && <p className="text-muted-foreground py-8">Ma'lumot topilmadi</p>}
      </div>
    </div>
  );
}
