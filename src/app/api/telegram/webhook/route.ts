import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat?.id?.toString();
    const text = (message.text || "").trim().toLowerCase();

    const config = await prisma.telegramConfig.findFirst({ where: { isActive: true } });
    if (!config || config.chatId !== chatId) return NextResponse.json({ ok: true });

    let replyText = "";

    if (text === "/start") {
      replyText = "👋 RetailCRM botiga xush kelibsiz!\n\nMavjud buyruqlar:\n/stats — bugungi statistika\n/lowstock — kam qoldiqlar\n/help — yordam";
    } else if (text === "/stats") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [salesCount, revenue] = await Promise.all([
        prisma.sale.count({ where: { createdAt: { gte: today }, status: "COMPLETED" } }),
        prisma.sale.aggregate({ where: { createdAt: { gte: today }, status: "COMPLETED" }, _sum: { totalAmount: true } }),
      ]);
      const rev = Number(revenue._sum.totalAmount || 0);
      replyText = `📊 Bugungi statistika:\n\n💰 Tushum: ${rev.toLocaleString("uz-UZ")} so'm\n🛍 Sotuvlar: ${salesCount} ta`;
    } else if (text === "/lowstock") {
      const items = await prisma.stockItem.findMany({
        where: { quantity: { lte: 5 } },
        include: { variant: { include: { product: true } } },
        take: 10,
      });
      if (items.length === 0) {
        replyText = "✅ Barcha mahsulotlar yetarli!";
      } else {
        const lines = items.map((i) => `• ${i.variant.product.name} — ${i.quantity} ta`).join("\n");
        replyText = `⚠️ Kam qoldiq mahsulotlar:\n\n${lines}`;
      }
    } else if (text === "/help") {
      replyText = "❓ Yordam:\n\n/stats — bugungi statistika\n/lowstock — kam qoldiqlar";
    } else {
      replyText = "❓ Noma'lum buyruq. /help ni kiriting.";
    }

    if (replyText && config.token) {
      await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: replyText }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
