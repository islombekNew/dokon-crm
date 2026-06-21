"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["Ijara", "Kommunal xarajatlar", "Ish haqi", "Reklama", "Transport", "Ofis jihozlari", "Boshqa"];

interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryName: string;
  createdAt: string;
  note: string | null;
  branch: { name: string };
  user: { name: string };
}

export default function ExpensesPage() {
  const [data, setData] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", categoryName: "", branchId: "", note: "" });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/expenses?page=${page}&pageSize=20`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination.total); }
    setIsLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetch("/api/branches").then((r) => r.json()).then((r) => setBranches(r.data || [])); }, []);

  const handleSave = async () => {
    if (!form.title || !form.amount || !form.categoryName || !form.branchId) { toast.error("Barcha maydonlarni to'ldiring"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await res.json();
      if (result.success) { toast.success("Xarajat qo'shildi"); setOpen(false); setForm({ title: "", amount: "", categoryName: "", branchId: "", note: "" }); fetchData(); }
      else toast.error(result.error);
    } finally { setSaving(false); }
  };

  const totalAmount = data.reduce((s, e) => s + Number(e.amount), 0);

  const columns = [
    { key: "title", header: "Xarajat", cell: (r: Expense) => <span className="font-medium">{r.title}</span> },
    { key: "category", header: "Kategoriya", cell: (r: Expense) => r.categoryName },
    { key: "amount", header: "Summa", cell: (r: Expense) => <span className="font-semibold text-red-600">{formatCurrency(r.amount)}</span> },
    { key: "branch", header: "Filial", cell: (r: Expense) => <span className="text-muted-foreground">{r.branch.name}</span> },
    { key: "user", header: "Xodim", cell: (r: Expense) => <span className="text-muted-foreground">{r.user.name}</span> },
    { key: "date", header: "Sana", cell: (r: Expense) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Xarajatlar</h1><p className="text-muted-foreground">{total} ta xarajat</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Xarajat qo'shish</Button>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-4">
          <Receipt className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">Jami xarajatlar: <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span></p>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Xarajat topilmadi" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi xarajat</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2"><Label>Xarajat nomi *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Masalan: Ijara to'lovi" autoFocus /></div>
            <div className="space-y-2"><Label>Summa *</Label><Input type="number" min="1" step="1000" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>
            <div className="space-y-2">
              <Label>Kategoriya *</Label>
              <Select value={form.categoryName} onValueChange={(v) => setForm((f) => ({ ...f, categoryName: v }))}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filial *</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Izoh</Label><Input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Ixtiyoriy" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "..." : "Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
