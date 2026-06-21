import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("dashboard", "view");
  if (error) return error;

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) { const t = new Date(to); t.setHours(23, 59, 59); dateFilter.lte = t; }

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    include: {
      sales: {
        where: { status: "COMPLETED", ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) },
        select: { totalAmount: true },
      },
      _count: { select: { users: true } },
    },
  });

  const stats = branches.map((b) => ({
    id: b.id,
    name: b.name,
    revenue: b.sales.reduce((s, sale) => s + Number(sale.totalAmount), 0),
    salesCount: b.sales.length,
    employeeCount: b._count.users,
  }));

  return NextResponse.json(successResponse(stats));
}
