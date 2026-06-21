"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Color { id: string; name: string; hexCode?: string | null }

export default function ColorsPage() {
  const [data, setData] = useState<Color[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("#000000");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/colors");
    const result = await res.json();
    if (result.success) setData(result.data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hexCode }),
      });
      if (res.ok) { toast.success("Rang qo'shildi"); setOpen(false); setName(""); setHexCode("#000000"); fetchData(); }
      else { const r = await res.json(); toast.error(r.error); }
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ranglar</h1>
          <p className="text-muted-foreground">{data.length} ta rang</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Yangi rang</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {data.map((color) => (
          <div key={color.id} className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="h-12 w-12 rounded-full border-2 border-border shadow-inner"
              style={{ backgroundColor: color.hexCode || "#ccc" }}
            />
            <span className="text-sm font-medium text-center">{color.name}</span>
            {color.hexCode && <span className="font-mono text-xs text-muted-foreground">{color.hexCode}</span>}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi rang</DialogTitle></DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label>Rang nomi</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Qizil" autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Rang kodi (HEX)</Label>
              <div className="flex gap-3 items-center">
                <input type="color" value={hexCode} onChange={(e) => setHexCode(e.target.value)} className="h-10 w-14 rounded cursor-pointer border" />
                <Input value={hexCode} onChange={(e) => setHexCode(e.target.value)} placeholder="#000000" className="font-mono flex-1" />
              </div>
            </div>
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
