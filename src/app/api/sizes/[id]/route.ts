import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("sizes", "update");
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const size = await prisma.size.update({ where: { id }, data: { name: body.name } });
  return NextResponse.json(successResponse(size));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("sizes", "delete");
  if (error) return error;
  const { id } = await params;
  try {
    await prisma.size.delete({ where: { id } });
    return NextResponse.json(successResponse(null));
  } catch {
    return NextResponse.json(errorResponse("O'chirib bo'lmadi (ishlatilmoqda)"), { status: 400 });
  }
}
