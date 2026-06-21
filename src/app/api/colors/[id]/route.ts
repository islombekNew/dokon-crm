import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("colors", "update");
  if (error) return error;
  const body = await req.json();
  const color = await prisma.color.update({ where: { id: params.id }, data: { name: body.name, hexCode: body.hexCode || body.hex } });
  return NextResponse.json(successResponse(color));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("colors", "delete");
  if (error) return error;
  try {
    await prisma.color.delete({ where: { id: params.id } });
    return NextResponse.json(successResponse(null));
  } catch {
    return NextResponse.json(errorResponse("O'chirib bo'lmadi (ishlatilmoqda)"), { status: 400 });
  }
}
