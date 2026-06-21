"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; variant: any }> = {
  ACTIVE: { label: "Faol", variant: "warning" },
  PAID: { label: "To'langan", variant: "success" },
  OVERDUE: { label: "Muddati o'tgan", variant: "destructive" },
  CANCELLED: { label: "Bekor qilingan", variant: "secondary" },
};

interface Debt {
  id: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  status: string;
  isOverdue: boolean;
  createdAt: string;
  customer: { id: string; name: string; phone: string | null };
  sale: { saleNumber: string } | null;
}

export default function DebtsPage() {
  const router = useRouter();
  const [data, setData] = useState<Debt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [payDebtId, setPayDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payType, setPayType] = useState("CASH");
  const [paying, setPaying] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (status) params.set("status", status);
    const res = await fetch(`/api/debts?${params}`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination.total); }
    setIsLoading(false);
  }, [page, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selectedDebt = payDebtId ? data.find((d) => d.id === payDebtId) : null;

  const handlePay = async () => {
    if (!payDebtId || !payAmount) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/debts/${payDebtId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(payAmount), type: payType }),
      });
      const result = await res.json();
      if (result.success) { toast.success("To'lov qabul qilindi"); setPayDebtId(null); setPayAmount(""); fetchData(); }
      else toast.error(result.error);
    } finally { setPaying(false); }
  };

  const columns = [
    {
      key: "customer",
      header: "Mijoz",
      cell: (r: Debt) => (
        <div>
          <p className="font-medium">{r.customer.name}</p>
          {r.customer.phone && <p className="text-xs text-muted-foreground">{r.customer.phone}</p>}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Qarz / To'langan",
      cell: (r: Debt) => (
        <div>
          <p className="font-medium">{formatCurrency(r.totalAmount)}</p>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={(Number(r.paidAmount) / Number(r.totalAmount)) * 100} className="h-1.5 flex-1 max-w-24" />
            <span className="text-xs text-muted-foreground">{formatCurrency(r.remainingAmount)} qoldi</span>
          </div>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Muddat",
      cell: (r: Debt) => r.dueDate ? (
        <span className={r.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
          {formatDateShort(r.dueDate)}
          {r.isOverdue && " ⚠️"}
        </span>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: "status",
      header: "Holat",
      cell: (r: Debt) => {
        const s = STATUS_LABELS[r.status] || { label: r.status, variant: "outline" };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "sale", header: "Sotuv", cell: (r: Debt) => r.sale ? <span className="font-mono text-sm">{r.sale.saleNumber}</span> : <span className="text-muted-foreground">—</span> },
    { key: "date", header: "Sana", cell: (r: Debt) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
    {
      key: "actions", header: "", className: "w-20",
      cell: (r: Debt) => (
        <div className="flex gap-1">
          {r.status === "ACTIVE" || r.status === "OVERDUE" ? (
            <Button size="icon" variant="ghost" className="text-green-600" onClick={(e) => { e.stopPropagation(); setPayDebtId(r.id); setPayAmount(String(r.remainingAmount)); }}>
              <DollarSign className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Qarzlar</h1><p className="text-muted-foreground">Jami: {total} ta qarz</p></div>
        <Button variant="outline" onClick={() => router.push("/debts/overdue")}>Muddati o'tganlar</Button>
      </div>

      <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Barcha holatlar" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barcha holatlar</SelectItem>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Qarz topilmadi" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />

      <Dialog open={!!payDebtId} onOpenChange={() => setPayDebtId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Qarz to'lash</DialogTitle></DialogHeader>
          {selectedDebt && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Mijoz:</span><span className="font-medium">{selectedDebt.customer.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Jami qarz:</span><span className="font-medium">{formatCurrency(selectedDebt.totalAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Qolgan:</span><span className="font-bold text-red-600">{formatCurrency(selectedDebt.remainingAmount)}</span></div>
              </div>
              <div className="space-y-2">
                <Label>To'lov summasi (so'm)</Label>
                <Input type="number" min="1" max={selectedDebt.remainingAmount} step="1000" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>To'lov turi</Label>
                <Select value={payType} onValueChange={setPayType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Naqd</SelectItem>
                    <SelectItem value="CARD">Karta</SelectItem>
                    <SelectItem value="TRANSFER">O'tkazma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDebtId(null)}>Bekor</Button>
            <Button onClick={handlePay} disabled={paying || !payAmount}>{paying ? "..." : "To'lash"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
