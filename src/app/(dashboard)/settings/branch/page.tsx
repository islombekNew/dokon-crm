"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Branch { id: string; name: string; address: string | null; phone: string | null; email: string | null; taxId: string | null }

export default function BranchSettingsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", taxId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/branches").then((r) => r.json()).then((result) => {
      if (result.success && result.data.length) {
        setBranches(result.data);
        const first = result.data[0];
        setSelectedId(first.id);
        setForm({ name: first.name || "", address: first.address || "", phone: first.phone || "", email: first.email || "", taxId: first.taxId || "" });
      }
    });
  }, []);

  const selectBranch = (id: string) => {
    const b = branches.find((b) => b.id === id);
    if (!b) return;
    setSelectedId(id);
    setForm({ name: b.name, address: b.address || "", phone: b.phone || "", email: b.email || "", taxId: b.taxId || "" });
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/branches/${selectedId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await res.json();
      if (result.success) {
        toast.success("Filial ma'lumotlari yangilandi");
        setBranches((prev) => prev.map((b) => b.id === selectedId ? { ...b, ...form } : b));
      } else toast.error(result.error);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Filial sozlamalari</h1><p className="text-muted-foreground">Filial ma'lumotlarini tahrirlang</p></div>

      {branches.length > 1 && (
        <div className="space-y-2">
          <Label>Filial tanlash</Label>
          <Select value={selectedId} onValueChange={selectBranch}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Asosiy ma'lumotlar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Filial nomi *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Manzil</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Shahar, ko'cha, uy" /></div>
          <div className="space-y-2"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998..." /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="info@..." /></div>
          <div className="space-y-2"><Label>Soliq ID (STIR)</Label><Input value={form.taxId} onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))} placeholder="..." /></div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : <><Save className="mr-2 h-4 w-4" />Saqlash</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
