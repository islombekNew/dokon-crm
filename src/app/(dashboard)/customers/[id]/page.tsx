import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      sales: { include: { items: { include: { variant: { include: { product: true } } } } }, orderBy: { createdAt: "desc" }, take: 10 },
      debts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const totalSales = customer.sales.reduce((s, sale) => s + Number(sale.totalAmount), 0);
  const totalDebt = customer.debts.filter((d) => d.status !== "PAID").reduce((s, d) => s + (Number(d.totalAmount) - Number(d.paidAmount)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={customer.isActive ? "success" : "secondary"}>{customer.isActive ? "Faol" : "Nofaol"}</Badge>
            <span className="text-sm text-muted-foreground">{formatDate(customer.createdAt.toISOString())}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Jami sotuvlar", value: formatCurrency(totalSales), icon: CreditCard, color: "text-blue-600" },
          { label: "Savdo soni", value: `${customer.sales.length} ta`, icon: Calendar, color: "text-green-600" },
          { label: "Aktiv qarz", value: formatCurrency(totalDebt), icon: CreditCard, color: "text-red-600" },
          { label: "Qarz soni", value: `${customer.debts.length} ta`, icon: CreditCard, color: "text-orange-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Mijoz ma'lumotlari</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {customer.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-muted-foreground shrink-0">Manzil:</span>
                <span>{customer.address}</span>
              </div>
            )}
            {customer.note && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-muted-foreground shrink-0">Izoh:</span>
                <span>{customer.note}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">So'nggi qarzlar</CardTitle></CardHeader>
          <CardContent>
            {customer.debts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Qarz yo'q</p>
            ) : (
              <div className="space-y-2">
                {customer.debts.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(Number(debt.totalAmount))}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(debt.createdAt.toISOString())}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={debt.status === "PAID" ? "success" : debt.status === "OVERDUE" ? "destructive" : "warning"}>
                        {debt.status === "PAID" ? "To'landi" : debt.status === "OVERDUE" ? "Muddati o'tdi" : "Kutilmoqda"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(Number(debt.totalAmount) - Number(debt.paidAmount))} qoldi
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">So'nggi sotuvlar</CardTitle></CardHeader>
        <CardContent>
          {customer.sales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sotuv yo'q</p>
          ) : (
            <div className="space-y-2">
              {customer.sales.map((sale) => (
                <Link key={sale.id} href={`/sales/${sale.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{sale.saleNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt.toISOString())} · {sale.items.length} ta mahsulot</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(Number(sale.totalAmount))}</p>
                    <Badge variant={sale.status === "COMPLETED" ? "success" : sale.status === "CANCELLED" ? "destructive" : "secondary"} className="mt-1">
                      {sale.status === "COMPLETED" ? "Yakunlandi" : sale.status === "CANCELLED" ? "Bekor" : "Qaytarildi"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
