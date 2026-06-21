"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
  isActive: boolean;
  _count: { products: number };
}

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", contactPerson: "" });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/suppliers?${params}`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination?.total || result.data.length); }
    setIsLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.name) { toast.error("Nom kiritish shart"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await res.json();
      if (result.success) { toast.success("Ta'minotchi qo'shildi"); setOpen(false); setForm({ name: "", phone: "", email: "", address: "", contactPerson: "" }); fetchData(); }
      else toast.error(result.error);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/suppliers/${deleteId}`, { method: "DELETE" });
    if (res.ok) { toast.success("O'chirildi"); fetchData(); }
    else toast.error("O'chirishda xato");
    setDeleteId(null);
  };

  const columns = [
    {
      key: "name", header: "Ta'minotchi",
      cell: (r: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
            <Truck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{r.name}</p>
            {r.contactPerson && <p className="text-xs text-muted-foreground">{r.contactPerson}</p>}
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Telefon", cell: (r: Supplier) => <span className="text-sm text-muted-foreground">{r.phone || "—"}</span> },
    { key: "email", header: "Email", cell: (r: Supplier) => <span className="text-sm text-muted-foreground">{r.email || "—"}</span> },
    { key: "products", header: "Mahsulotlar", cell: (r: Supplier) => <Badge variant="secondary">{r._count?.products || 0}</Badge> },
    { key: "status", header: "Holat", cell: (r: Supplier) => <Badge variant={r.isActive ? "success" : "secondary"}>{r.isActive ? "Faol" : "Nofaol"}</Badge> },
    {
      key: "actions", header: "",
      cell: (r: Supplier) => (
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}>
          O'chirish
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Ta'minotchilar</h1><p className="text-muted-foreground">{total} ta ta'minotchi</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Yangi ta'minotchi</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Qidirish..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Ta'minotchi topilmadi" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi ta'minotchi</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2"><Label>Kompaniya nomi *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Kompaniya nomi" autoFocus /></div>
            <div className="space-y-2"><Label>Aloqa shaxsi</Label><Input value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} placeholder="Ism Familiya" /></div>
            <div className="space-y-2"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998..." /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="info@..." /></div>
            <div className="space-y-2"><Label>Manzil</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Shahar, ko'cha..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>{saving ? "..." : "Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Ta'minotchini o'chirish"
        description="Bu ta'minotchini o'chirmoqchimisiz?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
