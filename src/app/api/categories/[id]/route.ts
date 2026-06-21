import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("categories", "update");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name: body.name, parentId: body.parentId || null },
    });
    return successResponse(category);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("categories", "delete");
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
