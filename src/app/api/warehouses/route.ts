import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("warehouse", "view");
  if (error) return error;

  const branchId = req.nextUrl.searchParams.get("branchId");
  const warehouses = await prisma.warehouse.findMany({
    where: branchId ? { branchId } : {},
    include: {
      branch: { select: { name: true } },
      _count: { select: { stockItems: true } },
    },
    orderBy: { name: "asc" },
  });
  return successResponse(warehouses);
}
