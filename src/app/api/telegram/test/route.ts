import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("settings", "manage");
  if (error) return error;

  const config = await prisma.telegramConfig.findFirst({ where: { isActive: true } });
  if (!config) return NextResponse.json(errorResponse("Telegram bot sozlanmagan"), { status: 400 });

  const res = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: config.chatId, text: "✅ RetailCRM — Telegram bot muvaffaqiyatli ulandi!", parse_mode: "HTML" }),
  });
  const data = await res.json();
  if (!data.ok) return NextResponse.json(errorResponse("Xabar yuborilmadi: " + data.description), { status: 400 });
  return NextResponse.json(successResponse(null));
}
