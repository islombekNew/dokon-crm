import { notFound } from "next/navigation";
import Link from "next/link";
import { saleService } from "@/services/sale.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; variant: any }> = {
  COMPLETED: { label: "Yakunlangan", variant: "success" },
  PENDING: { label: "Kutilmoqda", variant: "warning" },
  CANCELLED: { label: "Bekor qilingan", variant: "destructive" },
  RETURNED: { label: "Qaytarilgan", variant: "secondary" },
};

const PAYMENT_LABELS: Record<string, string> = { CASH: "Naqd", CARD: "Karta", TRANSFER: "O'tkazma", MIXED: "Aralash", DEBT: "Qarz" };

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await saleService.getById(id);
  if (!sale) notFound();

  const status = STATUS_LABELS[sale.status] || { label: sale.status, variant: "outline" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold font-mono">{sale.saleNumber}</h1>
            <p className="text-muted-foreground">{formatDate(sale.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={status.variant} className="text-sm px-3 py-1">{status.label}</Badge>
          {sale.status === "COMPLETED" && (
            <form action={`/api/sales/${id}/cancel`} method="POST">
              <Button variant="destructive" size="sm" type="submit">Bekor qilish</Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Mahsulotlar</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahsulot</TableHead>
                    <TableHead className="text-right">Narx</TableHead>
                    <TableHead className="text-right">Miqdor</TableHead>
                    <TableHead className="text-right">Chegirma</TableHead>
                    <TableHead className="text-right">Jami</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.variant.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[item.variant.size?.name, item.variant.color?.name].filter(Boolean).join(" / ")}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.unitPrice))}</TableCell>
                      <TableCell className="text-right">{item.quantity} ta</TableCell>
                      <TableCell className="text-right">{item.discount ? formatCurrency(Number(item.discount)) : "—"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(Number(item.unitPrice) * item.quantity - Number(item.discount))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Sotuv ma'lumotlari</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Mijoz:</span><span>{sale.customer?.name || "Noma'lum"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sotuvchi:</span><span>{sale.user.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Filial:</span><span>{sale.branch.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">To'lov turi:</span><span>{PAYMENT_LABELS[sale.paymentType] || sale.paymentType}</span></div>
              {sale.note && <div className="flex justify-between"><span className="text-muted-foreground">Izoh:</span><span>{sale.note}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jami:</span>
                <span>{formatCurrency(Number(sale.totalAmount))}</span>
              </div>
              {Number(sale.discount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Chegirma:</span>
                  <span>-{formatCurrency(Number(sale.discount))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">To'langan:</span>
                <span className="text-green-700 font-medium">{formatCurrency(Number(sale.paidAmount))}</span>
              </div>
              {Number(sale.totalAmount) > Number(sale.paidAmount) && (
                <div className="flex justify-between text-red-600 font-medium border-t pt-2">
                  <span>Qarz:</span>
                  <span>{formatCurrency(Number(sale.totalAmount) - Number(sale.paidAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Jami to'lov:</span>
                <span className="text-primary">{formatCurrency(Number(sale.totalAmount))}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
