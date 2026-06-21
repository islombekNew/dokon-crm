"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Brand { id: string; name: string; _count?: { products: number } }

export default function BrandsPage() {
  const [data, setData] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/brands");
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditItem(null); setName(""); setOpen(true); };
  const openEdit = (item: Brand) => { setEditItem(item); setName(item.name); setOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const url = editItem ? `/api/brands/${editItem.id}` : "/api/brands";
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (res.ok) { toast.success(editItem ? "Yangilandi" : "Qo'shildi"); setOpen(false); fetchData(); }
      else toast.error("Xato");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/brands/${deleteId}`, { method: "DELETE" });
    if (res.ok) { toast.success("O'chirildi"); fetchData(); }
    else toast.error("O'chirishda xato");
    setDeleteId(null);
  };

  const columns = [
    { key: "name", header: "Brend nomi", cell: (r: Brand) => <span className="font-medium">{r.name}</span> },
    { key: "products", header: "Mahsulotlar", cell: (r: Brand) => <Badge variant="secondary">{r._count?.products || 0} ta</Badge> },
    {
      key: "actions", header: "", className: "w-24",
      cell: (r: Brand) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brendlar</h1>
          <p className="text-muted-foreground">{data.length} ta brend</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Yangi brend</Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Brend topilmadi" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Brendni tahrirlash" : "Yangi brend"}</DialogTitle></DialogHeader>
          <div className="py-2 space-y-2">
            <Label>Brend nomi</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Nike" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>{saving ? "..." : "Saqlash"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Brendni o'chirish" description="Bu brendni o'chirishni tasdiqlaysizmi?" onConfirm={handleDelete} confirmText="O'chirish" />
    </div>
  );
}
