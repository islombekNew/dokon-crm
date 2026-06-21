import { stockService } from "@/services/stock.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LowStockPage() {
  const items = await stockService.getLowStock(10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kam qolgan mahsulotlar</h1>
          <p className="text-muted-foreground">{items.length} ta mahsulot turi 10 tadan kam</p>
        </div>
        <Link href="/warehouse/stock-in">
          <Button>Kirim qilish</Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-700">Barcha mahsulotlar yetarli!</p>
            <p className="text-muted-foreground">Ombordagi barcha mahsulotlar minimal chegaradan yuqori.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className={`flex items-center justify-between rounded-lg border p-4 ${item.quantity === 0 ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${item.quantity === 0 ? "text-red-600" : "text-yellow-600"}`} />
                <div>
                  <p className="font-medium">{item.variant.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[item.variant.size?.name, item.variant.color?.name].filter(Boolean).join(" / ")} • {item.warehouse.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant={item.quantity === 0 ? "destructive" : "warning"} className="text-sm">
                    {item.quantity} ta
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">min: {item.minQuantity} ta</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
