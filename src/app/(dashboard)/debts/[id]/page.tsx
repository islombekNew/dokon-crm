import { notFound } from "next/navigation";
import Link from "next/link";
import { debtService } from "@/services/debt.service";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function DebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const debt = await debtService.getById(id);
  if (!debt) notFound();

  const progress = (Number(debt.paidAmount) / Number(debt.totalAmount)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/debts"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Qarz tafsilotlari</h1>
          <p className="text-muted-foreground">{debt.customer.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Qarz holati</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To'langan:</span>
                  <span>{formatCurrency(Number(debt.paidAmount))} / {formatCurrency(Number(debt.totalAmount))}</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-right text-muted-foreground">{Math.round(progress)}% to'langan</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Jami qarz</p>
                  <p className="font-bold text-lg">{formatCurrency(Number(debt.totalAmount))}</p>
                </div>
                <div className="rounded-lg border bg-green-50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">To'langan</p>
                  <p className="font-bold text-lg text-green-700">{formatCurrency(Number(debt.paidAmount))}</p>
                </div>
                <div className="rounded-lg border bg-red-50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Qolgan</p>
                  <p className="font-bold text-lg text-red-700">{formatCurrency(Number(debt.remainingAmount))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>To'lovlar tarixi</CardTitle></CardHeader>
            <CardContent>
              {debt.payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">To'lov yo'q</p>
              ) : (
                <div className="space-y-2">
                  {debt.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(Number(p.amount))}</p>
                        <p className="text-xs text-muted-foreground">{p.type} • {formatDate(p.createdAt)}</p>
                      </div>
                      {p.note && <p className="text-xs text-muted-foreground">{p.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Mijoz</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Ism:</span><span className="font-medium">{debt.customer.name}</span></div>
              {debt.customer.phone && <div className="flex justify-between"><span className="text-muted-foreground">Telefon:</span><span>{debt.customer.phone}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Qarz ma'lumotlari</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {debt.dueDate && <div className="flex justify-between"><span className="text-muted-foreground">Muddat:</span><span>{formatDateShort(debt.dueDate)}</span></div>}
              {debt.sale && <div className="flex justify-between"><span className="text-muted-foreground">Sotuv:</span><span className="font-mono">{debt.sale.saleNumber}</span></div>}
              {debt.note && <div className="flex justify-between"><span className="text-muted-foreground">Izoh:</span><span>{debt.note}</span></div>}
            </CardContent>
          </Card>

          {(debt.status === "ACTIVE" || debt.status === "OVERDUE") && (
            <Link href="/debts">
              <Button className="w-full">Qarz to'lash</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
