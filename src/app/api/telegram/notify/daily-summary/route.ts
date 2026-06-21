import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";

export async function POST(req: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesAgg, salesCount, expensesAgg] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: today }, status: "COMPLETED" },
        _sum: { totalAmount: true },
      }),
      prisma.sale.count({ where: { createdAt: { gte: today }, status: "COMPLETED" } }),
      prisma.expense.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { amount: true },
      }),
    ]);

    const revenue = Number(salesAgg._sum.totalAmount || 0);
    const expenses = Number(expensesAgg._sum.amount || 0);

    await notificationService.dailySummary(revenue, salesCount, expenses);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
