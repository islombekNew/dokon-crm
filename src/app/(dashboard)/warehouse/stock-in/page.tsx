"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface StockItem {
  variantId: string;
  productName: string;
  barcode: string;
  size?: string;
  color?: string;
  quantity: number;
  unitCost: number;
}

export default function StockInPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [note, setNote] = useState("");
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
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

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/variants/search?barcode=${barcode}`);
      const result = await res.json();
      if (!result.success) { toast.error("Mahsulot topilmadi"); return; }
      const v = result.data;
      const existing = items.find((i) => i.variantId === v.id);
      if (existing) {
        setItems((prev) => prev.map((i) => i.variantId === v.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setItems((prev) => [...prev, {
          variantId: v.id,
          productName: v.product.name,
          barcode: v.barcode,
          size: v.size?.name,
          color: v.color?.name,
          quantity: 1,
          unitCost: Number(v.product.costPrice || 0),
        }]);
      }
      setBarcode("");
    } finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!warehouseId || !branchId || items.length === 0) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all(
        items.map((item) =>
          fetch("/api/stock-movements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              variantId: item.variantId,
              warehouseId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              branchId,
              note,
            }),
          })
        )
      );
      toast.success(`${items.length} ta mahsulot omborga kiritildi`);
      router.push("/warehouse");
    } catch { toast.error("Xato yuz berdi"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Kirim</h1>
          <p className="text-muted-foreground">Omborga mahsulot qabul qilish</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Shtrixkod bilan qidirish</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Shtrixkod kiriting yoki skaner qiling..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
                  autoFocus
                />
                <Button onClick={handleBarcodeSearch} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {items.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Kirim ro'yxati ({items.length} ta tur)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={item.variantId} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" / ")} • {item.barcode}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        className="w-20 text-center"
                        onChange={(e) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, quantity: parseInt(e.target.value) || 1 } : it))}
                      />
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        value={item.unitCost}
                        className="w-32"
                        placeholder="Tannarx"
                        onChange={(e) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, unitCost: parseFloat(e.target.value) || 0 } : it))}
                      />
                      <Button size="icon" variant="ghost" className="text-red-500 shrink-0" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Sozlamalar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Filial *</Label>
                <Select onValueChange={setBranchId}>
                  <SelectTrigger><SelectValue placeholder="Filial tanlang" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ombor *</Label>
                <Select onValueChange={setWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Ombor tanlang" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Izoh</Label>
                <Input placeholder="Izoh (ixtiyoriy)" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mahsulot turlari:</span>
                  <span className="font-medium">{items.length} ta</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jami miqdor:</span>
                  <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)} ta</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Jami summa:</span>
                  <span className="font-bold">{formatCurrency(items.reduce((s, i) => s + i.quantity * i.unitCost, 0))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSave} disabled={isSaving || items.length === 0}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : "Omborga kiritish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
