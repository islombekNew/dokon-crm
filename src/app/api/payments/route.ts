import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("payments", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize, skip } = getPaginationParams(sp);
  const method = sp.get("method");
  const from = sp.get("from");
  const to = sp.get("to");

  const where: Record<string, any> = {};
  if (method) where.type = method;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) { const d = new Date(to); d.setHours(23, 59, 59); where.createdAt.lte = d; }
  }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        debt: { select: { totalAmount: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(data, total, page, pageSize));
}
