import { debtService } from "@/services/debt.service";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default async function OverdueDebtsPage() {
  const debts = await debtService.getOverdueDebts();
  const totalAmount = debts.reduce((s, d) => s + (Number(d.totalAmount) - Number(d.paidAmount)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Muddati o'tgan qarzlar</h1>
        <p className="text-muted-foreground">
          {debts.length} ta qarz • Jami: {formatCurrency(totalAmount)}
        </p>
      </div>

      {debts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-700">Muddati o'tgan qarz yo'q!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => {
            const remaining = Number(debt.totalAmount) - Number(debt.paidAmount);
            const daysOverdue = debt.dueDate ? Math.floor((new Date().getTime() - new Date(debt.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            return (
              <div key={debt.id} className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <p className="font-semibold">{debt.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {debt.customer.phone && `${debt.customer.phone} • `}
                      Muddat: {debt.dueDate ? formatDateShort(debt.dueDate) : "Belgilanmagan"}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-red-700 text-lg">{formatCurrency(remaining)}</p>
                  <Badge variant="destructive">{daysOverdue} kun o'tdi</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
