import { stockService } from "@/services/stock.service";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";

export default async function WarehousePage() {
  const lowStock = await stockService.getLowStock(10);

  const actions = [
    { title: "Kirim", desc: "Mahsulot qabul qilish", href: "/warehouse/stock-in", icon: ArrowDownToLine, color: "bg-green-600 hover:bg-green-700" },
    { title: "Chiqim", desc: "Mahsulot chiqarish", href: "/warehouse/stock-out", icon: ArrowUpFromLine, color: "bg-red-600 hover:bg-red-700" },
    { title: "O'tkazma", desc: "Ombor o'rtasida", href: "/warehouse/transfer", icon: ArrowLeftRight, color: "bg-blue-600 hover:bg-blue-700" },
    { title: "Harakatlar", desc: "Barcha operatsiyalar", href: "/warehouse/movements", icon: Activity, color: "bg-purple-600 hover:bg-purple-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ombor</h1>
        <p className="text-muted-foreground">Ombor boshqaruvi</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {lowStock.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Kam qolgan mahsulotlar ({lowStock.length} ta)</CardTitle>
            <Link href="/warehouse/low-stock" className="ml-auto">
              <Button variant="outline" size="sm">Barchasini ko'rish</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-yellow-100 bg-yellow-50 px-4 py-2">
                  <div>
                    <p className="text-sm font-medium">{item.variant.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.variant.size?.name, item.variant.color?.name].filter(Boolean).join(" / ")} • {item.warehouse.name}
                    </p>
                  </div>
                  <Badge variant={item.quantity === 0 ? "destructive" : "warning"}>
                    {item.quantity} ta
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
