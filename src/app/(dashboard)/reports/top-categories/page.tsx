"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

interface CatData { name: string; quantity: number; revenue: number }

export default function TopCategoriesPage() {
  const [data, setData] = useState<CatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/reports/top-categories?from=${from}&to=${to}`);
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Top kategoriyalar</h1><p className="text-muted-foreground">Kategoriya bo'yicha sotuv tahlili</p></div>

      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1"><Label>Dan</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /></div>
        <div className="space-y-1"><Label>Gacha</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Doira diagramma</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Yuklanmoqda...</div>
            ) : data.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Ma'lumot yo'q</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="revenue" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Jadval</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} ta sotildi</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">{formatCurrency(item.revenue)}</span>
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
