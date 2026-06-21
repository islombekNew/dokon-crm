"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/validators/product.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, costPrice: 0, sellPrice: 0 },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([cats, brands, suppliers]) => {
      setCategories(cats.data || []);
      setBrands(brands.data || []);
      setSuppliers(suppliers.data || []);
    });
  }, []);

  const onSubmit = async (data: ProductInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Mahsulot qo'shildi");
        router.push(`/products/${result.data.id}/edit`);
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yangi mahsulot</h1>
          <p className="text-muted-foreground">Mahsulot ma'lumotlarini kiriting</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Asosiy ma'lumotlar</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mahsulot nomi *</Label>
                  <Input placeholder="Masalan: Nike Air Max" {...register("name")} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Mahsulot haqida qisqa ma'lumot..."
                    {...register("description")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategoriya *</Label>
                    <Select onValueChange={(v) => setValue("categoryId", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Brend</Label>
                    <Select onValueChange={(v) => setValue("brandId", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ta'minotchi</Label>
                  <Select onValueChange={(v) => setValue("supplierId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Narxlar</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tannarx (so'm) *</Label>
                  <Input type="number" min="0" step="100" placeholder="0" {...register("costPrice")} />
                  {errors.costPrice && <p className="text-xs text-red-500">{errors.costPrice.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Sotish narxi (so'm) *</Label>
                  <Input type="number" min="0" step="100" placeholder="0" {...register("sellPrice")} />
                  {errors.sellPrice && <p className="text-xs text-red-500">{errors.sellPrice.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlash...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Saqlash</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
