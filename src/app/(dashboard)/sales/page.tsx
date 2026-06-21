"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; variant: any }> = {
  COMPLETED: { label: "Yakunlangan", variant: "success" },
  PENDING: { label: "Kutilmoqda", variant: "warning" },
  CANCELLED: { label: "Bekor qilingan", variant: "destructive" },
  RETURNED: { label: "Qaytarilgan", variant: "secondary" },
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Naqd", CARD: "Karta", TRANSFER: "O'tkazma", MIXED: "Aralash", DEBT: "Qarz",
};

interface Sale {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paidAmount: number;
  paymentType: string;
  status: string;
  createdAt: string;
  customer: { name: string } | null;
  user: { name: string };
  items: any[];
}

export default function SalesPage() {
  const router = useRouter();
  const [data, setData] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/sales?${params}`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination.total); }
    setIsLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    {
      key: "saleNumber",
      header: "Sotuv raqami",
      cell: (r: Sale) => <span className="font-mono font-medium">{r.saleNumber}</span>,
    },
    {
      key: "customer",
      header: "Mijoz",
      cell: (r: Sale) => r.customer?.name || <span className="text-muted-foreground">Noma'lum</span>,
    },
    {
      key: "items",
      header: "Mahsulotlar",
      cell: (r: Sale) => <span className="text-muted-foreground">{r.items.length} ta</span>,
    },
    {
      key: "amount",
      header: "Summa",
      cell: (r: Sale) => (
        <div>
          <p className="font-semibold">{formatCurrency(r.totalAmount)}</p>
          {Number(r.totalAmount) !== Number(r.paidAmount) && (
            <p className="text-xs text-red-500">To'langan: {formatCurrency(r.paidAmount)}</p>
          )}
        </div>
      ),
    },
    {
      key: "payment",
      header: "To'lov",
      cell: (r: Sale) => <Badge variant="outline">{PAYMENT_LABELS[r.paymentType] || r.paymentType}</Badge>,
    },
    {
      key: "status",
      header: "Holat",
      cell: (r: Sale) => {
        const s = STATUS_LABELS[r.status] || { label: r.status, variant: "outline" };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "seller",
      header: "Sotuvchi",
      cell: (r: Sale) => <span className="text-sm text-muted-foreground">{r.user.name}</span>,
    },
    { key: "date", header: "Sana", cell: (r: Sale) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (r: Sale) => (
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); router.push(`/sales/${r.id}`); }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sotuvlar</h1>
          <p className="text-muted-foreground">Jami: {total} ta sotuv</p>
        </div>
        <Link href="/pos">
          <Button>Yangi sotuv (POS)</Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Sotuv raqami yoki mijoz..."
          className="max-w-sm"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Barcha holatlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha holatlar</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Sotuv topilmadi" onRowClick={(r) => router.push(`/sales/${r.id}`)} />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />
    </div>
  );
}
