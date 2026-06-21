"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Loader2, User, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Naqd", icon: Banknote },
  { value: "CARD", label: "Karta", icon: CreditCard },
  { value: "TRANSFER", label: "O'tkazma", icon: Smartphone },
  { value: "DEBT", label: "Qarz", icon: ReceiptText },
];

export default function POSPage() {
  const { items, addItem, removeItem, updateQuantity, updateDiscount, clearCart, totals } = useCart();
  const [barcode, setBarcode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState<{ id: string; name: string; phone?: string | null }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [branchId, setBranchId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers?pageSize=100").then((r) => r.json()),
      fetch("/api/branches").then((r) => r.json()),
    ]).then(([c, b]) => {
      setCustomers(c.data || []);
      setBranches(b.data || []);
      if (b.data?.[0]) setBranchId(b.data[0].id);
    });
  }, []);

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/variants/search?barcode=${barcode}`);
      const result = await res.json();
      if (!result.success) { toast.error("Mahsulot topilmadi"); return; }
      const v = result.data;
      const stock = v.stockItems.reduce((s: number, si: any) => s + si.quantity, 0);
      addItem({
        variantId: v.id,
        productName: v.product.name,
        barcode: v.barcode,
        size: v.size?.name,
        color: v.color?.name,
        sellPrice: Number(v.sellPrice ?? v.product.sellPrice ?? 0),
        quantity: 1,
        discount: 0,
        maxStock: stock,
      });
      setBarcode("");
      barcodeRef.current?.focus();
    } catch { toast.error("Qidiruvda xato"); }
    finally { setIsSearching(false); }
  };

  const finalTotal = totals.total - discount;
  const change = parseFloat(paidAmount || "0") - finalTotal;

  const handlePayment = async () => {
    if (!branchId) { toast.error("Filial tanlang"); return; }
    if (items.length === 0) { toast.error("Savat bo'sh"); return; }
    const paid = paymentType === "DEBT" ? 0 : parseFloat(paidAmount || "0");
    if (paymentType !== "DEBT" && paid < finalTotal) { toast.error("To'lov summasi yetarli emas"); return; }
    if (paymentType === "DEBT" && !customerId) { toast.error("Qarz uchun mijoz tanlang"); return; }

    setIsSaving(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          customerId: customerId || undefined,
          paymentType,
          paidAmount: paid,
          discount,
          dueDate: dueDate || undefined,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: i.sellPrice,
            discount: i.discount,
          })),
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Sotuv muvaffaqiyatli amalga oshirildi!");
        clearCart();
        setPaymentOpen(false);
        setPaidAmount("");
        setDiscount(0);
        setCustomerId("");
        setDueDate("");
        setPaymentType("CASH");
        barcodeRef.current?.focus();
      } else {
        toast.error(result.error || "Xato");
      }
    } catch { toast.error("Server xatosi"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-muted/30">
      {/* Left: Product search & cart */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b bg-background p-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={barcodeRef}
              placeholder="Shtrixkod yoki mahsulot nomi..."
              className="pl-9 h-11"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
              autoFocus
            />
          </div>
          <Button onClick={handleBarcodeSearch} disabled={isSearching} className="h-11 px-6">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Qidirish"}
          </Button>
        </div>

        {/* Cart items */}
        <ScrollArea className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 opacity-20" />
              <p className="text-lg font-medium">Savat bo'sh</p>
              <p className="text-sm">Shtrixkod yoki mahsulot nomini kiriting</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Card key={item.variantId} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" / ")} • {formatCurrency(item.sellPrice)}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => removeItem(item.variantId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= item.maxStock}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Chegirma:</Label>
                          <Input
                            type="number"
                            min="0"
                            className="h-8 w-24 text-right text-sm"
                            value={item.discount}
                            onChange={(e) => updateDiscount(item.variantId, parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <span className="font-semibold text-green-700 w-28 text-right">
                          {formatCurrency(item.sellPrice * item.quantity - item.discount)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Order summary */}
      <div className="flex w-80 flex-col border-l bg-background">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-bold text-lg">Buyurtma</h2>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" className="text-red-500" onClick={clearCart}>
              <X className="mr-1 h-4 w-4" />Tozalash
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="space-y-2">
            <Label>Filial</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger><SelectValue placeholder="Filial" /></SelectTrigger>
              <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><User className="h-3 w-3" />Mijoz (ixtiyoriy)</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Mijoz tanlang" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Noma'lum mijoz</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} {c.phone && `(${c.phone})`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Umumiy chegirma (so'm)</Label>
            <Input type="number" min="0" step="1000" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mahsulotlar:</span>
              <span>{totals.itemCount} ta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jami:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {(totals.discount + discount) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Chegirma:</span>
                <span>-{formatCurrency(totals.discount + discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>To'lash kerak:</span>
              <span className="text-primary">{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>

        <div className="border-t p-4">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={() => setPaymentOpen(true)}
            disabled={items.length === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            To'lash — {formatCurrency(finalTotal)}
          </Button>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>To'lov</DialogTitle></DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="text-muted-foreground text-sm">To'lash kerak:</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(finalTotal)}</p>
            </div>

            <div className="space-y-2">
              <Label>To'lov turi</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <Button
                    key={m.value}
                    variant={paymentType === m.value ? "default" : "outline"}
                    className="h-12 justify-start gap-2"
                    onClick={() => setPaymentType(m.value)}
                  >
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </Button>
                ))}
              </div>
            </div>

            {paymentType !== "DEBT" && (
              <div className="space-y-2">
                <Label>Berilgan pul (so'm)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder={String(finalTotal)}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  autoFocus
                  className="text-xl h-12 font-semibold"
                />
                {parseFloat(paidAmount || "0") > 0 && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Qaytim:</span>
                      <span className={`font-bold ${change >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {formatCurrency(change)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentType === "DEBT" && (
              <div className="space-y-2">
                <Label>Muddati</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                {!customerId && <p className="text-xs text-red-500">Qarz uchun mijoz tanlash shart</p>}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Bekor qilish</Button>
            <Button onClick={handlePayment} disabled={isSaving} className="min-w-32">
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : "Tasdiqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
