"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Item { variantId: string; productName: string; barcode: string; size?: string; color?: string; quantity: number; maxStock: number }

export default function StockOutPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [note, setNote] = useState("");
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/warehouses").then((r) => r.json()),
      fetch("/api/branches").then((r) => r.json()),
    ]).then(([w, b]) => {
      setWarehouses(w.data || []);
      setBranches(b.data || []);
    });
  }, []);

  const handleSearch = async () => {
    if (!barcode.trim() || !warehouseId) { toast.error("Avval ombor tanlang"); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/variants/search?barcode=${barcode}`);
      const result = await res.json();
      if (!result.success) { toast.error("Mahsulot topilmadi"); return; }
      const v = result.data;
      const stockItem = v.stockItems.find((s: any) => s.warehouseId === warehouseId);
      const maxStock = stockItem?.quantity || 0;
      if (maxStock === 0) { toast.error("Bu omborда mahsulot yo'q"); return; }
      const existing = items.find((i) => i.variantId === v.id);
      if (existing) {
        setItems((prev) => prev.map((i) => i.variantId === v.id ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) } : i));
      } else {
        setItems((prev) => [...prev, { variantId: v.id, productName: v.product.name, barcode: v.barcode, size: v.size?.name, color: v.color?.name, quantity: 1, maxStock }]);
      }
      setBarcode("");
    } finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!warehouseId || !branchId || items.length === 0) { toast.error("Barcha maydonlarni to'ldiring"); return; }
    setIsSaving(true);
    try {
      await Promise.all(
        items.map((item) =>
          fetch("/api/stock-movements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _type: "OUT", variantId: item.variantId, warehouseId, quantity: item.quantity, branchId, note }),
          })
        )
      );
      toast.success("Chiqim amalga oshirildi");
      router.push("/warehouse");
    } catch { toast.error("Xato"); } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold">Chiqim</h1><p className="text-muted-foreground">Ombordan mahsulot chiqarish</p></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input placeholder="Shtrixkod..." value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} autoFocus />
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {items.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Chiqim ro'yxati</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {items.map((item, i) => (
                  <div key={item.variantId} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{[item.size, item.color].filter(Boolean).join(" / ")} • Omborda: {item.maxStock} ta</p>
                    </div>
                    <Input type="number" min="1" max={item.maxStock} value={item.quantity} className="w-20 text-center" onChange={(e) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, quantity: Math.min(parseInt(e.target.value) || 1, it.maxStock) } : it))} />
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Filial *</Label>
                <Select onValueChange={setBranchId}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ombor *</Label>
                <Select onValueChange={setWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Izoh</Label>
                <Input placeholder="Izoh" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Button className="w-full" onClick={handleSave} disabled={isSaving || items.length === 0}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : "Chiqimni tasdiqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
