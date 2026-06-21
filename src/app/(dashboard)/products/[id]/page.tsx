import { notFound } from "next/navigation";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Package, Tag } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await productService.getById(id);
  if (!product) notFound();

  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.stockItems.reduce((s, si) => s + si.quantity, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.category.name}</p>
          </div>
        </div>
        <Link href={`/products/${id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Tahrirlash
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Asosiy ma'lumotlar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Kategoriya</p>
                  <p className="font-medium">{product.category.name}</p>
                </div>
                {product.brand && (
                  <div>
                    <p className="text-sm text-muted-foreground">Brend</p>
                    <p className="font-medium">{product.brand.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Tannarx</p>
                  <p className="font-medium">{formatCurrency(product.costPrice as unknown as number)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sotish narxi</p>
                  <p className="font-medium text-green-700">{formatCurrency(product.sellPrice as unknown as number)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jami omborlarda</p>
                  <p className="font-medium">{totalStock} ta</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Holat</p>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Faol" : "Nofaol"}
                  </Badge>
                </div>
              </div>
              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Tavsif</p>
                  <p className="mt-1 text-sm">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Variantlar ({product.variants.length} ta)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.variants.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Variant yo'q</p>
              ) : (
                <div className="space-y-2">
                  {product.variants.map((variant) => {
                    const stock = variant.stockItems.reduce((s, si) => s + si.quantity, 0);
                    return (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          {variant.color && (
                            <div
                              className="h-6 w-6 rounded-full border"
                              style={{ backgroundColor: variant.color.hexCode || "#ccc" }}
                              title={variant.color.name}
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {[variant.size?.name, variant.color?.name].filter(Boolean).join(" / ") || "Standart"}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{variant.barcode}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {variant.sellPrice && (
                            <span className="text-green-700 font-medium">
                              {formatCurrency(variant.sellPrice as unknown as number)}
                            </span>
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

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Ombor holati</CardTitle></CardHeader>
            <CardContent>
              {product.variants.flatMap((v) => v.stockItems).length === 0 ? (
                <p className="text-sm text-muted-foreground">Omborda yo'q</p>
              ) : (
                <div className="space-y-2">
                  {product.variants.map((v) =>
                    v.stockItems.map((si) => (
                      <div key={si.warehouseId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{(si as any).warehouse?.name || "Ombor"}</span>
                        <span className="font-medium">{si.quantity} ta</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
