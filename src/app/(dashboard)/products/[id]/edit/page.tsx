"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { variantSchema, type VariantInput } from "@/validators/product.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, RefreshCw, Loader2, Barcode } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [sizes, setSizes] = useState<{ id: string; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: string; name: string; hexCode?: string }[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<VariantInput>({
    resolver: zodResolver(variantSchema),
    defaultValues: { productId: id },
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/sizes").then((r) => r.json()),
      fetch("/api/colors").then((r) => r.json()),
    ]).then(([prod, sz, cl]) => {
      setProduct(prod.data);
      setSizes(sz.data || []);
      setColors(cl.data || []);
      setValue("productId", id);
    });
  }, [id]);

  const generateBarcode = async () => {
    const res = await fetch(`/api/variants/${id}/barcode`);
    const data = await res.json();
    if (data.success) setValue("barcode", data.data.barcode);
  };

  const onSubmit = async (data: VariantInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) { toast.error(result.error || "Xato"); return; }
      const updated = await fetch(`/api/products/${id}`).then((r) => r.json());
      setProduct(updated.data);
      toast.success("Variant qo'shildi");
      reset({ productId: id });
      setIsAdding(false);
    } catch {
      toast.error("Variant qo'shishda xato");
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">Variantlarni boshqarish</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variantlar ({product.variants?.length || 0} ta)</CardTitle>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="mr-2 h-4 w-4" />
            Variant qo'shish
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleSubmit(onSubmit)} className="mb-6 rounded-lg border p-4 space-y-4 bg-muted/30">
              <h3 className="font-medium">Yangi variant</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>O'lcham</Label>
                  <Select onValueChange={(v) => setValue("sizeId", v)}>
                    <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                    <SelectContent>
                      {sizes.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rang</Label>
                  <Select onValueChange={(v) => setValue("colorId", v)}>
                    <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                    <SelectContent>
                      {colors.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: c.hexCode }} />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Shtrixkod *</Label>
                <div className="flex gap-2">
                  <Input placeholder="Shtrixkod" {...register("barcode")} />
                  <Button type="button" variant="outline" onClick={generateBarcode}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {errors.barcode && <p className="text-xs text-red-500">{errors.barcode.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tannarx (ixtiyoriy)</Label>
                  <Input type="number" step="100" placeholder="0" {...register("costPrice")} />
                </div>
                <div className="space-y-2">
                  <Label>Sotish narxi (ixtiyoriy)</Label>
                  <Input type="number" step="100" placeholder="0" {...register("sellPrice")} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Qo'shish
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Bekor qilish</Button>
              </div>
            </form>
          )}

          {product.variants?.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Variant qo'shilmagan</p>
          ) : (
            <div className="space-y-2">
              {product.variants?.map((v: any) => {
                const stock = v.stockItems?.reduce((s: number, si: any) => s + si.quantity, 0) || 0;
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {v.color?.hexCode && (
                        <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: v.color.hexCode }} />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {[v.size?.name, v.color?.name].filter(Boolean).join(" / ") || "Standart"}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{v.barcode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {v.sellPrice && (
                        <span className="text-sm font-medium text-green-700">{formatCurrency(v.sellPrice)}</span>
                      )}
                      <Badge variant={stock === 0 ? "destructive" : stock < 5 ? "warning" : "success"}>
                        {stock} ta
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
