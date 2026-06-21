import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  const { error } = await requirePermission("branches", "view");
  if (error) return error;

  const branches = await prisma.branch.findMany({
    include: {
      _count: { select: { users: true, warehouses: true } },
    },
    orderBy: { name: "asc" },
  });
  return successResponse(branches);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("branches", "manage");
  if (error) return error;

  const body = await req.json();
  if (!body.name) return errorResponse("Filial nomi kiritilishi shart");

  try {
    const branch = await prisma.branch.create({
      data: {
        name: body.name,
        address: body.address || null,
        phone: body.phone || null,
      },
    });
    // Auto-create default warehouse
    await prisma.warehouse.create({
      data: { name: "Asosiy Ombor", branchId: branch.id, isDefault: true },
    });
    return successResponse(branch, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
