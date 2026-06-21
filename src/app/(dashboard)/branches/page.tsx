"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Branch { id: string; name: string; address?: string | null; phone?: string | null; isActive: boolean; _count: { users: number; warehouses: number } }

export default function BranchesPage() {
  const [data, setData] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/branches");
    const result = await res.json();
    if (result.success) setData(result.data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/branches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await res.json();
      if (result.success) { toast.success("Filial qo'shildi"); setOpen(false); setForm({ name: "", address: "", phone: "" }); fetchData(); }
      else toast.error(result.error);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Filiallar</h1><p className="text-muted-foreground">{data.length} ta filial</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Yangi filial</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((branch) => (
          <Card key={branch.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    {branch.address && <p className="text-xs text-muted-foreground">{branch.address}</p>}
                  </div>
                </div>
                <Badge variant={branch.isActive ? "success" : "secondary"}>{branch.isActive ? "Faol" : "Nofaol"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="font-medium text-foreground">{branch._count.users}</span> xodim
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="font-medium text-foreground">{branch._count.warehouses}</span> ombor
                </div>
              </div>
              {branch.phone && <p className="mt-2 text-sm text-muted-foreground">{branch.phone}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi filial</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2"><Label>Filial nomi *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Masalan: Asosiy Filial" autoFocus /></div>
            <div className="space-y-2"><Label>Manzil</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Shahar, ko'cha..." /></div>
            <div className="space-y-2"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>{saving ? "..." : "Yaratish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
