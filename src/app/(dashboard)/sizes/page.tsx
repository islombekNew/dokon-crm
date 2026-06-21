"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import { toast } from "sonner";

interface Size { id: string; name: string; sortOrder: number }

export default function SizesPage() {
  const [data, setData] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/sizes");
    const result = await res.json();
    if (result.success) setData(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sortOrder: data.length }),
      });
      if (res.ok) { toast.success("O'lcham qo'shildi"); setOpen(false); setName(""); fetchData(); }
      else { const r = await res.json(); toast.error(r.error); }
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "name", header: "O'lcham", cell: (r: Size) => <span className="font-medium text-lg">{r.name}</span> },
    { key: "sortOrder", header: "Tartib", cell: (r: Size) => <span className="text-muted-foreground">{r.sortOrder}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">O'lchamlar</h1>
          <p className="text-muted-foreground">{data.length} ta o'lcham</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Yangi o'lcham</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {data.map((s) => (
          <div key={s.id} className="flex items-center justify-center rounded-lg border bg-card p-4 font-semibold text-lg shadow-sm hover:border-primary transition-colors">
            {s.name}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi o'lcham</DialogTitle></DialogHeader>
          <div className="py-2 space-y-2">
            <Label>O'lcham nomi</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: XL, 42, 38..." autoFocus onKeyDown={(e) => e.key === "Enter" && handleSave()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>{saving ? "..." : "Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
