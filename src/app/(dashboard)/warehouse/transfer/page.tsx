"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function TransferPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [maxStock, setMaxStock] = useState(0);
  const [note, setNote] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/warehouses").then((r) => r.json()), fetch("/api/branches").then((r) => r.json())])
      .then(([w, b]) => { setWarehouses(w.data || []); setBranches(b.data || []); });
  }, []);

  const handleSearch = async () => {
    if (!barcode.trim() || !fromWarehouseId) { toast.error("Avval ombor va shtrixkod kiriting"); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/variants/search?barcode=${barcode}`);
      const result = await res.json();
      if (!result.success) { toast.error("Mahsulot topilmadi"); return; }
      const v = result.data;
      const stockItem = v.stockItems.find((s: any) => s.warehouseId === fromWarehouseId);
      const stock = stockItem?.quantity || 0;
      if (stock === 0) { toast.error("Bu omborда mahsulot yo'q"); return; }
      setVariantId(v.id);
      setProductName(`${v.product.name} (${[v.size?.name, v.color?.name].filter(Boolean).join(" / ") || "standart"})`);
      setMaxStock(stock);
      setQuantity(1);
    } finally { setIsSearching(false); }
  };

  const handleSave = async () => {
    if (!fromWarehouseId || !toWarehouseId || !variantId || !branchId) { toast.error("Barcha maydonlarni to'ldiring"); return; }
    if (fromWarehouseId === toWarehouseId) { toast.error("Bir xil omborni tanlab bo'lmaydi"); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/stock-movements/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, fromWarehouseId, toWarehouseId, quantity, branchId, note }),
      });
      if (res.ok) { toast.success("O'tkazma amalga oshirildi"); router.push("/warehouse"); }
      else { const r = await res.json(); toast.error(r.error); }
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold">O'tkazma</h1><p className="text-muted-foreground">Omborlar o'rtasida mahsulot o'tkazish</p></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Omborlar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Filial</Label>
              <Select onValueChange={setBranchId}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <Label>Qayerdan</Label>
                <Select onValueChange={setFromWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Manba ombor" /></SelectTrigger>
                  <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <ArrowRight className="mt-6 h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 space-y-2">
                <Label>Qayerga</Label>
                <Select onValueChange={setToWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Maqsad ombor" /></SelectTrigger>
                  <SelectContent>{warehouses.filter((w) => w.id !== fromWarehouseId).map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mahsulot</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Shtrixkod</Label>
              <div className="flex gap-2">
                <Input placeholder="Shtrixkod..." value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {productName && (
              <>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-medium text-sm">{productName}</p>
                  <p className="text-xs text-muted-foreground">Mavjud: {maxStock} ta</p>
                </div>
                <div className="space-y-2">
                  <Label>Miqdor</Label>
                  <Input type="number" min="1" max={maxStock} value={quantity} onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, maxStock))} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Izoh</Label>
              <Input placeholder="Izoh (ixtiyoriy)" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={isSaving || !variantId}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />O'tkazilmoqda...</> : "O'tkazmani tasdiqlash"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
