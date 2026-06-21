import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("employees", "view");
  if (error) return error;
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, include: { role: true, branch: true } });
  if (!user) return NextResponse.json(errorResponse("Topilmadi"), { status: 404 });
  const { passwordHash, ...safe } = user;
  return NextResponse.json(successResponse(safe));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("employees", "update");
  if (error) return error;
  const { id } = await params;
  try {
    const body = await req.json();
    const { password, ...data } = body;
    const user = await prisma.user.update({ where: { id }, data, include: { role: true, branch: true } });
    const { passwordHash, ...safe } = user;
    return NextResponse.json(successResponse(safe));
  } catch {
    return NextResponse.json(errorResponse("Server xatosi"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("employees", "delete");
  if (error) return error;
  const { id } = await params;
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json(successResponse(null));
}
