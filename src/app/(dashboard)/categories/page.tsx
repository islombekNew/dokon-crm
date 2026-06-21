"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Category { id: string; name: string; parent?: { name: string } | null; _count?: { products: number } }

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/categories");
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditItem(null); setName(""); setOpen(true); };
  const openEdit = (item: Category) => { setEditItem(item); setName(item.name); setOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const url = editItem ? `/api/categories/${editItem.id}` : "/api/categories";
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(editItem ? "Yangilandi" : "Qo'shildi");
        setOpen(false);
        fetchData();
      } else {
        toast.error(result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    if (res.ok) { toast.success("O'chirildi"); fetchData(); }
    else toast.error("O'chirishda xato");
    setDeleteId(null);
  };

  const columns = [
    { key: "name", header: "Kategoriya nomi", cell: (r: Category) => <span className="font-medium">{r.name}</span> },
    { key: "parent", header: "Asosiy kategoriya", cell: (r: Category) => r.parent?.name || <span className="text-muted-foreground">—</span> },
    { key: "products", header: "Mahsulotlar", cell: (r: Category) => <Badge variant="secondary">{r._count?.products || 0} ta</Badge> },
    {
      key: "actions",
      header: "",
      cell: (r: Category) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategoriyalar</h1>
          <p className="text-muted-foreground">{data.length} ta kategoriya</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Yangi kategoriya</Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Kategoriya topilmadi" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Kategoriya nomi</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Erkaklar kiyimi" autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Kategoriyani o'chirish" description="Bu kategoriyani o'chirishni tasdiqlaysizmi?" onConfirm={handleDelete} confirmText="O'chirish" />
    </div>
  );
}
