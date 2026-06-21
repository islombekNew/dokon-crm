"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPE_LABELS: Record<string, { label: string; variant: any }> = {
  IN: { label: "Kirim", variant: "success" },
  OUT: { label: "Chiqim", variant: "destructive" },
  TRANSFER: { label: "O'tkazma", variant: "info" },
  SALE: { label: "Sotuv", variant: "secondary" },
  RETURN: { label: "Qaytarish", variant: "warning" },
  ADJUSTMENT: { label: "Tuzatish", variant: "outline" },
};

interface Movement {
  id: string;
  type: string;
  quantity: number;
  unitCost: number | null;
  createdAt: string;
  note: string | null;
  variant: { product: { name: string }; size?: { name: string } | null; color?: { name: string } | null };
  fromWarehouse?: { name: string } | null;
  toWarehouse?: { name: string } | null;
}

export default function MovementsPage() {
  const [data, setData] = useState<Movement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (type) params.set("type", type);
    const res = await fetch(`/api/stock-movements?${params}`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination.total); }
    setIsLoading(false);
  }, [page, type]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    {
      key: "type",
      header: "Tur",
      cell: (r: Movement) => {
        const t = TYPE_LABELS[r.type] || { label: r.type, variant: "outline" };
        return <Badge variant={t.variant}>{t.label}</Badge>;
      },
    },
    {
      key: "product",
      header: "Mahsulot",
      cell: (r: Movement) => (
        <div>
          <p className="font-medium text-sm">{r.variant.product.name}</p>
          <p className="text-xs text-muted-foreground">{[r.variant.size?.name, r.variant.color?.name].filter(Boolean).join(" / ")}</p>
        </div>
      ),
    },
    { key: "quantity", header: "Miqdor", cell: (r: Movement) => <span className="font-medium">{r.quantity} ta</span> },
    {
      key: "warehouse",
      header: "Ombor",
      cell: (r: Movement) => (
        <span className="text-sm text-muted-foreground">
          {r.fromWarehouse?.name && `${r.fromWarehouse.name} → `}{r.toWarehouse?.name || r.fromWarehouse?.name || "—"}
        </span>
      ),
    },
    { key: "cost", header: "Tannarx", cell: (r: Movement) => r.unitCost ? formatCurrency(r.unitCost) : "—" },
    { key: "date", header: "Sana", cell: (r: Movement) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
    { key: "note", header: "Izoh", cell: (r: Movement) => <span className="text-sm text-muted-foreground">{r.note || "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ombor harakatlari</h1>
        <p className="text-muted-foreground">Barcha kirim/chiqim operatsiyalari</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={type} onValueChange={(v) => { setType(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Barcha turlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            {Object.entries(TYPE_LABELS).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Harakat topilmadi" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />
    </div>
  );
}
