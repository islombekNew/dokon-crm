import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("audit-logs", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize } = getPaginationParams(sp);

  const where = {
    ...(sp.get("module") && { module: sp.get("module")! }),
    ...(sp.get("userId") && { userId: sp.get("userId")! }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return paginatedResponse(data, total, page, pageSize);
}
