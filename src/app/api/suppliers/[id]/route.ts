import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("suppliers", "view");
  if (error) return error;
  const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
  if (!supplier) return NextResponse.json(errorResponse("Topilmadi"), { status: 404 });
  return NextResponse.json(successResponse(supplier));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("suppliers", "update");
  if (error) return error;
  try {
    const body = await req.json();
    const supplier = await prisma.supplier.update({ where: { id: params.id }, data: body });
    return NextResponse.json(successResponse(supplier));
  } catch {
    return NextResponse.json(errorResponse("Server xatosi"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("suppliers", "delete");
  if (error) return error;
  await prisma.supplier.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json(successResponse(null));
}
