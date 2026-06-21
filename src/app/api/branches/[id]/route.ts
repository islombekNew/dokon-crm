import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("branches", "update");
  if (error) return error;
  const { id } = await params;
  try {
    const body = await req.json();
    const branch = await prisma.branch.update({
      where: { id },
      data: { name: body.name, address: body.address || null, phone: body.phone || null, email: body.email || null, taxId: body.taxId || null },
    });
    return NextResponse.json(successResponse(branch));
  } catch {
    return NextResponse.json(errorResponse("Server xatosi"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("branches", "delete");
  if (error) return error;
  const { id } = await params;
  await prisma.branch.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json(successResponse(null));
}
