import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("settings", "manage");
  if (error) return error;
  const config = await prisma.telegramConfig.findFirst();
  return NextResponse.json(successResponse(config || null));
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("settings", "manage");
  if (error) return error;

  const body = await req.json();
  const { token, chatId, notifications } = body;
  if (!token || !chatId) return NextResponse.json(errorResponse("Token va ChatID shart"), { status: 400 });

  const existing = await prisma.telegramConfig.findFirst();
  const data = { token, chatId, notifications: notifications || {}, isActive: true };
  const config = existing
    ? await prisma.telegramConfig.update({ where: { id: existing.id }, data })
    : await prisma.telegramConfig.create({ data });

  return NextResponse.json(successResponse({ ...config, isConnected: true }));
}
