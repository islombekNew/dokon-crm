import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { saleService } from "@/services/sale.service";
import { createSaleSchema } from "@/validators/sale.schema";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";
import { SaleStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("sales", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize } = getPaginationParams(sp);
  const statusParam = sp.get("status");

  const { data, total } = await saleService.getAll({
    search: sp.get("search") || undefined,
    status: statusParam ? (statusParam as SaleStatus) : undefined,
    branchId: sp.get("branchId") || undefined,
    customerId: sp.get("customerId") || undefined,
    from: sp.get("from") ? new Date(sp.get("from")!) : undefined,
    to: sp.get("to") ? new Date(sp.get("to")!) : undefined,
    page,
    pageSize,
  });

  return paginatedResponse(data, total, page, pageSize);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requirePermission("sales", "create");
  if (error) return error;

  const body = await req.json();
  const parsed = createSaleSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const sale = await saleService.create(parsed.data, user!.userId);
    return successResponse(sale, 201);
  } catch (e: any) {
    return errorResponse(e.message, 400);
  }
}
