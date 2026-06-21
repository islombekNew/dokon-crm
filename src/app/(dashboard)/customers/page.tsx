"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  balance: number;
  isActive: boolean;
  _count: { sales: number; debts: number };
}

export default function CustomersPage() {
  const router = useRouter();
  const [data, setData] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/customers?${params}`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination.total); }
    setIsLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditItem(null); setForm({ name: "", phone: "", address: "" }); setOpen(true); };
  const openEdit = (item: Customer) => { setEditItem(item); setForm({ name: item.name, phone: item.phone || "", address: item.address || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const url = editItem ? `/api/customers/${editItem.id}` : "/api/customers";
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await res.json();
      if (result.success) { toast.success(editItem ? "Yangilandi" : "Mijoz qo'shildi"); setOpen(false); fetchData(); }
      else toast.error(result.error);
    } finally { setSaving(false); }
  };

  const columns = [
    {
      key: "name",
      header: "Mijoz",
      cell: (r: Customer) => (
        <div>
          <p className="font-medium">{r.name}</p>
          {r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}
        </div>
      ),
    },
    { key: "address", header: "Manzil", cell: (r: Customer) => r.address || <span className="text-muted-foreground">—</span> },
    { key: "sales", header: "Sotuvlar", cell: (r: Customer) => <Badge variant="secondary">{r._count.sales} ta</Badge> },
    { key: "debts", header: "Qarzlar", cell: (r: Customer) => <Badge variant={r._count.debts > 0 ? "destructive" : "secondary"}>{r._count.debts} ta</Badge> },
    {
      key: "actions", header: "", className: "w-24",
      cell: (r: Customer) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); router.push(`/customers/${r.id}`); }}><Eye className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }}><Edit className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Mijozlar</h1><p className="text-muted-foreground">Jami: {total} ta</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Yangi mijoz</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Ism yoki telefon..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Mijoz topilmadi" onRowClick={(r) => router.push(`/customers/${r.id}`)} />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Mijozni tahrirlash" : "Yangi mijoz"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Ism *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="To'liq ism" autoFocus /></div>
            <div className="space-y-2"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998901234567" /></div>
            <div className="space-y-2"><Label>Manzil</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Manzil (ixtiyoriy)" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>{saving ? "..." : "Saqlash"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
