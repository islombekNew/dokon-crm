import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("brands", "update");
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  try {
    const brand = await prisma.brand.update({ where: { id }, data: { name: body.name } });
    return successResponse(brand);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("brands", "delete");
  if (error) return error;
  const { id } = await params;
  try {
    await prisma.brand.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
