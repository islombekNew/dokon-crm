import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";

export async function POST(req: NextRequest) {
  try {
    const now = new Date();
    const overdueDebts = await prisma.debt.findMany({
      where: { status: { in: ["ACTIVE", "OVERDUE"] }, dueDate: { lt: now } },
      include: { customer: true },
      take: 10,
    });

    await prisma.debt.updateMany({
      where: { status: "ACTIVE", dueDate: { lt: now } },
      data: { status: "OVERDUE" },
    });

    for (const debt of overdueDebts) {
      const daysOverdue = Math.floor((now.getTime() - (debt.dueDate?.getTime() || 0)) / 86400000);
      const remaining = Number(debt.totalAmount) - Number(debt.paidAmount);
      await notificationService.overdueDebt(debt.customer.name, remaining, daysOverdue);
    }

    return NextResponse.json({ success: true, count: overdueDebts.length });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
