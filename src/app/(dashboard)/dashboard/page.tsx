import { getSessionUser } from "@/lib/auth";
import { reportService } from "@/services/report.service";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, ShoppingCart, Users, Package,
  AlertTriangle, CreditCard, DollarSign, Activity
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const summary = await reportService.getDashboardSummary(session.branchId || undefined);

  const stats = [
    {
      title: "Bugungi tushum",
      value: formatCurrency(summary.today.revenue),
      sub: `${summary.today.salesCount} ta sotuv`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Oylik tushum",
      value: formatCurrency(summary.thisMonth.revenue),
      sub: `${summary.thisMonth.salesCount} ta sotuv`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Jami mijozlar",
      value: summary.totalCustomers.toLocaleString(),
      sub: "Faol mijozlar",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Mahsulotlar",
      value: summary.totalProducts.toLocaleString(),
      sub: "Faol mahsulotlar",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Faol qarzlar",
      value: formatCurrency(summary.activeDebts.totalAmount - summary.activeDebts.paidAmount),
      sub: `${summary.activeDebts.count} ta mijoz`,
      icon: CreditCard,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Kam qolgan",
      value: summary.lowStockCount.toString(),
      sub: "Mahsulot turi",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Tizim umumiy ko'rinishi</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tezkor amallar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "POS — Sotuv", href: "/pos", color: "bg-indigo-600 hover:bg-indigo-700 text-white" },
              { label: "Yangi mahsulot", href: "/products/new", color: "bg-green-600 hover:bg-green-700 text-white" },
              { label: "Kirim", href: "/warehouse/stock-in", color: "bg-blue-600 hover:bg-blue-700 text-white" },
              { label: "Qarzlar", href: "/debts", color: "bg-orange-600 hover:bg-orange-700 text-white" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${action.color}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {summary.lowStockCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <span className="font-bold">{summary.lowStockCount}</span> ta mahsulot turi kam qoldi.{" "}
              <a href="/warehouse/low-stock" className="underline hover:text-yellow-900">
                Ko'rish →
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
