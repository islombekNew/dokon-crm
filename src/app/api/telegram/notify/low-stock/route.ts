import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";

export async function POST(req: NextRequest) {
  try {
    const lowStockItems = await prisma.stockItem.findMany({
      where: { quantity: { lte: 5 } },
      include: { variant: { include: { product: true } } },
      take: 20,
    });

    const items = lowStockItems.map((item) => ({
      name: item.variant.product.name,
      quantity: item.quantity,
    }));

    await notificationService.lowStock(items);

    return NextResponse.json({ success: true, count: items.length });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
