"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
  debt: {
    customer: { name: string };
    totalAmount: number;
  };
  user: { name: string };
}

export default function PaymentsPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/payments?page=${page}&pageSize=20`);
    const result = await res.json();
    if (result.success) { setData(result.data || []); setTotal(result.pagination?.total || 0); }
    setIsLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPaid = data.reduce((s, p) => s + Number(p.amount), 0);

  const columns = [
    { key: "customer", header: "Mijoz", cell: (r: Payment) => <span className="font-medium">{r.debt?.customer?.name || "—"}</span> },
    { key: "amount", header: "To'lov summa", cell: (r: Payment) => <span className="font-semibold text-green-600">{formatCurrency(r.amount)}</span> },
    { key: "debt", header: "Umumiy qarz", cell: (r: Payment) => <span className="text-muted-foreground">{formatCurrency(r.debt?.totalAmount)}</span> },
    { key: "user", header: "Qabul qildi", cell: (r: Payment) => <span className="text-sm text-muted-foreground">{r.user?.name || "—"}</span> },
    { key: "note", header: "Izoh", cell: (r: Payment) => <span className="text-sm text-muted-foreground">{r.note || "—"}</span> },
    { key: "date", header: "Sana", cell: (r: Payment) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">To'lovlar</h1><p className="text-muted-foreground">Qarz to'lovlari tarixi</p></div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 p-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">Jami tushgan: <span className="font-bold text-lg">{formatCurrency(totalPaid)}</span></p>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="To'lovlar topilmadi" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />
    </div>
  );
}
