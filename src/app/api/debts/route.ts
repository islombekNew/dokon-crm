import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { debtService } from "@/services/debt.service";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";
import { DebtStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("debts", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize } = getPaginationParams(sp);
  const statusParam = sp.get("status");

  const { data, total } = await debtService.getAll({
    customerId: sp.get("customerId") || undefined,
    status: statusParam ? (statusParam as DebtStatus) : undefined,
    overdue: sp.get("overdue") === "true",
    page,
    pageSize,
  });
  return paginatedResponse(data, total, page, pageSize);
}
